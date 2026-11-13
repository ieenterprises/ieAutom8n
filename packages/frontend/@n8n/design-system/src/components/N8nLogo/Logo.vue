<script setup lang="ts">
import { useFavicon } from '@vueuse/core';
import { computed, onMounted, useCssModule, useTemplateRef } from 'vue';

import LogoIcon from './logo-icon.svg';
import LogoText from './logo-text.svg';

const props = defineProps<
	(
		| {
				size: 'large';
		  }
		| {
				size: 'small';
				collapsed: boolean;
		  }
	) & {
		releaseChannel?: 'stable' | 'beta' | 'nightly' | 'dev' | 'rc';
	}
>();

const { size, releaseChannel } = props;

const showLogoText = computed(() => {
	if (size === 'large') return true;
	return !props.collapsed;
});

const $style = useCssModule();
const containerClasses = computed(() => {
	if (size === 'large') {
		return [$style.logoContainer, $style.large];
	}
	return [
		$style.logoContainer,
		$style.sidebar,
		props.collapsed ? $style.sidebarCollapsed : $style.sidebarExpanded,
	];
});

const svg = useTemplateRef<{ $el: Element }>('logo');
onMounted(() => {
	if (releaseChannel !== 'dev' || !('createObjectURL' in URL)) {
		return;
	}

	const logoEl = svg.value!.$el;

	/** Reuse the SVG as the favicon. These must use HEX values. */
	const hexColor = '#898989';
	const faviconSvg = logoEl.outerHTML.replace('>', `><style>path { fill: ${hexColor}; }</style>`);
	const blob = new Blob([faviconSvg], { type: 'image/svg+xml' });
	useFavicon(URL.createObjectURL(blob));
});
</script>

<template>
	<div :class="containerClasses" data-test-id="n8n-logo">
		<img
			ref="logo"
			src="https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png"
			alt="ieAutom8n Logo"
			:class="[$style.logoImg, { [$style.dev]: releaseChannel === 'dev' }]"
		/>
		<span v-if="showLogoText" :class="$style.logoBrandText">ieAutom8n</span>
		<slot />
	</div>
</template>

<style lang="scss" module>
.logoContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: var(--spacing--3xs);
	fill: var(--text-color--subtler);
}

.logo,
.logoText,
.logoImg {
	width: auto;
	height: var(--height--3xs);
	max-width: 100%;
}

.logoImg {
	border-radius: 50%;
	object-fit: contain;
}

.logoBrandText {
	font-family: inherit;
	font-size: 1.25rem;
	font-weight: 800;
	letter-spacing: -0.5px;
	color: var(--text-color, #1a1a1a);
	white-space: nowrap;
}

.large {
	margin-bottom: var(--spacing--xl);

	.logo,
	.logoText,
	.logoImg {
		height: var(--height--2xs);
	}

	.logoBrandText {
		font-size: 1.6rem;
	}
}
</style>
