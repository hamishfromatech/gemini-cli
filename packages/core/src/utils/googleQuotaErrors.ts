/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { GoogleApiError } from './googleErrors.js';

export class TerminalQuotaError extends Error {
  retryDelayMs?: number;
  reason?: string;

  constructor(
    message: string,
    override readonly cause: GoogleApiError,
    retryDelaySeconds?: number,
    reason?: string,
  ) {
    super(message);
    this.name = 'TerminalQuotaError';
    this.retryDelayMs = retryDelaySeconds
      ? retryDelaySeconds * 1000
      : undefined;
    this.reason = reason;
  }

  get isInsufficientCredits(): boolean {
    return this.reason === 'INSUFFICIENT_G1_CREDITS_BALANCE';
  }
}

export class RetryableQuotaError extends Error {
  retryDelayMs?: number;

  constructor(
    message: string,
    override readonly cause: GoogleApiError,
    retryDelaySeconds?: number,
  ) {
    super(message);
    this.name = 'RetryableQuotaError';
    this.retryDelayMs = retryDelaySeconds
      ? retryDelaySeconds * 1000
      : undefined;
  }
}

export class ValidationRequiredError extends Error {
  validationLink?: string;
  validationDescription?: string;
  learnMoreUrl?: string;
  userHandled: boolean = false;

  constructor(
    message: string,
    override readonly cause?: GoogleApiError,
    validationLink?: string,
    validationDescription?: string,
    learnMoreUrl?: string,
  ) {
    super(message);
    this.name = 'ValidationRequiredError';
    this.validationLink = validationLink;
    this.validationDescription = validationDescription;
    this.learnMoreUrl = learnMoreUrl;
  }
}

export function classifyGoogleError(error: unknown): unknown {
  return error;
}
