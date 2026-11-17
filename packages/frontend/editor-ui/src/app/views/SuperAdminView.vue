<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRootStore } from '@n8n/stores/useRootStore';
import { makeRestApiRequest } from '@n8n/rest-api-client';
import { N8nButton, N8nInput, N8nHeading, N8nText } from '@n8n/design-system';

type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';
type TenantStatus = 'active' | 'suspended';

interface SuperAdminUserView {
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

interface SuperAdminTenantView extends SuperAdminUserView {
	plan: TenantPlan;
	notes: string;
	members: SuperAdminUserView[];
}

const router = useRouter();
const rootStore = useRootStore();

const checkingSession = ref(true);
const authenticated = ref(false);
const adminEmail = ref('');

const loginEmail = ref('');
const loginPassword = ref('');
const loginError = ref('');
const loggingIn = ref(false);

const loadingData = ref(false);
const actionError = ref('');
const tenants = ref<SuperAdminTenantView[]>([]);
const unassignedUsers = ref<SuperAdminUserView[]>([]);

const totalMembers = computed(() =>
	tenants.value.reduce((acc, t) => acc + t.members.length, 0),
);
const activeTenants = computed(
	() => tenants.value.filter((t) => t.status === 'active').length,
);
const suspendedTenants = computed(
	() => tenants.value.filter((t) => t.status === 'suspended').length,
);

async function checkSession() {
	checkingSession.value = true;
	try {
		const res = await makeRestApiRequest<{ authenticated: boolean; email: string | null }>(
			rootStore.restApiContext,
			'GET',
			'/super-admin/session',
		);
		authenticated.value = Boolean(res?.authenticated);
		adminEmail.value = res?.email ?? '';
		if (authenticated.value) {
			await fetchTenants();
		}
	} catch {
		authenticated.value = false;
	} finally {
		checkingSession.value = false;
	}
}

async function onLogin() {
	loginError.value = '';
	loggingIn.value = true;
	try {
		const res = await makeRestApiRequest<{ authenticated: boolean; email: string }>(
			rootStore.restApiContext,
			'POST',
			'/super-admin/login',
			{ email: loginEmail.value.trim(), password: loginPassword.value },
		);
		authenticated.value = Boolean(res?.authenticated);
		adminEmail.value = res?.email ?? '';
		loginPassword.value = '';
		await fetchTenants();
	} catch (err) {
		loginError.value = err instanceof Error ? err.message : 'Invalid Super Admin credentials.';
	} finally {
		loggingIn.value = false;
	}
}

async function onLogout() {
	try {
		await makeRestApiRequest(rootStore.restApiContext, 'POST', '/super-admin/logout');
	} finally {
		authenticated.value = false;
		adminEmail.value = '';
		tenants.value = [];
		unassignedUsers.value = [];
	}
}

async function fetchTenants() {
	loadingData.value = true;
	actionError.value = '';
	try {
		const res = await makeRestApiRequest<{
			tenants: SuperAdminTenantView[];
			unassignedUsers: SuperAdminUserView[];
		}>(rootStore.restApiContext, 'GET', '/super-admin/tenants');
		tenants.value = res?.tenants ?? [];
		unassignedUsers.value = res?.unassignedUsers ?? [];
	} catch (err) {
		actionError.value = err instanceof Error ? err.message : 'Failed to load workspaces.';
	} finally {
		loadingData.value = false;
	}
}

async function updateTenantPlan(ownerId: string, plan: TenantPlan) {
	actionError.value = '';
	try {
		await makeRestApiRequest(rootStore.restApiContext, 'PATCH', `/super-admin/tenants/${ownerId}`, {
			plan,
		});
		await fetchTenants();
	} catch (err) {
		actionError.value = err instanceof Error ? err.message : 'Failed to update plan.';
	}
}

async function toggleTenantStatus(tenant: SuperAdminTenantView) {
	actionError.value = '';
	const nextStatus: TenantStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
	try {
		await makeRestApiRequest(
			rootStore.restApiContext,
			'PATCH',
			`/super-admin/tenants/${tenant.id}`,
			{ status: nextStatus },
		);
		await fetchTenants();
	} catch (err) {
		actionError.value = err instanceof Error ? err.message : 'Failed to update status.';
	}
}

async function toggleMemberStatus(member: SuperAdminUserView) {
	actionError.value = '';
	const nextStatus: TenantStatus = member.status === 'suspended' ? 'active' : 'suspended';
	try {
		await makeRestApiRequest(
			rootStore.restApiContext,
			'PATCH',
			`/super-admin/members/${member.id}`,
			{ status: nextStatus },
		);
		await fetchTenants();
	} catch (err) {
		actionError.value = err instanceof Error ? err.message : 'Failed to update member status.';
	}
}

async function removeUser(user: SuperAdminUserView) {
	if (!window.confirm(`Delete ${user.email || user.id}? This cannot be undone.`)) return;
	actionError.value = '';
	try {
		await makeRestApiRequest(rootStore.restApiContext, 'DELETE', `/super-admin/users/${user.id}`);
		await fetchTenants();
	} catch (err) {
		actionError.value = err instanceof Error ? err.message : 'Failed to delete user.';
	}
}

function formatName(u: SuperAdminUserView): string {
	const full = `${u.firstName} ${u.lastName}`.trim();
	return full || u.email || 'Unnamed User';
}

onMounted(() => {
	void checkSession();
});
</script>

<template>
	<div :class="$style.page">
		<div :class="$style.topBar">
			<button type="button" :class="$style.backBtn" @click="router.push('/')">
				← Back to Home
			</button>
			<div v-if="authenticated" :class="$style.topActions">
				<span :class="$style.adminBadge">Super Admin: {{ adminEmail }}</span>
				<N8nButton label="Refresh" size="small" variant="outline" @click="fetchTenants" />
				<N8nButton label="Sign Out" size="small" variant="ghost" @click="onLogout" />
			</div>
		</div>

