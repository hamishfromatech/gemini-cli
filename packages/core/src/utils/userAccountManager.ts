/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

export class UserAccountManager {
  async cacheGoogleAccount(_email: string): Promise<void> {
    // No-op: A-Coder CLI does not cache Google accounts.
  }

  getCachedGoogleAccount(): string | null {
    return null;
  }

  getLifetimeGoogleAccounts(): number {
    return 0;
  }

  async clearCachedGoogleAccount(): Promise<void> {
    // No-op: A-Coder CLI does not cache Google accounts.
  }
}
