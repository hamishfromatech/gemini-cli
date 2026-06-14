/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { type ACoderCliOperation } from './constants.js';

const TRACER_NAME = 'a-coder-cli';
const TRACER_VERSION = 'v1';

/**
 * Registry used to ensure that spans are properly ended when their associated
 * async objects are garbage collected.
 */
export const spanRegistry = new FinalizationRegistry((_endSpan: () => void) => {
  // No-op: telemetry is disabled.
});

export type AttributeValue = string | number | boolean;

export interface SpanOptions {
  attributes?: Record<string, AttributeValue>;
  kind?: number;
  links?: unknown[];
  parent?: unknown;
  root?: boolean;
  startTime?: number | Date;
}

/**
 * Truncates a value for inclusion in telemetry attributes.
 *
 * @param value The value to truncate.
 * @param maxLength The maximum length of the stringified value.
 * @returns The truncated value, or undefined if the value type is not supported.
 */
export function truncateForTelemetry(
  value: unknown,
  _maxLength = 10000,
): AttributeValue | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

/**
 * Metadata for a span.
 */
export interface SpanMetadata {
  /** The name of the span. */
  name: string;
  /** The input to the span. */
  input?: unknown;
  /** The output of the span. */
  output?: unknown;
  error?: unknown;
  /** Additional attributes for the span. */
  attributes: Record<string, AttributeValue>;
}

/**
 * Runs a function in a new OpenTelemetry span.
 *
 * The `meta` object will be automatically used to set the span's status and attributes upon completion.
 *
 * @example
 * ```typescript
 * await runInDevTraceSpan(
 *   { operation: ACoderCliOperation.LLMCall, sessionId: 'my-session' },
 *   async ({ metadata }) => {
 *     metadata.input = { foo: 'bar' };
 *     // ... do work ...
 *     metadata.output = { result: 'baz' };
 *     metadata.attributes['my.custom.attribute'] = 'some-value';
 *   }
 * );
 * ```
 *
 * @param opts The options for the span.
 * @param fn The function to run in the span.
 * @returns The result of the function.
 */
export async function runInDevTraceSpan<R>(
  opts: SpanOptions & {
    operation: ACoderCliOperation;
    logPrompts?: boolean;
    sessionId: string;
    tracesEnabled?: boolean;
  },
  fn: ({ metadata }: { metadata: SpanMetadata }) => Promise<R>,
): Promise<R> {
  const { operation } = opts;
  const meta: SpanMetadata = {
    name: operation,
    attributes: {},
  };
  return fn({ metadata: meta });
}
