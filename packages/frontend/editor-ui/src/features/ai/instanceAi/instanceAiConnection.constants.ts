import type {
	INSTANCE_AI_MODEL_CREDENTIAL_TYPES,
	INSTANCE_AI_SEARCH_CREDENTIAL_TYPES,
	InstanceAiSandboxProvider,
} from '@n8n/api-types';

import { SANDBOX_PROVIDER_LABELS } from './constants';

export type InstanceAiModelProvider =
	| 'anthropic'
	| 'openai'
	| 'google'
	| 'openrouter'
	| 'deepseek'
	| 'groq'
	| 'fireworks'
	| 'cerebras'
	| 'xai'
	| 'mistral'
	| 'together'
	| 'huggingface'
	| 'custom';
export type InstanceAiSearchProvider = 'searxng' | 'brave' | 'disabled';

export const INSTANCE_AI_CURATED_MODELS = {
	anthropic: ['claude-opus-5-5', 'claude-sonnet-5-5'],
	openai: ['gpt-6.1-sol', 'gpt-6-astra', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3-mini'],
	google: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
	// OpenRouter uses dotted versions for Claude (`claude-opus-5.5`, not `claude-opus-5-5`).
	openrouter: [
		'anthropic/claude-opus-5.5',
		'anthropic/claude-sonnet-5.5',
		'openai/gpt-6.1-sol',
		'openai/gpt-6-astra',
		'deepseek/deepseek-chat',
		'deepseek/deepseek-r1',
		'google/gemini-2.5-pro',
		'google/gemini-2.5-flash',
		'meta-llama/llama-3.3-70b-instruct',
		'moonshotai/kimi-k3',
	],
	deepseek: ['deepseek-chat', 'deepseek-reasoner'],
	groq: [
		'llama-3.3-70b-versatile',
		'llama-3.1-8b-instant',
		'deepseek-r1-distill-llama-70b',
		'mixtral-8x7b-32768',
	],
	fireworks: [
		'accounts/fireworks/models/deepseek-v3',
		'accounts/fireworks/models/llama-v3p3-70b-instruct',
		'accounts/fireworks/models/qwen2p5-72b-instruct',
	],
	cerebras: ['llama-3.3-70b', 'llama3.1-8b', 'qwen-3-32b'],
	xai: ['grok-3', 'grok-3-mini', 'grok-2-latest'],
	mistral: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
	together: [
		'meta-llama/Llama-3.3-70B-Instruct-Turbo',
		'deepseek-ai/DeepSeek-V3',
		'Qwen/Qwen2.5-72B-Instruct-Turbo',
	],
	huggingface: [
		'meta-llama/Llama-3.3-70B-Instruct',
		'Qwen/Qwen2.5-72B-Instruct',
		'deepseek-ai/DeepSeek-R1',
	],
	custom: [],
} as const satisfies Record<InstanceAiModelProvider, readonly string[]>;

export const INSTANCE_AI_MODEL_PROVIDERS: ReadonlyArray<{
	id: InstanceAiModelProvider;
	credentialType: (typeof INSTANCE_AI_MODEL_CREDENTIAL_TYPES)[number];
	label: string | null;
	placeholder: string;
	defaultBaseUrl?: string;
}> = [
	{
		id: 'anthropic',
		credentialType: 'anthropicApi',
		label: 'Anthropic',
		placeholder: 'sk-ant-…',
	},
	{
		id: 'openai',
		credentialType: 'openAiApi',
		label: 'OpenAI',
		placeholder: 'sk-…',
		defaultBaseUrl: 'https://api.openai.com/v1',
	},
	{
		id: 'google',
		credentialType: 'googlePalmApi',
		label: 'Google Gemini',
		placeholder: 'AIzaSy…',
	},
	{
		id: 'openrouter',
		credentialType: 'openRouterApi',
		label: 'OpenRouter',
		placeholder: 'sk-or-…',
	},
	{
		id: 'deepseek',
		credentialType: 'openAiApi',
		label: 'DeepSeek',
		placeholder: 'sk-…',
		defaultBaseUrl: 'https://api.deepseek.com/v1',
	},
	{
		id: 'groq',
		credentialType: 'openAiApi',
		label: 'Groq',
		placeholder: 'gsk_…',
		defaultBaseUrl: 'https://api.groq.com/openai/v1',
	},
	{
		id: 'fireworks',
		credentialType: 'openAiApi',
		label: 'Fireworks AI',
		placeholder: 'fw_…',
		defaultBaseUrl: 'https://api.fireworks.ai/inference/v1',
	},
	{
		id: 'cerebras',
		credentialType: 'openAiApi',
		label: 'Cerebras',
		placeholder: 'csk-…',
		defaultBaseUrl: 'https://api.cerebras.ai/v1',
	},
	{
		id: 'xai',
		credentialType: 'openAiApi',
		label: 'xAI (Grok)',
		placeholder: 'xai-…',
		defaultBaseUrl: 'https://api.x.ai/v1',
	},
	{
		id: 'mistral',
		credentialType: 'openAiApi',
		label: 'Mistral AI',
		placeholder: 'sk-…',
		defaultBaseUrl: 'https://api.mistral.ai/v1',
	},
	{
		id: 'together',
		credentialType: 'openAiApi',
		label: 'Together AI',
		placeholder: 'tgp_v1_…',
		defaultBaseUrl: 'https://api.together.xyz/v1',
	},
	{
		id: 'huggingface',
		credentialType: 'openAiApi',
		label: 'Hugging Face',
		placeholder: 'hf_…',
		defaultBaseUrl: 'https://router.huggingface.co/v1',
	},
	{
		id: 'custom',
		credentialType: 'openAiApi',
		label: null,
		placeholder: 'Leave empty for Ollama',
	},
];

export const INSTANCE_AI_SANDBOX_PROVIDERS = [
	{
		id: 'n8n-sandbox',
		label: SANDBOX_PROVIDER_LABELS['n8n-sandbox'],
		onboardingLabel: 'n8n Sandbox',
	},
	{ id: 'daytona', label: SANDBOX_PROVIDER_LABELS.daytona, onboardingLabel: 'Daytona' },
] as const satisfies ReadonlyArray<{
	id: InstanceAiSandboxProvider;
	label: string;
	onboardingLabel: string;
}>;

export const INSTANCE_AI_SEARCH_PROVIDERS = [
	{ id: 'searxng', credentialType: 'searXngApi', label: 'SearXNG' },
	{ id: 'brave', credentialType: 'braveSearchApi', label: 'Brave Search' },
] as const satisfies ReadonlyArray<{
	id: Exclude<InstanceAiSearchProvider, 'disabled'>;
	credentialType: (typeof INSTANCE_AI_SEARCH_CREDENTIAL_TYPES)[number];
	label: string;
}>;
