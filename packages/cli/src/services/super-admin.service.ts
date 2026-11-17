import {
	GLOBAL_ADMIN_ROLE,
	GLOBAL_OWNER_ROLE,
	PersonRepository,
	SettingsRepository,
	UserRepository,
} from '@n8n/db';
import { Service } from '@n8n/di';
import { createHmac, timingSafeEqual } from 'node:crypto';

import config from '@/config';

export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type TenantStatus = 'active' | 'suspended';

export interface SuperAdminTenantRecord {
	ownerId: string;
	plan: TenantPlan;
	status: TenantStatus;
	createdAt: string;
	notes?: string;
	memberIds: string[];
}

export interface SuperAdminRegistry {
	tenants: Record<string, SuperAdminTenantRecord>;
	suspendedUserIds: string[];
}

export interface SuperAdminUserView {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	isPending: boolean;
	status: TenantStatus;
	createdAt: string;
	lastActiveAt: string | null;
}

export interface SuperAdminTenantView extends SuperAdminUserView {
	plan: TenantPlan;
	notes: string;
	members: SuperAdminUserView[];
}

const REGISTRY_KEY = 'ieautom8n.superAdminRegistry';
const CACHE_TTL_MS = 5000;
const COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Service()
export class SuperAdminService {
	private cachedRegistry: { value: SuperAdminRegistry; loadedAt: number } | null = null;

	constructor(
		private readonly settingsRepository: SettingsRepository,
		private readonly userRepository: UserRepository,
		private readonly personRepository: PersonRepository,
	) {}

	getConfiguredCredentials(): { email: string; password: string } {
		return {
			email: (process.env.SUPER_ADMIN_EMAIL || 'superadmin@ieenterprises.ai').trim().toLowerCase(),
			password: process.env.SUPER_ADMIN_PASSWORD || 'ieAutom8n!SuperAdmin2026',
		};
	}

	private getSigningSecret(): string {
		return process.env.SUPER_ADMIN_SECRET || config.get('encryptionKey') || 'ieautom8n-super-admin';
	}

	signSessionToken(email: string): string {
		const payload = Buffer.from(
			JSON.stringify({ email, exp: Date.now() + COOKIE_TTL_MS }),
			'utf8',
		).toString('base64url');
		const sig = createHmac('sha256', this.getSigningSecret()).update(payload).digest('base64url');
		return `${payload}.${sig}`;
	}

