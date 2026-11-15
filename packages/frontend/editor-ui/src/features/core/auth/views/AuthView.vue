<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { N8nLogo } from '@n8n/design-system';
import type { FormFieldValueUpdate, IFormBoxConfig } from '@/Interface';
import { useSettingsStore } from '@n8n/stores/settings.store';
import type { EmailOrLdapLoginIdAndPassword } from './SigninView.vue';

import { N8nFormBox, N8nText } from '@n8n/design-system';
withDefaults(
	defineProps<{
		/** The standard form box. Omit it when the default slot renders the card instead. */
		form?: IFormBoxConfig;
		formLoading?: boolean;
		subtitle?: string;
		switchPrompt?: string;
		switchLinkText?: string;
		switchLinkTo?: string | RouteLocationRaw;
	}>(),
	{
		form: undefined,
		formLoading: false,
		subtitle: undefined,
		switchPrompt: undefined,
		switchLinkText: undefined,
		switchLinkTo: undefined,
	},
);

const emit = defineEmits<{
	update: [FormFieldValueUpdate];
	submit: [values: EmailOrLdapLoginIdAndPassword];
	secondaryClick: [];
}>();

const onUpdate = (e: FormFieldValueUpdate) => {
	emit('update', e);
};

const onSubmit = (data: unknown) => {
	emit('submit', data as EmailOrLdapLoginIdAndPassword);
};

const onSecondaryClick = () => {
	emit('secondaryClick');
};

const {
	settings: { releaseChannel },
} = useSettingsStore();
</script>

<template>
	<div :class="$style.container">
		<router-link to="/" :class="$style.backLink">
			<span :class="$style.backArrow">←</span> Back to Home
		</router-link>
		<N8nLogo size="large" :release-channel="releaseChannel" />
		<div :class="$style.textContainer">
			<N8nText size="medium" color="text-light">
				{{ subtitle ?? 'Enterprise Automation Platform' }}
			</N8nText>
		</div>
		<div :class="$style.formContainer">
			<slot>
				<N8nFormBox
					v-if="form"
					v-bind="form"
					data-test-id="auth-form"
					:button-loading="formLoading"
					submit-button-variant="brand"
					@secondary-click="onSecondaryClick"
					@submit="onSubmit"
					@update="onUpdate"
				/>
			</slot>
			<div
				v-if="$slots['switch-link'] || (switchLinkText && switchLinkTo)"
				:class="$style.switchContainer"
			>
				<slot name="switch-link">
					<span>
						{{ switchPrompt }}
						<router-link :to="switchLinkTo">{{ switchLinkText }}</router-link>
					</span>
				</slot>
			</div>
		</div>
		<div :class="$style.footer">
			<N8nText size="small" color="text-light">
				Powered by <a href="mailto:ieenterprises.ai@gmail.com" target="_blank" :class="$style.footerLink">ieEnterprises</a>
			</N8nText>
		</div>
	</div>
</template>

<style lang="scss" module>
body {
	background-color: var(--color--background--light-2);
}

.container {
	display: flex;
	align-items: center;
	flex-direction: column;
	padding-top: var(--spacing--xl);

	> * {
		width: 352px;
	}
}

.backLink {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	width: auto !important;
	font-size: var(--font-size--xs, 12px);
	font-weight: var(--font-weight--bold, 600);
	color: #64748b;
	text-decoration: none;
	margin-bottom: var(--spacing--sm);
	padding: 6px 14px;
	border-radius: 9999px;
	background-color: #ffffff;
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	transition: all 0.2s ease;

	&:hover {
		color: #7c3aed;
		border-color: #8b5cf6;
		background-color: #f5f3ff;
		transform: translateX(-2px);
	}
}

.backArrow {
	font-size: 14px;
	transition: transform 0.2s ease;
}

.textContainer {
	text-align: center;
	margin-top: var(--spacing--xs);
	margin-bottom: var(--spacing--xs);
}

.formContainer {
	padding-bottom: var(--spacing--md);
}

.switchContainer {
	margin-top: var(--spacing--md, 16px);
	text-align: center;
	font-size: var(--font-size--s, 13px);
	color: #64748b;

	a {
		color: #7c3aed;
		font-weight: 600;
		text-decoration: none;
		margin-left: 4px;
		transition: color 0.15s ease;

		&:hover {
			color: #6d28d9;
			text-decoration: underline;
		}
	}
}

.footer {
	text-align: center;
	padding-bottom: var(--spacing--xl);
}

.footerLink {
	color: var(--color--primary);
	text-decoration: none;
	font-weight: var(--font-weight--bold);

	&:hover {
		text-decoration: underline;
	}
}
</style>
