/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

type AuthClient = unknown;
import { EventEmitter } from 'node:events';
import type { AuthType } from '../core/contentGenerator.js';
import type { Config } from '../config/config.js';

export const authEvents = new EventEmitter();

/**
 * An Authentication URL for updating the credentials of a Oauth2Client
 * as well as a promise that will resolve when the credentials have
 * been refreshed (or which throws error when refreshing credentials failed).
 */
export interface OauthWebLogin {
  authUrl: string;
  loginCompletePromise: Promise<void>;
}

const oauthClientPromises = new Map<AuthType, Promise<AuthClient>>();

function createStubAuthClient(): AuthClient {
  return {
    request: async () => ({ data: undefined as unknown }),
    getAccessToken: async () => ({ token: null, res: undefined }),
  } as unknown;
}

export async function getOauthClient(
  authType: AuthType,
   
  _config: Config,
): Promise<AuthClient> {
  if (!oauthClientPromises.has(authType)) {
    oauthClientPromises.set(authType, Promise.resolve(createStubAuthClient()));
  }
  return oauthClientPromises.get(authType)!;
}

export function clearOauthClientCache() {
  oauthClientPromises.clear();
}

export async function clearCachedCredentialFile() {
  // No-op: credentials are not persisted in the stub.
}

export function resetOauthClientForTesting() {
  oauthClientPromises.clear();
}

export function getAvailablePort(): Promise<number> {
  return Promise.resolve(0);
}
