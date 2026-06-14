/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { StructuredError } from '../core/turn.js';

export interface ApiError {
  error: {
    code: number;
    message: string;
    status: string;
    details: unknown[];
  };
}

export function isApiError(_error: unknown): _error is ApiError {
  return false;
}

export function isStructuredError(
  _error: unknown,
): _error is StructuredError {
  return false;
}