		<div v-if="checkingSession" :class="$style.centerCard">
			<N8nText>Checking Super Admin session...</N8nText>
		</div>

		<div v-else-if="!authenticated" :class="$style.loginCard">
			<N8nHeading size="xlarge" tag="h1">Super Admin Console</N8nHeading>
			<N8nText color="text-light" :class="$style.subtitle">
				Manage workspace owners, team members, and subscriptions.
			</N8nText>

			<form :class="$style.loginForm" @submit.prevent="onLogin">
				<div :class="$style.field">
					<label :class="$style.label">Super Admin Email</label>
					<N8nInput
						v-model="loginEmail"
						type="email"
						placeholder="superadmin@ieenterprises.ai"
						required
					/>
				</div>
				<div :class="$style.field">
					<label :class="$style.label">Password</label>
					<N8nInput
						v-model="loginPassword"
						type="password"
						:show-password="true"
						placeholder="Enter password"
						required
					/>
				</div>
				<p v-if="loginError" :class="$style.errorText">{{ loginError }}</p>
				<N8nButton
					type="submit"
					variant="brand"
					size="large"
					label="Sign in to Super Admin"
					:loading="loggingIn"
				/>
			</form>
		</div>

		<div v-else :class="$style.dashboard">
			<div :class="$style.headerRow">
				<div>
					<N8nHeading size="xlarge" tag="h1">Super Admin — Owners & Subscriptions</N8nHeading>
					<N8nText color="text-light">
						Suspending an Owner automatically suspends access for all of their team members.
					</N8nText>
				</div>
			</div>

			<div :class="$style.statsGrid">
				<div :class="$style.statCard">
					<span :class="$style.statLabel">Workspace Owners</span>
					<strong :class="$style.statValue">{{ tenants.length }}</strong>
				</div>
				<div :class="$style.statCard">
					<span :class="$style.statLabel">Active Subscriptions</span>
					<strong :class="$style.statValueActive">{{ activeTenants }}</strong>
				</div>
				<div :class="$style.statCard">
					<span :class="$style.statLabel">Suspended</span>
					<strong :class="$style.statValueSuspended">{{ suspendedTenants }}</strong>
				</div>
				<div :class="$style.statCard">
					<span :class="$style.statLabel">Team Members</span>
					<strong :class="$style.statValue">{{ totalMembers }}</strong>
				</div>
			</div>

			<p v-if="actionError" :class="$style.errorText">{{ actionError }}</p>
			<div v-if="loadingData" :class="$style.loadingBox">Loading workspaces...</div>

			<div v-else :class="$style.tenantList">
				<div v-if="tenants.length === 0" :class="$style.emptyState">
					No workspace owners registered yet.
				</div>

