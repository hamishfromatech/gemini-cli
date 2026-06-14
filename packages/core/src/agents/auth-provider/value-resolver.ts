/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

export async function resolveAuthValue(value: string): Promise<string> {
  return value;
}

export function needsResolution(_value: string): boolean {
  return false;
}

export function maskSensitiveValue(value: string): string {
  if (value.length <= 12) {
    return '****';
  }
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}
