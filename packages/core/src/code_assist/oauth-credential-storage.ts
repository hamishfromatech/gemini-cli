/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

type Credentials = unknown;

/**
 * Stub storage for OAuth credentials. No credentials are persisted or loaded,
 * ensuring the CLI does not interact with Google OAuth endpoints at runtime.
 */
export class OAuthCredentialStorage {
  /**
   * Load cached OAuth credentials
   */
  static async loadCredentials(): Promise<Credentials | null> {
    return null;
  }

  /**
   * Save OAuth credentials
   */
  static async saveCredentials(
     
    _credentials: Credentials,
  ): Promise<void> {
    // No-op: do not persist credentials in the stub.
  }

  /**
   * Clear cached OAuth credentials
   */
  static async clearCredentials(): Promise<void> {
    // No-op: no credentials are persisted in the stub.
  }
}