	verifySessionToken(token: string | undefined): { email: string } | null {
		if (!token || !token.includes('.')) return null;
		const [payload, sig] = token.split('.');
		if (!payload || !sig) return null;
		const expectedSig = createHmac('sha256', this.getSigningSecret())
			.update(payload)
			.digest('base64url');
		const sigBuf = Buffer.from(sig);
		const expectedBuf = Buffer.from(expectedSig);
		if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
			return null;
		}
		try {
			const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
				email?: string;
				exp?: number;
			};
			if (!parsed.email || !parsed.exp || Date.now() > parsed.exp) return null;
			return { email: parsed.email };
		} catch {
			return null;
		}
	}

	private async loadRegistry(): Promise<SuperAdminRegistry> {
		if (this.cachedRegistry && Date.now() - this.cachedRegistry.loadedAt < CACHE_TTL_MS) {
			return this.cachedRegistry.value;
		}
		const row = await this.settingsRepository.findOne({ where: { key: REGISTRY_KEY } });
		let registry: SuperAdminRegistry = { tenants: {}, suspendedUserIds: [] };
		if (row?.value) {
			try {
				const parsed = JSON.parse(row.value) as Partial<SuperAdminRegistry>;
				registry = {
					tenants: parsed.tenants && typeof parsed.tenants === 'object' ? parsed.tenants : {},
					suspendedUserIds: Array.isArray(parsed.suspendedUserIds) ? parsed.suspendedUserIds : [],
				};
			} catch {
				registry = { tenants: {}, suspendedUserIds: [] };
			}
		}
		this.cachedRegistry = { value: registry, loadedAt: Date.now() };
		return registry;
	}

	private async saveRegistry(registry: SuperAdminRegistry): Promise<void> {
		const serialized = JSON.stringify(registry);
		const existing = await this.settingsRepository.findOne({ where: { key: REGISTRY_KEY } });
		if (existing) {
			await this.settingsRepository.update({ key: REGISTRY_KEY }, { value: serialized });
		} else {
			await this.settingsRepository.save({
				key: REGISTRY_KEY,
				value: serialized,
				loadOnStartup: false,
			});
		}
		this.cachedRegistry = { value: registry, loadedAt: Date.now() };
	}

	async registerOwner(ownerId: string, plan: TenantPlan = 'free'): Promise<void> {
		const registry = await this.loadRegistry();
		if (!registry.tenants[ownerId]) {
			registry.tenants[ownerId] = {
				ownerId,
				plan,
				status: 'active',
				createdAt: new Date().toISOString(),
				memberIds: [],
			};
			await this.saveRegistry(registry);
		}
	}

	async registerTeamMembers(inviterId: string, memberIds: string[]): Promise<void> {
		if (!memberIds.length) return;
		const registry = await this.loadRegistry();

		// Find owning tenant: either inviter is an owner, or inviter is a member of a tenant
		let ownerTenant = registry.tenants[inviterId];
		if (!ownerTenant) {
			ownerTenant = Object.values(registry.tenants).find((t) => t.memberIds.includes(inviterId))!;
		}
		if (!ownerTenant) {
			ownerTenant = {
				ownerId: inviterId,
				plan: 'free',
				status: 'active',
				createdAt: new Date().toISOString(),
				memberIds: [],
			};
			registry.tenants[inviterId] = ownerTenant;
		}

		const existing = new Set(ownerTenant.memberIds);
		let changed = false;
		for (const id of memberIds) {
			if (id !== ownerTenant.ownerId && !existing.has(id)) {
				ownerTenant.memberIds.push(id);
				existing.add(id);
				changed = true;
			}
		}
		if (changed) {
			await this.saveRegistry(registry);
		}
	}

	async isUserSuspended(userId: string): Promise<{ suspended: boolean; reason?: string }> {
		const registry = await this.loadRegistry();
		if (registry.suspendedUserIds.includes(userId)) {
			return {
				suspended: true,
				reason: 'Your account has been suspended by the Super Admin.',
			};
		}
		const ownTenant = registry.tenants[userId];
		if (ownTenant?.status === 'suspended') {
			return {
				suspended: true,
				reason: 'Your workspace subscription is suspended. Please contact ieEnterprises support.',
			};
		}
		for (const tenant of Object.values(registry.tenants)) {
			if (tenant.status === 'suspended' && tenant.memberIds.includes(userId)) {
				return {
					suspended: true,
					reason:
						'Your workspace subscription is suspended. Please contact your workspace owner or ieEnterprises support.',
				};
			}
		}
		return { suspended: false };
	}

	async getOverview(): Promise<{
		tenants: SuperAdminTenantView[];
		unassignedUsers: SuperAdminUserView[];
	}> {
		const registry = await this.loadRegistry();
		const users = await this.userRepository.find({ relations: ['role'] });
		const userMap = new Map(users.map((u) => [u.id, u]));
		const suspendedSet = new Set(registry.suspendedUserIds);

		// Auto-register any existing global:owner / global:admin users not yet in registry
		let registryDirty = false;
		for (const user of users) {
			const roleSlug = user.role?.slug ?? '';
			const isOwnerOrAdmin =
				roleSlug === GLOBAL_OWNER_ROLE.slug || roleSlug === GLOBAL_ADMIN_ROLE.slug;
			const alreadyMember = Object.values(registry.tenants).some((t) =>
				t.memberIds.includes(user.id),
			);
			if (isOwnerOrAdmin && user.email && !registry.tenants[user.id] && !alreadyMember) {
				registry.tenants[user.id] = {
					ownerId: user.id,
					plan: 'free',
					status: 'active',
					createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
					memberIds: [],
				};
				registryDirty = true;
			}
		}
		if (registryDirty) {
			await this.saveRegistry(registry);
		}

		const toUserView = (
			user: (typeof users)[number],
			overrideStatus?: TenantStatus,
		): SuperAdminUserView => ({
			id: user.id,
			email: user.email ?? '',
			firstName: user.firstName ?? '',
			lastName: user.lastName ?? '',
			role: user.role?.slug ?? '',
			isPending: Boolean(user.isPending),
			status: overrideStatus ?? (suspendedSet.has(user.id) ? 'suspended' : 'active'),
			createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
			lastActiveAt: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
		});

		const assignedIds = new Set<string>();
		const tenants: SuperAdminTenantView[] = [];

		for (const tenant of Object.values(registry.tenants)) {
			const owner = userMap.get(tenant.ownerId);
			if (!owner || !owner.email) continue;
			assignedIds.add(owner.id);

			const members: SuperAdminUserView[] = [];
			for (const memberId of tenant.memberIds) {
				const member = userMap.get(memberId);
				if (!member) continue;
				assignedIds.add(member.id);
				const effectiveStatus: TenantStatus =
					tenant.status === 'suspended' || suspendedSet.has(member.id) ? 'suspended' : 'active';
				members.push(toUserView(member, effectiveStatus));
			}

			tenants.push({
				...toUserView(owner, tenant.status),
				plan: tenant.plan,
				notes: tenant.notes ?? '',
				members,
			});
		}

		const unassignedUsers = users
			.filter((u) => !assignedIds.has(u.id) && Boolean(u.email))
			.map((u) => toUserView(u));

		return { tenants, unassignedUsers };
	}

	async updateTenant(
		ownerId: string,
		patch: { plan?: TenantPlan; status?: TenantStatus; notes?: string },
	): Promise<SuperAdminTenantRecord> {
		const registry = await this.loadRegistry();
		const tenant = registry.tenants[ownerId] ?? {
			ownerId,
			plan: 'free' as TenantPlan,
			status: 'active' as TenantStatus,
			createdAt: new Date().toISOString(),
			memberIds: [],
		};

		if (patch.plan) tenant.plan = patch.plan;
		if (patch.status) tenant.status = patch.status;
		if (typeof patch.notes === 'string') tenant.notes = patch.notes;
		registry.tenants[ownerId] = tenant;

		await this.saveRegistry(registry);
		return tenant;
	}

	async updateMemberStatus(userId: string, status: TenantStatus): Promise<void> {
		const registry = await this.loadRegistry();
		const next = new Set(registry.suspendedUserIds);
		if (status === 'suspended') {
			next.add(userId);
		} else {
			next.delete(userId);
		}
		registry.suspendedUserIds = [...next];
		await this.saveRegistry(registry);
	}

	async deleteUser(userId: string): Promise<void> {
		const registry = await this.loadRegistry();
		delete registry.tenants[userId];
		for (const tenant of Object.values(registry.tenants)) {
			tenant.memberIds = tenant.memberIds.filter((id) => id !== userId);
		}
		registry.suspendedUserIds = registry.suspendedUserIds.filter((id) => id !== userId);
		await this.saveRegistry(registry);

		const person = await this.personRepository.findById(userId);
		if (person) {
			await this.personRepository.remove(person);
		}
	}
}
