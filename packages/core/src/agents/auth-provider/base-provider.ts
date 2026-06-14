/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { HttpHeaders } from '@a2a-js/sdk/client';
import type { A2AAuthProvider, A2AAuthProviderType } from './types.js';

export abstract class BaseA2AAuthProvider implements A2AAuthProvider {
  abstract readonly type: A2AAuthProviderType;

  abstract headers(): Promise<HttpHeaders>;

  protected static readonly MAX_AUTH_RETRIES = 2;
  protected authRetryCount = 0;

  async shouldRetryWithHeaders(
    _req: RequestInit,
    res: Response,
  ): Promise<HttpHeaders | undefined> {
    if (res.status === 401 || res.status === 403) {
      if (this.authRetryCount >= BaseA2AAuthProvider.MAX_AUTH_RETRIES) {
        return undefined;
      }
      this.authRetryCount++;
      return this.headers();
    }
    this.authRetryCount = 0;
    return undefined;
  }

  async initialize(): Promise<void> {
    // Default: no-op
  }
}
