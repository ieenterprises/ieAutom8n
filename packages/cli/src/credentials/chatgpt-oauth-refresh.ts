import type { CredentialsEntity, CredentialsRepository } from '@n8n/db';
import { Credentials } from 'n8n-core';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';

const inFlightChatGptRefreshes = new Map<string, Promise<ICredentialDataDecryptedObject>>();

/**
 * Refreshes an expired (or soon-to-expire) ChatGPT OAuth access token stored on
 * an `openAiApi` credential and persists the rotated tokens back to the DB.
 */
export async function refreshOpenAiChatGptTokenIfNeeded(params: {
	credential: CredentialsEntity;
	data: ICredentialDataDecryptedObject;
	credentialsRepository: CredentialsRepository;
	onWarn?: (message: string, meta: Record<string, unknown>) => void;
}): Promise<ICredentialDataDecryptedObject> {
	const { credential, data, credentialsRepository, onWarn } = params;

	if (credential.type !== 'openAiApi') {
		return data;
	}

	const refreshToken =
		typeof data.oauthRefreshToken === 'string' ? data.oauthRefreshToken.trim() : '';
	const expiresAt = typeof data.oauthTokenExpiresAt === 'number' ? data.oauthTokenExpiresAt : 0;
	if (!refreshToken || !expiresAt || Date.now() < expiresAt - 120_000) {
		return data;
	}

	const existing = inFlightChatGptRefreshes.get(credential.id);
	if (existing) {
		return await existing;
	}

	const refreshPromise = (async () => {
		try {
			const clientId =
				typeof data.oauthClientId === 'string' && data.oauthClientId.trim()
					? data.oauthClientId.trim()
					: 'dynamic_agent_client';

			const bodyParams = new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: clientId,
			});

			const res = await fetch('https://auth.openai.com/api/accounts/oauth/token', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: bodyParams.toString(),
			});

			if (!res.ok) {
				onWarn?.(`ChatGPT OAuth token refresh failed with status ${res.status}`, {
					credentialId: credential.id,
				});
				return data;
			}

			const tokenJson = (await res.json()) as {
				access_token?: string;
				refresh_token?: string;
				expires_in?: number;
			};

			if (!tokenJson.access_token) {
				return data;
			}

			const updatedData: ICredentialDataDecryptedObject = {
				...data,
				apiKey: tokenJson.access_token,
				oauthRefreshToken: tokenJson.refresh_token || refreshToken,
				oauthTokenExpiresAt: Date.now() + (tokenJson.expires_in ?? 3600) * 1000,
				oauthClientId: clientId,
			};

			const coreCred = new Credentials(
				{ id: credential.id, name: credential.name },
				credential.type,
			);
			await coreCred.setData(updatedData);
			const savedData = coreCred.getDataToSave().data;

			if (savedData) {
				await credentialsRepository.update(credential.id, {
					data: savedData,
					updatedAt: new Date(),
				});
				credential.data = savedData;
			}

			return updatedData;
		} catch (error) {
			onWarn?.('Failed to auto-refresh ChatGPT OAuth token', {
				credentialId: credential.id,
				error: error instanceof Error ? error.message : String(error),
			});
			return data;
		} finally {
			inFlightChatGptRefreshes.delete(credential.id);
		}
	})();

	inFlightChatGptRefreshes.set(credential.id, refreshPromise);
	return await refreshPromise;
}
