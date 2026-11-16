import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Logger } from '@n8n/backend-common';
import { AuthenticatedRequest, CredentialsRepository } from '@n8n/db';
import { Get, Post, RestController } from '@n8n/decorators';
import { Request, Response } from 'express';
import { Cipher } from 'n8n-core';

interface ComposioConnectBody {
	toolkit: string;
	credentialTypeName?: string;
	serviceName?: string;
	callbackOrigin?: string;
}

interface ComposioToolkitItem {
	slug: string;
	name: string;
}

const CREDENTIAL_TO_TOOLKIT_OVERRIDES: Record<string, string> = {
	gmailoauth2: 'gmail',
	googleoauth2api: 'gmail',
	googlesheetsoauth2api: 'googlesheets',
	googlesheetstriggeroauth2api: 'googlesheets',
	googledriveoauth2api: 'googledrive',
	googlecalendaroauth2api: 'googlecalendar',
	googledocsoauth2api: 'googledocs',
	googleslidesoauth2api: 'googleslides',
	googletasksoauth2api: 'googletasks',
	googlecontactsoauth2api: 'googlecontacts',
	googleadsoauth2api: 'googleads',
	googleanalyticsoauth2: 'google_analytics',
	googlebigqueryoauth2api: 'google_bigquery',
	googlechatoauth2api: 'google_chat',
	microsoftoutlookoauth2api: 'outlook',
	microsoftonedriveoauth2api: 'one_drive',
	microsoftteamsoauth2api: 'microsoft_teams',
	microsoftteamsmanageroauth2api: 'microsoft_teams',
	microsoftexceloauth2api: 'excel',
	microsoftsharepointoauth2api: 'share_point',
	microsofttodooauth2api: 'microsoft_todo',
	microsoftonenoteoauth2api: 'one_note',
	microsoftdynamicsoauth2api: 'dynamics365',
	slackoauth2api: 'slack',
	githuboauth2api: 'github',
	notionoauth2api: 'notion',
	linearoauth2api: 'linear',
	jiraoauth2api: 'jira',
	jirasoftwarecloudoauth2api: 'jira',
	hubspotoauth2api: 'hubspot',
	salesforceoauth2api: 'salesforce',
	airtableoauth2api: 'airtable',
	asanaoauth2api: 'asana',
	trellooauth2api: 'trello',
	discordoauth2api: 'discord',
	zoomoauth2api: 'zoom',
	dropboxoauth2api: 'dropbox',
	boxoauth2api: 'box',
	quickbooksoauth2api: 'quickbooks',
	xerooauth2api: 'xero',
	zohooauth2api: 'zoho',
	mailchimpoauth2api: 'mailchimp',
	zendeskoauth2api: 'zendesk',
	intercomoauth2api: 'intercom',
	figmaoauth2api: 'figma',
	shopifyoauth2api: 'shopify',
	stripeoauth2api: 'stripe',
	spotifyoauth2api: 'spotify',
};

@RestController('/composio')
export class ComposioController {
	constructor(
		private readonly logger: Logger,
		private readonly credentialsRepository: CredentialsRepository,
		private readonly cipher: Cipher,
	) {
		// Pre-warm Composio key from DB on startup so triggers/workflows work immediately after restart
		void this.resolveComposioConfig().catch(() => {});
	}

