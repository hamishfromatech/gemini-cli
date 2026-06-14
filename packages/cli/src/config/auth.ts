/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@the-a-tech-corporation/core';

export async function validateAuthMethod(
  authMethod: string,
): Promise<string | null> {
  if (
    authMethod === AuthType.USE_OPENAI ||
    authMethod === AuthType.USE_OPENAI_COMPATIBLE
  ) {
    return null;
  }

  return 'Invalid auth method selected.';
}
