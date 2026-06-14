/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { HttpHeaders } from '@a2a-js/sdk/client';
import { BaseA2AAuthProvider } from './base-provider.js';
import type { ApiKeyAuthConfig } from './types.js';

export class ApiKeyAuthProvider extends BaseA2AAuthProvider {
  readonly type = 'apiKey' as const;

  constructor(private readonly config: ApiKeyAuthConfig) {
    super();
  }

  override async initialize(): Promise<void> {
    // No-op: A-Coder CLI auth providers are stubbed.
  }

  async headers(): Promise<HttpHeaders> {
    return {};
  }
}