	private async resolveComposioConfig(): Promise<{ apiKey: string; baseUrl: string }> {
		const envKey = process.env.COMPOSIO_API_KEY?.trim();
		const envBase = process.env.COMPOSIO_BASE_URL?.trim() || 'https://backend.composio.dev';
		if (envKey) {
			const baseUrl = envBase.replace(/\/+$/, '');
			process.env.__IEAUTOM8N_COMPOSIO_API_KEY = envKey;
			process.env.__IEAUTOM8N_COMPOSIO_BASE_URL = baseUrl;
			return { apiKey: envKey, baseUrl };
		}

		const creds = await this.credentialsRepository.find({
			where: { type: 'composioApi' },
			take: 5,
		});

		for (const cred of creds) {
			try {
				const decrypted = await this.cipher.decryptV2(cred.data);
				const parsed = JSON.parse(decrypted) as { apiKey?: string; baseUrl?: string };
				if (parsed.apiKey && parsed.apiKey.trim()) {
					const apiKey = parsed.apiKey.trim();
					const baseUrl = (parsed.baseUrl?.trim() || envBase).replace(/\/+$/, '');
					process.env.__IEAUTOM8N_COMPOSIO_API_KEY = apiKey;
					process.env.__IEAUTOM8N_COMPOSIO_BASE_URL = baseUrl;
					return { apiKey, baseUrl };
				}
			} catch (err) {
				this.logger.warn('Failed to decrypt composioApi credential', { error: err });
			}
		}

		throw new Error(
			'No Composio API key configured. Set COMPOSIO_API_KEY on the server or save a Composio API credential first.',
		);
	}

