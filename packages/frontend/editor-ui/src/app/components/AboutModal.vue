<script setup lang="ts">
import { createEventBus } from '@n8n/utils/event-bus';
import Modal from './Modal.vue';
import { ABOUT_MODAL_KEY } from '../constants';
import { useRootStore } from '@n8n/stores/useRootStore';
import { useI18n } from '@n8n/i18n';

import { ElCol, ElRow } from 'element-plus';
import { N8nButton, N8nLink, N8nText } from '@n8n/design-system';

const modalBus = createEventBus();
const i18n = useI18n();
const rootStore = useRootStore();

const closeDialog = () => {
	modalBus.emit('close');
};
</script>

<template>
	<Modal
		max-width="540px"
		:title="i18n.baseText('about.aboutN8n')"
		:event-bus="modalBus"
		:name="ABOUT_MODAL_KEY"
		:center="true"
	>
		<template #content>
			<div :class="$style.container">
				<ElRow>
					<ElCol :span="8" class="info-name">
						<N8nText>{{ i18n.baseText('about.n8nVersion') }}</N8nText>
					</ElCol>
					<ElCol :span="16">
						<N8nText>{{ rootStore.versionCli }}</N8nText>
					</ElCol>
				</ElRow>
				<ElRow>
					<ElCol :span="8" class="info-name">
						<N8nText>{{ i18n.baseText('about.sourceCode') }}</N8nText>
					</ElCol>
					<ElCol :span="16">
						<N8nLink to="https://github.com/ieenterprises/ieAutom8n" target="_blank">
							https://github.com/ieenterprises/ieAutom8n
						</N8nLink>
					</ElCol>
				</ElRow>
			</div>
		</template>

		<template #footer>
			<div class="action-buttons">
				<N8nButton
					float="right"
					:label="i18n.baseText('about.close')"
					data-test-id="close-about-modal-button"
					@click="closeDialog"
				/>
			</div>
		</template>
	</Modal>
</template>

<style module lang="scss">
.container > * {
	margin-bottom: var(--spacing--sm);
	overflow-wrap: break-word;
}
</style>
