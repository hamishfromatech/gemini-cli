/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export * from '@the-a-tech-corporation/test-utils';
export { normalizePath } from '@the-a-tech-corporation/test-utils';

export const skipFlaky = !process.env['RUN_FLAKY_INTEGRATION'];