	private getCallbackOrigin(req: Request, requestedOrigin?: string): string {
		if (requestedOrigin) {
			try {
				const parsed = new URL(requestedOrigin);
				if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
					return parsed.origin;
				}
			} catch {
				// ignore invalid origin
			}
		}
		const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol;
		const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host');
		return `${proto}://${host}`;
	}

	private cachedToolkits: { items: ComposioToolkitItem[]; fetchedAt: number } | null = null;

	private async getComposioToolkits(
		baseUrl: string,
		headers: Record<string, string>,
	): Promise<ComposioToolkitItem[]> {
		if (this.cachedToolkits && Date.now() - this.cachedToolkits.fetchedAt < 10 * 60_000) {
			return this.cachedToolkits.items;
		}
		try {
			const res = await fetch(`${baseUrl}/api/v3/toolkits?limit=1000`, {
				method: 'GET',
				headers,
			});
			if (!res.ok) return this.cachedToolkits?.items ?? [];
			const json = (await res.json()) as { items?: ComposioToolkitItem[] };
			const items = json.items ?? [];
			this.cachedToolkits = { items, fetchedAt: Date.now() };
			return items;
		} catch {
			return this.cachedToolkits?.items ?? [];
		}
	}

	private async resolveToolkitSlug(
		baseUrl: string,
		headers: Record<string, string>,
		rawToolkit: string,
		credentialTypeName?: string,
		serviceName?: string,
	): Promise<string> {
		const credKey = credentialTypeName?.trim().toLowerCase() ?? '';
		if (credKey && CREDENTIAL_TO_TOOLKIT_OVERRIDES[credKey]) {
			return CREDENTIAL_TO_TOOLKIT_OVERRIDES[credKey];
		}

		const toolkits = await this.getComposioToolkits(baseUrl, headers);
		if (toolkits.length === 0) return rawToolkit;

		const candidates = new Set<string>();
		if (rawToolkit) candidates.add(rawToolkit.toLowerCase());
		if (credKey) {
			candidates.add(credKey.replace(/oauth2api|oauth2|oauth|api$/gi, ''));
		}
		if (serviceName) {
			const svc = serviceName.trim().toLowerCase();
			candidates.add(svc);
			candidates.add(svc.replace(/\s+/g, '_'));
			candidates.add(svc.replace(/\s+/g, ''));
			candidates.add(svc.replace(/^(microsoft|google)\s+/i, '').trim());
		}

		// 1. Exact slug match
		for (const c of candidates) {
			const hit = toolkits.find((t) => t.slug.toLowerCase() === c);
			if (hit) return hit.slug;
		}

		// 2. Normalized slug or name match (ignore underscores/hyphens/spaces)
		const norm = (s: string) => s.toLowerCase().replace(/[_-\s]+/g, '');
		for (const c of candidates) {
			const nc = norm(c);
			if (!nc) continue;
			const hit = toolkits.find((t) => norm(t.slug) === nc || norm(t.name) === nc);
			if (hit) return hit.slug;
		}

		return rawToolkit;
	}

	@Post('/connect')
	async createConnectLink(req: AuthenticatedRequest, res: Response) {
		try {
			const body = (req.body ?? {}) as Partial<ComposioConnectBody>;
			const rawToolkit = body.toolkit?.trim().toLowerCase() ?? '';
			if (!rawToolkit && !body.credentialTypeName && !body.serviceName) {
				return res.status(400).json({ message: 'Toolkit slug is required.' });
			}

			const { apiKey, baseUrl } = await this.resolveComposioConfig();
			const headers = {
				'x-api-key': apiKey,
				'Content-Type': 'application/json',
			};

			const toolkit = await this.resolveToolkitSlug(
				baseUrl,
				headers,
				rawToolkit,
				body.credentialTypeName,
				body.serviceName,
			);

			// 1. Find existing auth config for this toolkit
			let authConfigId: string | undefined;
			const listRes = await fetch(
				`${baseUrl}/api/v3/auth_configs?toolkit_slug=${encodeURIComponent(toolkit)}`,
				{ method: 'GET', headers },
			);

			if (listRes.ok) {
				const listData = (await listRes.json()) as { items?: Array<{ id: string }> };
				if (listData.items && listData.items.length > 0) {
					authConfigId = listData.items[0].id;
				}
			}

			// 2. Auto-create Composio Managed Auth config if none exists yet
			if (!authConfigId) {
				const createConfigRes = await fetch(`${baseUrl}/api/v3/auth_configs`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						toolkit: { slug: toolkit },
						auth_config: { type: 'use_composio_managed_auth' },
					}),
				});

				if (!createConfigRes.ok) {
					const errText = await createConfigRes.text();
					this.logger.error('Failed to create Composio auth config', {
						toolkit,
						status: createConfigRes.status,
						errText,
					});
					return res.status(createConfigRes.status).json({
						message: `Composio could not initialize managed auth for "${toolkit}": ${errText}`,
					});
				}

				const createdConfig = (await createConfigRes.json()) as {
					auth_config?: { id: string };
					id?: string;
				};
				authConfigId = createdConfig.auth_config?.id ?? createdConfig.id;
			}

			if (!authConfigId) {
				return res.status(502).json({
					message: `Could not resolve an auth_config_id for toolkit "${toolkit}".`,
				});
			}

			// 3. Create hosted Connect Link
			const origin = this.getCallbackOrigin(req, body.callbackOrigin);
			const callbackUrl = `${origin}/rest/composio/callback?toolkit=${encodeURIComponent(toolkit)}`;
			const userId = req.user?.id || 'default';

			const linkRes = await fetch(`${baseUrl}/api/v3/connected_accounts/link`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					user_id: userId,
					auth_config_id: authConfigId,
					callback_url: callbackUrl,
				}),
			});

			if (!linkRes.ok) {
				const errText = await linkRes.text();
				this.logger.error('Failed to create Composio connect link', {
					toolkit,
					status: linkRes.status,
					errText,
				});
				return res.status(linkRes.status).json({
					message: `Composio failed to create connect link: ${errText}`,
				});
			}

			const linkData = (await linkRes.json()) as {
				redirect_url?: string;
				connected_account_id?: string;
			};

			if (!linkData.redirect_url) {
				return res.status(502).json({ message: 'Composio did not return a redirect_url.' });
			}

			return res.json({
				data: {
					redirectUrl: linkData.redirect_url,
					connectedAccountId: linkData.connected_account_id,
					toolkit,
				},
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to start Composio connect';
			this.logger.error('Composio connect error', { error });
			return res.status(400).json({ message });
		}
	}

	@Get('/callback', { skipAuth: true })
	handleCallback(req: Request, res: Response) {
		const connectedAccountId = String(req.query.connected_account_id ?? '');
		const status = String(req.query.status ?? 'success');
		const toolkit = String(req.query.toolkit ?? '');
		const error = String(req.query.error ?? '');

		const payload = JSON.stringify({
			type: 'composio:oauth-complete',
			connectedAccountId,
			status,
			toolkit,
			error,
		}).replaceAll('<', '\\u003c');

		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		return res.send(`<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Connected · ieAutom8n</title>
	<style>
		body { font-family: system-ui, -apple-system, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #fafafa; color: #18181b; }
		.card { text-align: center; padding: 32px; max-width: 360px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
		h1 { font-size: 18px; margin: 0 0 8px; }
		p { font-size: 14px; color: #52525b; margin: 0; }
	</style>
</head>
<body>
	<div class="card">
		<h1>${error ? 'Connection failed' : 'Connected to Composio'}</h1>
		<p>${error ? 'Please close this window and try again.' : 'You can close this window and return to ieAutom8n.'}</p>
	</div>
	<script>
		(function () {
			try {
				if (window.opener) {
					window.opener.postMessage(${payload}, window.location.origin);
				}
			} catch (e) {}
			setTimeout(function () { window.close(); }, 400);
		})();
	</script>
</body>
</html>`);
	}

	@Get('/openrouter-callback', { skipAuth: true })
	handleOpenRouterCallback(req: Request, res: Response) {
		const code = String(req.query.code ?? '');
		const error = String(req.query.error ?? '');

		const payload = JSON.stringify({
			type: 'openrouter:oauth-complete',
			code,
			error,
		}).replaceAll('<', '\\u003c');

		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		return res.send(`<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>OpenRouter Connected · ieAutom8n</title>
	<style>
		body { font-family: system-ui, -apple-system, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #fafafa; color: #18181b; }
		.card { text-align: center; padding: 32px; max-width: 360px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
		h1 { font-size: 18px; margin: 0 0 8px; }
		p { font-size: 14px; color: #52525b; margin: 0; }
	</style>
</head>
<body>
	<div class="card">
		<h1>${error || !code ? 'OpenRouter sign-in failed' : 'Connected to OpenRouter'}</h1>
		<p>${error || !code ? 'Please close this window and try again.' : 'Returning to ieAutom8n...'}</p>
	</div>
	<script>
		(function () {
			try {
				if (typeof BroadcastChannel !== 'undefined') {
					var bc = new BroadcastChannel('ieautom8n_openrouter_oauth');
					bc.postMessage(${payload});
					bc.close();
				}
			} catch (e) {}
			try {
				if (window.opener) {
					window.opener.postMessage(${payload}, window.location.origin);
				}
			} catch (e) {}
			setTimeout(function () { window.close(); }, 400);
		})();
	</script>
</body>
</html>`);
	}

	@Post('/openrouter-exchange')
	async exchangeOpenRouterCode(req: AuthenticatedRequest, res: Response) {
		try {
			const body = (req.body ?? {}) as { code?: string; codeVerifier?: string };
			const code = body.code?.trim();
			const codeVerifier = body.codeVerifier?.trim();
			if (!code || !codeVerifier) {
				return res.status(400).json({ message: 'Missing OpenRouter code or codeVerifier.' });
			}

			const exchangeRes = await fetch('https://openrouter.ai/api/v1/auth/keys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					code,
					code_verifier: codeVerifier,
					code_challenge_method: 'S256',
				}),
			});

			if (!exchangeRes.ok) {
				const errText = await exchangeRes.text();
				this.logger.error('OpenRouter key exchange failed', {
					status: exchangeRes.status,
					errText,
				});
				return res.status(exchangeRes.status).json({
					message: `OpenRouter key exchange failed: ${errText}`,
				});
			}

			const data = (await exchangeRes.json()) as { key?: string };
			if (!data.key) {
				return res.status(502).json({ message: 'OpenRouter did not return an API key.' });
			}

			return res.json({ data: { key: data.key } });
		} catch (error) {
			const message = error instanceof Error ? error.message : 'OpenRouter key exchange failed';
			return res.status(400).json({ message });
		}
	}

	private pendingChatGptFlows = new Map<
		string,
		{ codeVerifier: string; nonce: string; createdAt: number }
	>();

	@Post('/chatgpt-start')
	startChatGptAuth(req: AuthenticatedRequest, res: Response) {
		// Clean up expired flows older than 15 minutes
		const now = Date.now();
		for (const [k, v] of this.pendingChatGptFlows) {
			if (now - v.createdAt > 15 * 60_000) this.pendingChatGptFlows.delete(k);
		}

		const codeVerifier = randomBytes(32).toString('base64url');
		const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
		const state = randomBytes(24).toString('base64url');
		const nonce = randomBytes(24).toString('base64url');

		this.pendingChatGptFlows.set(state, { codeVerifier, nonce, createdAt: now });

		const authUrl = new URL('https://auth.openai.com/api/accounts/authorize');
		authUrl.searchParams.set('response_type', 'code');
		authUrl.searchParams.set('client_id', 'dynamic_agent_client');
		authUrl.searchParams.set('redirect_uri', 'http://127.0.0.1:1455/auth/callback');
		authUrl.searchParams.set(
			'scope',
			'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct',
		);
		authUrl.searchParams.set('resource', 'https://api.openai.com/v1');
		authUrl.searchParams.set('code_challenge', codeChallenge);
		authUrl.searchParams.set('code_challenge_method', 'S256');
		authUrl.searchParams.set('state', state);
		authUrl.searchParams.set('nonce', nonce);

		return res.json({
			data: {
				authUrl: authUrl.toString(),
				state,
			},
		});
	}

	@Post('/chatgpt-complete')
	async completeChatGptAuth(req: AuthenticatedRequest, res: Response) {
		try {
			const body = (req.body ?? {}) as { callbackUrl?: string; state?: string };
			const rawCallback = body.callbackUrl?.trim();
			if (!rawCallback) {
				return res.status(400).json({ message: 'Callback URL is required.' });
			}

			let parsedUrl: URL;
			try {
				parsedUrl = new URL(rawCallback);
			} catch {
				return res.status(400).json({ message: 'Invalid Callback URL format.' });
			}

			const errorParam = parsedUrl.searchParams.get('error');
			if (errorParam) {
				const desc = parsedUrl.searchParams.get('error_description') || errorParam;
				return res.status(400).json({ message: `ChatGPT sign-in error: ${desc}` });
			}

			const code = parsedUrl.searchParams.get('code')?.trim();
			const state = parsedUrl.searchParams.get('state')?.trim() || body.state?.trim() || '';
			const issuedClientId =
				parsedUrl.searchParams.get('client_id')?.trim() || 'dynamic_agent_client';

			if (!code || !state) {
				return res.status(400).json({
					message: 'The Callback URL is missing the required code or state parameter.',
				});
			}

			const pending = this.pendingChatGptFlows.get(state);
			if (!pending) {
				return res.status(400).json({
					message: 'Sign-in session expired or state did not match. Please start sign-in again.',
				});
			}
			this.pendingChatGptFlows.delete(state);

			const tokenParams = new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: 'http://127.0.0.1:1455/auth/callback',
				client_id: issuedClientId,
				code_verifier: pending.codeVerifier,
			});

			const tokenRes = await fetch('https://auth.openai.com/oauth/token', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: tokenParams.toString(),
			});

			const tokenText = await tokenRes.text();
			if (!tokenRes.ok) {
				this.logger.error('ChatGPT OAuth token exchange failed', {
					status: tokenRes.status,
					tokenText,
				});
				return res.status(tokenRes.status).json({
					message: `ChatGPT token exchange failed: ${tokenText}`,
				});
			}

			const tokenJson = JSON.parse(tokenText) as {
				access_token?: string;
				refresh_token?: string;
				expires_in?: number;
			};

			if (!tokenJson.access_token) {
				return res.status(502).json({ message: 'OpenAI did not return an access_token.' });
			}

			return res.json({
				data: {
					accessToken: tokenJson.access_token,
					refreshToken: tokenJson.refresh_token,
					expiresIn: tokenJson.expires_in,
					clientId: issuedClientId,
				},
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to complete ChatGPT sign-in';
			return res.status(400).json({ message });
		}
	}
}
