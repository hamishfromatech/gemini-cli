/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { HttpHeaders } from '@a2a-js/sdk/client';
import { BaseA2AAuthProvider } from './base-provider.js';
import type { HttpAuthConfig } from './types.js';

export class HttpAuthProvider extends BaseA2AAuthProvider {
  readonly type = 'http' as const;

  constructor(private readonly config: HttpAuthConfig) {
    super();
  }

  override async initialize(): Promise<void> {
    // No-op: A-Coder CLI auth providers are stubbed.
  }

  async headers(): Promise<HttpHeaders> {
    return {};
  }
}
