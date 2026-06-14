/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

/**
 * Compile-time stubs for OAuth 2.0 Authorization Code flow primitives.
 */

export interface OAuthFlowConfig {
  clientId: string;
  clientSecret?: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes?: string[];
  audiences?: string[];
  redirectUri?: string;
}

export type OAuthRefreshConfig = Pick<
  OAuthFlowConfig,
  'clientId' | 'clientSecret' | 'scopes' | 'audiences'
>;

export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

export interface OAuthAuthorizationResponse {
  code: string;
  state: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export const REDIRECT_PATH = '/oauth/callback';

export function generatePKCEParams(): PKCEParams {
  return {
    codeVerifier: 'stub-verifier',
    codeChallenge: 'stub-challenge',
    state: 'stub-state',
  };
}

export function startCallbackServer(
  _expectedState: string,
  _port?: number,
): {
  port: Promise<number>;
  response: Promise<OAuthAuthorizationResponse>;
} {
  return {
    port: Promise.resolve(0),
    response: new Promise<OAuthAuthorizationResponse>(() => {}),
  };
}

export function getPortFromUrl(urlString?: string): number | undefined {
  if (!urlString) {
    return undefined;
  }

  try {
    const url = new URL(urlString);
    if (url.port) {
      const parsedPort = parseInt(url.port, 10);
      if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
        return parsedPort;
      }
    }
  } catch {
    // Ignore invalid URL
  }

  return undefined;
}

export function buildAuthorizationUrl(
  _config: OAuthFlowConfig,
  _pkceParams: PKCEParams,
  _redirectPort: number,
  _resource?: string,
): string {
  return '';
}

export async function exchangeCodeForToken(
  _config: OAuthFlowConfig,
  _code: string,
  _codeVerifier: string,
  _redirectPort: number,
  _resource?: string,
): Promise<OAuthTokenResponse> {
  return {
    access_token: 'stub-access-token',
    token_type: 'Bearer',
  };
}

export async function refreshAccessToken(
  _config: OAuthRefreshConfig,
  _refreshToken: string,
  _tokenUrl: string,
  _resource?: string,
): Promise<OAuthTokenResponse> {
  return {
    access_token: 'stub-access-token',
    token_type: 'Bearer',
  };
}
