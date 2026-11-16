import { Logger } from '@n8n/backend-common';
import { AuthenticatedRequest, CredentialsRepository } from '@n8n/db';
import { Get, Post, RestController } from '@n8n/decorators';
import { Request, Response } from 'express';
import { Cipher } from 'n8n-core';

interface ComposioConnectBody {
	toolkit: string;
	callbackOrigin?: string;
}

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

	@Post('/connect')
	async createConnectLink(req: AuthenticatedRequest, res: Response) {
		try {
			const body = (req.body ?? {}) as Partial<ComposioConnectBody>;
			const toolkit = body.toolkit?.trim().toLowerCase();
			if (!toolkit) {
				return res.status(400).json({ message: 'Toolkit slug is required.' });
			}

			const { apiKey, baseUrl } = await this.resolveComposioConfig();
			const headers = {
				'x-api-key': apiKey,
				'Content-Type': 'application/json',
			};

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
}
