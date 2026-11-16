<script setup lang="ts">
import { computed, ref } from 'vue';
import { N8nButton, N8nIcon, N8nText, N8nCallout } from '@n8n/design-system';

const props = withDefaults(
	defineProps<{
		serviceName: string;
		credentialTypeName: string;
		isConnected?: boolean;
		nodWebUrl?: string;
	}>(),
	{
		isConnected: false,
		nodWebUrl: 'https://nod-web.onrender.com',
	},
);

const emit = defineEmits<{
	connect: [];
	disconnect: [];
}>();

const isConnecting = ref(false);
const showModal = ref(false);

const appSlug = computed(() => {
	const name = props.credentialTypeName.toLowerCase();
	if (name.includes('gmail')) return 'gmail';
	if (name.includes('sheet')) return 'googlesheets';
	if (name.includes('drive')) return 'googledrive';
	if (name.includes('calendar')) return 'googlecalendar';
	if (name.includes('onenote')) return 'onenote';
	if (name.includes('excel')) return 'excel';
	if (name.includes('slack')) return 'slack';
	if (name.includes('github')) return 'github';
	if (name.includes('linear')) return 'linear';
	if (name.includes('notion')) return 'notion';
	if (name.includes('jira')) return 'jira';
	if (name.includes('trello')) return 'trello';
	if (name.includes('asana')) return 'asana';
	if (name.includes('microsoft')) return 'microsoft';
	if (name.includes('google')) return 'google';
	return 'composio';
});

const connectUrl = computed(() => {
	const base = props.nodWebUrl.replace(/\/+$/, '');
	return `${base}`;
});

let popupWindow: Window | null = null;

