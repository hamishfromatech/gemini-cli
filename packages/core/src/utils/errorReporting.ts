/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import os from 'node:os';

export async function reportError(
  _error: unknown,
  _baseMessage: string,
  _context?: unknown,
  _type = 'general',
  _reportingDir = os.tmpdir(),
): Promise<void> {
  // No-op: A-Coder CLI does not use external error reporting.
}