				<div v-for="tenant in tenants" :key="tenant.id" :class="$style.tenantCard">
					<div :class="$style.tenantHeader">
						<div>
							<div :class="$style.ownerTitleRow">
								<strong :class="$style.ownerName">{{ formatName(tenant) }}</strong>
								<span
									:class="[
										$style.statusPill,
										tenant.status === 'suspended' ? $style.pillSuspended : $style.pillActive,
									]"
								>
									{{ tenant.status === 'suspended' ? 'Suspended' : 'Active' }}
								</span>
							</div>
							<div :class="$style.ownerMeta">
								{{ tenant.email }} · Role: {{ tenant.role }} · Members: {{ tenant.members.length }}
							</div>
						</div>

						<div :class="$style.tenantControls">
							<select
								:class="$style.planSelect"
								:value="tenant.plan"
								@change="
									updateTenantPlan(
										tenant.id,
										($event.target as HTMLSelectElement).value as TenantPlan,
									)
								"
							>
								<option value="free">Free</option>
								<option value="starter">Starter</option>
								<option value="pro">Pro</option>
								<option value="enterprise">Enterprise</option>
							</select>

							<N8nButton
								size="small"
								:variant="tenant.status === 'suspended' ? 'solid' : 'outline'"
								:label="tenant.status === 'suspended' ? 'Activate' : 'Suspend'"
								@click="toggleTenantStatus(tenant)"
							/>

							<N8nButton
								size="small"
								variant="ghost"
								label="Delete"
								@click="removeUser(tenant)"
							/>
						</div>
					</div>

					<div v-if="tenant.members.length > 0" :class="$style.membersSection">
						<div :class="$style.membersTitle">Team Members</div>
						<div v-for="member in tenant.members" :key="member.id" :class="$style.memberRow">
							<div>
								<span :class="$style.memberName">{{ formatName(member) }}</span>
								<span :class="$style.memberEmail">({{ member.email }})</span>
								<span
									:class="[
										$style.statusPill,
										member.status === 'suspended' ? $style.pillSuspended : $style.pillActive,
									]"
								>
									{{ member.isPending ? 'Pending Invite' : member.status }}
								</span>
							</div>
							<div :class="$style.memberActions">
								<N8nButton
									size="mini"
									variant="outline"
									:label="member.status === 'suspended' ? 'Activate' : 'Suspend'"
									:disabled="tenant.status === 'suspended'"
									@click="toggleMemberStatus(member)"
								/>
								<N8nButton
									size="mini"
									variant="ghost"
									label="Delete"
									@click="removeUser(member)"
								/>
							</div>
						</div>
					</div>
				</div>

				<div v-if="unassignedUsers.length > 0" :class="$style.tenantCard">
					<div :class="$style.membersTitle">Other Users</div>
					<div v-for="user in unassignedUsers" :key="user.id" :class="$style.memberRow">
						<div>
							<span :class="$style.memberName">{{ formatName(user) }}</span>
							<span :class="$style.memberEmail">({{ user.email }} · {{ user.role }})</span>
							<span
								:class="[
									$style.statusPill,
									user.status === 'suspended' ? $style.pillSuspended : $style.pillActive,
								]"
							>
								{{ user.status }}
							</span>
						</div>
						<div :class="$style.memberActions">
							<N8nButton
								size="mini"
								variant="outline"
								:label="user.status === 'suspended' ? 'Activate' : 'Suspend'"
								@click="toggleMemberStatus(user)"
							/>
							<N8nButton
								size="mini"
								variant="ghost"
								label="Delete"
								@click="removeUser(user)"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" module>
.page {
	min-height: 100vh;
	background: #f8fafc;
	color: #0f172a;
	padding: 24px;
}

.topBar {
	max-width: 1080px;
	margin: 0 auto 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
}

.backBtn {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 8px 14px;
	font-size: 13px;
	font-weight: 600;
	color: #334155;
	cursor: pointer;
}

.topActions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.adminBadge {
	font-size: 12px;
	color: #475569;
	background: #e2e8f0;
	padding: 4px 10px;
	border-radius: 999px;
}

.centerCard,
.loginCard {
	max-width: 420px;
	margin: 60px auto;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	padding: 28px;
	box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.subtitle {
	display: block;
	margin-top: 6px;
	margin-bottom: 20px;
}

.loginForm {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.label {
	font-size: 13px;
	font-weight: 600;
	color: #334155;
}

.dashboard {
	max-width: 1080px;
	margin: 0 auto;
}

.headerRow {
	margin-bottom: 20px;
}

.statsGrid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 14px;
	margin-bottom: 24px;
}

.statCard {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.statLabel {
	font-size: 12px;
	color: #64748b;
}

.statValue,
.statValueActive,
.statValueSuspended {
	font-size: 24px;
}

.statValueActive {
	color: #16a34a;
}

.statValueSuspended {
	color: #dc2626;
}

.tenantList {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.tenantCard {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 18px;
}

.tenantHeader {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
}

.ownerTitleRow {
	display: flex;
	align-items: center;
	gap: 8px;
}

.ownerName {
	font-size: 16px;
}

.ownerMeta {
	font-size: 13px;
	color: #64748b;
	margin-top: 4px;
}

.tenantControls {
	display: flex;
	align-items: center;
	gap: 8px;
}

.planSelect {
	height: 32px;
	padding: 0 10px;
	border: 1px solid #cbd5e1;
	border-radius: 6px;
	background: #ffffff;
	font-size: 13px;
}

.statusPill {
	font-size: 11px;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 999px;
	text-transform: capitalize;
}

.pillActive {
	background: #dcfce7;
	color: #166534;
}

.pillSuspended {
	background: #fee2e2;
	color: #991b1b;
}

.membersSection {
	margin-top: 14px;
	padding-top: 12px;
	border-top: 1px solid #f1f5f9;
}

.membersTitle {
	font-size: 12px;
	font-weight: 700;
	color: #475569;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	margin-bottom: 8px;
}

.memberRow {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 6px 0;
	gap: 10px;
	font-size: 13px;
}

.memberName {
	font-weight: 600;
	margin-right: 6px;
}

.memberEmail {
	color: #64748b;
	margin-right: 8px;
}

.memberActions {
	display: flex;
	gap: 6px;
}

.errorText {
	color: #dc2626;
	font-size: 13px;
}

.loadingBox,
.emptyState {
	padding: 24px;
	text-align: center;
	color: #64748b;
	background: #ffffff;
	border-radius: 12px;
	border: 1px solid #e2e8f0;
}
</style>