function startConnect() {
	isConnecting.value = true;
	showModal.value = true;

	const width = 540;
	const height = 720;
	const left = window.screenX + (window.outerWidth - width) / 2;
	const top = window.screenY + (window.outerHeight - height) / 2;

	popupWindow = window.open(
		connectUrl.value,
		'composio_connect_popup',
		`width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
	);

	if (!popupWindow) {
		window.open(connectUrl.value, '_blank');
	}
}

function finishConnect() {
	if (popupWindow && !popupWindow.closed) {
		try {
			popupWindow.close();
		} catch {}
	}
	isConnecting.value = false;
	showModal.value = false;
	emit('connect');
}

function cancelConnect() {
	if (popupWindow && !popupWindow.closed) {
		try {
			popupWindow.close();
		} catch {}
	}
	isConnecting.value = false;
	showModal.value = false;
}
</script>

<template>
	<div :class="$style.composioContainer">
		<!-- Connected state banner -->
		<div v-if="isConnected" :class="$style.connectedCard">
			<div :class="$style.cardHeader">
				<div :class="$style.statusBadge">
					<span :class="$style.statusDot"></span>
					<N8nText :bold="true" size="small" color="success">Connected via Composio</N8nText>
				</div>
				<N8nButton size="mini" variant="ghost" @click="startConnect">
					Switch Account
				</N8nButton>
			</div>
			<N8nText size="small" color="text-light">
				Authentication is managed automatically by Composio Managed OAuth. No manual Client ID or Client Secret required.
			</N8nText>
		</div>

		<!-- Disconnected / Call-to-action banner -->
		<div v-else :class="$style.promoCard">
			<div :class="$style.cardTop">
				<div :class="$style.iconRow">
					<span :class="$style.lightningBadge">⚡ Composio 1-Click Connect</span>
				</div>
				<N8nText :bold="true" size="large" :class="$style.title">
					Connect {{ serviceName || 'your account' }} seamlessly
				</N8nText>
				<N8nText size="small" color="text-light" :class="$style.desc">
					Skip Google Cloud, Azure apps, Client IDs, and Client Secrets. Authenticate in one click using Composio Managed Auth.
				</N8nText>
			</div>

			<div :class="$style.actionRow">
				<N8nButton
					size="medium"
					type="primary"
					:class="$style.connectBtn"
					@click="startConnect"
				>
					<span style="margin-right: 6px;">⚡</span> Connect with Composio
				</N8nButton>
			</div>
		</div>

		<!-- Sign-in waiting modal dialog -->
		<div v-if="showModal" :class="$style.modalOverlay" @click.self="cancelConnect">
			<div :class="$style.modalCard">
				<div :class="$style.modalHeader">
					<div :class="$style.modalIcons">
						<span :class="$style.brandCircle">⚡</span>
						<span :class="$style.connectorLine"></span>
						<span :class="$style.serviceCircle">{{ (serviceName || 'App').slice(0, 2).toUpperCase() }}</span>
					</div>
					<N8nText :bold="true" size="large" :class="$style.modalTitle">
						Connect {{ serviceName || 'Application' }}
					</N8nText>
					<N8nText size="small" color="text-light" :class="$style.modalDesc">
						{{ serviceName || 'The service' }} will ask you to allow Composio, the service ieAutom8n uses to connect apps. Review what it can access, then allow it.
					</N8nText>
				</div>

				<div :class="$style.waitingSection">
					<div :class="$style.spinner"></div>
					<N8nText size="small" color="text-light">Waiting for sign-in in popup window...</N8nText>
				</div>

				<div :class="$style.modalActions">
					<N8nButton size="medium" variant="outline" @click="cancelConnect">
						Cancel
					</N8nButton>
					<N8nButton size="medium" type="primary" @click="finishConnect">
						I've Completed Sign-in
					</N8nButton>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" module>
.composioContainer {
	margin-bottom: var(--spacing--s);
}

.promoCard {
	background: linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%);
	border: 1px solid rgba(147, 51, 234, 0.25);
	border-radius: var(--border-radius--base);
	padding: var(--spacing--m);
	margin-bottom: var(--spacing--s);
	display: flex;
	flex-direction: column;
	gap: var(--spacing--xs);
}

.cardTop {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.iconRow {
	display: flex;
	align-items: center;
	margin-bottom: 4px;
}

.lightningBadge {
	font-size: 11px;
	font-weight: 600;
	color: #9333ea;
	background: rgba(147, 51, 234, 0.12);
	border-radius: 12px;
	padding: 2px 8px;
	display: inline-block;
}

.title {
	color: var(--color--text--dark);
	margin: 0;
}

.desc {
	margin: 0;
	line-height: 1.4;
}

.actionRow {
	margin-top: var(--spacing--xs);
	display: flex;
	align-items: center;
	gap: var(--spacing--s);
}

.connectBtn {
	background-color: #9333ea !important;
	border-color: #9333ea !important;
	color: #ffffff !important;
	font-weight: 600;
	box-shadow: 0 2px 4px rgba(147, 51, 234, 0.2);
	&:hover {
		background-color: #7e22ce !important;
		border-color: #7e22ce !important;
	}
}

.connectedCard {
	background: rgba(16, 185, 129, 0.06);
	border: 1px solid rgba(16, 185, 129, 0.3);
	border-radius: var(--border-radius--base);
	padding: var(--spacing--s) var(--spacing--m);
	margin-bottom: var(--spacing--s);
}

.cardHeader {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 4px;
}

.statusBadge {
	display: flex;
	align-items: center;
	gap: 6px;
}

.statusDot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: #10b981;
}

.modalOverlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.55);
	backdrop-filter: blur(2px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 99999;
}

.modalCard {
	background: var(--color--background--light, #ffffff);
	border-radius: 12px;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
	padding: 24px;
	max-width: 440px;
	width: 90%;
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.modalHeader {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.modalIcons {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 8px;
}

.brandCircle {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: rgba(147, 51, 234, 0.12);
	color: #9333ea;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
}

.connectorLine {
	width: 24px;
	height: 2px;
	background: #cbd5e1;
}

.serviceCircle {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: #f1f5f9;
	color: #334155;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 14px;
	border: 1px solid #e2e8f0;
}

.modalTitle {
	margin: 0;
}

.modalDesc {
	line-height: 1.5;
	margin: 0;
}

.waitingSection {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 12px;
	background: #f8fafc;
	border-radius: 8px;
	border: 1px dashed #cbd5e1;
}

.spinner {
	width: 16px;
	height: 16px;
	border: 2px solid #e2e8f0;
	border-top-color: #9333ea;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.modalActions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-top: 8px;
}
</style>
