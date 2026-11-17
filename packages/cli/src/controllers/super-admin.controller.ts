import { Body, Delete, Get, Param, Patch, Post, RestController } from '@n8n/decorators';
import { Request, Response } from 'express';

import {
	SuperAdminService,
	type TenantPlan,
	type TenantStatus,
} from '@/services/super-admin.service';

const SUPER_ADMIN_COOKIE = 'ieautom8n-super-admin';

function parseCookie(req: Request, name: string): string | undefined {
	const raw = req.headers.cookie;
	if (!raw) return undefined;
	for (const part of raw.split(';')) {
		const [k, ...rest] = part.trim().split('=');
		if (k === name) return decodeURIComponent(rest.join('='));
	}
	return undefined;
}

@RestController('/super-admin')
export class SuperAdminController {
	constructor(private readonly superAdminService: SuperAdminService) {}

	private requireSession(req: Request, res: Response): { email: string } | null {
		const token = parseCookie(req, SUPER_ADMIN_COOKIE);
		const session = this.superAdminService.verifySessionToken(token);
		if (!session) {
			res.status(401).json({ message: 'Super Admin authentication required.' });
			return null;
		}
		return session;
	}

	@Get('/session', { skipAuth: true })
	async getSession(req: Request) {
		const token = parseCookie(req, SUPER_ADMIN_COOKIE);
		const session = this.superAdminService.verifySessionToken(token);
		return { authenticated: Boolean(session), email: session?.email ?? null };
	}

	@Post('/login', { skipAuth: true })
	async login(
		req: Request,
		res: Response,
		@Body payload: { email?: string; password?: string },
	) {
		const email = payload?.email?.trim().toLowerCase() ?? '';
		const password = payload?.password ?? '';
		const configured = this.superAdminService.getConfiguredCredentials();

		if (email !== configured.email || password !== configured.password) {
			return res.status(401).json({ message: 'Invalid Super Admin email or password.' });
		}

		const token = this.superAdminService.signSessionToken(email);
		const isHttps = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
		res.cookie(SUPER_ADMIN_COOKIE, token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: isHttps,
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: '/',
		});

		return { authenticated: true, email };
	}

	@Post('/logout', { skipAuth: true })
	async logout(_req: Request, res: Response) {
		res.clearCookie(SUPER_ADMIN_COOKIE, { path: '/' });
		return { success: true };
	}

	@Get('/tenants', { skipAuth: true })
	async getTenants(req: Request, res: Response) {
		if (!this.requireSession(req, res)) return;
		return await this.superAdminService.getOverview();
	}

	@Patch('/tenants/:ownerId', { skipAuth: true })
	async updateTenant(
		req: Request,
		res: Response,
		@Param('ownerId') ownerId: string,
		@Body payload: { plan?: TenantPlan; status?: TenantStatus; notes?: string },
	) {
		if (!this.requireSession(req, res)) return;
		return await this.superAdminService.updateTenant(ownerId, payload ?? {});
	}

	@Patch('/members/:userId', { skipAuth: true })
	async updateMemberStatus(
		req: Request,
		res: Response,
		@Param('userId') userId: string,
		@Body payload: { status?: TenantStatus },
	) {
		if (!this.requireSession(req, res)) return;
		if (payload?.status !== 'active' && payload?.status !== 'suspended') {
			return res.status(400).json({ message: 'Invalid status.' });
		}
		await this.superAdminService.updateMemberStatus(userId, payload.status);
		return { success: true };
	}

	@Delete('/users/:userId', { skipAuth: true })
	async deleteUser(req: Request, res: Response, @Param('userId') userId: string) {
		if (!this.requireSession(req, res)) return;
		await this.superAdminService.deleteUser(userId);
		return { success: true };
	}
}
