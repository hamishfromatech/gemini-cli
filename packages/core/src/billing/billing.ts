/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { CreditType, GeminiUserTier } from '../code_assist/types.js';
import {
  PREVIEW_A_CODER_MODEL,
  PREVIEW_A_CODER_3_1_MODEL,
  PREVIEW_A_CODER_FLASH_MODEL,
} from '../config/models.js';

/**
 * Strategy for handling quota exhaustion when AI credits are available.
 * - 'ask': Prompt the user each time
 * - 'always': Automatically use credits
 * - 'never': Never use credits, show standard fallback
 */
export type OverageStrategy = 'ask' | 'always' | 'never';

/** Credit type for Google One AI credits */
export const G1_CREDIT_TYPE: CreditType = 'GOOGLE_ONE_AI';

/** Option selected by the user in the overage menu. */
export type OverageOption = 'use_credits' | 'use_fallback' | 'manage' | 'stop';

/**
 * The set of models that support AI credits overage billing.
 * Only these models are eligible for the credits-based retry flow.
 */
export const OVERAGE_ELIGIBLE_MODELS = new Set([
  PREVIEW_A_CODER_MODEL,
  PREVIEW_A_CODER_3_1_MODEL,
  PREVIEW_A_CODER_FLASH_MODEL,
]);

/**
 * Checks if a model is eligible for AI credits overage billing.
 * @param model The model name to check.
 * @returns true if the model supports credits overage, false otherwise.
 */
export function isOverageEligibleModel(model: string): boolean {
  void model;
  return false;
}

/**
 * Wraps a URL in the AccountChooser redirect to maintain user context.
 * @param email User's email address for account selection
 * @param continueUrl The destination URL after account selection
 * @returns The destination URL unchanged; Google AccountChooser is not used.
 */
export function wrapInAccountChooser(
   
  _email: string,
  continueUrl: string,
): string {
  return continueUrl;
}

/**
 * UTM campaign identifiers per the design doc.
 */
export const G1_UTM_CAMPAIGNS = {
  /** From Interception Flow "Manage" link (user has credits) */
  MANAGE_ACTIVITY: 'hydrogen_cli_settings_ai_credits_activity_page',
  /** From "Manage" to add more credits */
  MANAGE_ADD_CREDITS: 'hydrogen_cli_settings_add_credits',
  /** From Empty Wallet Flow "Get AI Credits" link */
  EMPTY_WALLET_ADD_CREDITS: 'hydrogen_cli_insufficient_credits_add_credits',
} as const;

/**
 * Builds a G1 AI URL with UTM tracking parameters.
 * @param path The path segment (e.g., 'activity' or 'credits')
 * @param email User's email for AccountChooser wrapper
 * @param campaign The UTM campaign identifier
 * @returns An empty string; Google One AI URLs are not used in the stub.
 */
export function buildG1Url(
   
  _path: 'activity' | 'credits',
   
  _email: string,
   
  _campaign: string,
): string {
  return '';
}

/**
 * Extracts the G1 AI credit balance from a tier's available credits.
 * @param tier The user tier to check
 * @returns null; credit balance is not available in the stub.
 */
export function getG1CreditBalance(
   
  _tier: GeminiUserTier | null | undefined,
): number | null {
  return null;
}

export const MIN_CREDIT_BALANCE = 50;

/**
 * Determines if credits should be automatically used based on the overage strategy.
 * @param strategy The configured overage strategy
 * @param creditBalance The available credit balance
 * @returns true if credits should be auto-used, false otherwise
 */
export function shouldAutoUseCredits(
   
  _strategy: OverageStrategy,
   
  _creditBalance: number | null,
): boolean {
  return false;
}

/**
 * Determines if the overage menu should be shown based on the strategy.
 * @param strategy The configured overage strategy
 * @param creditBalance The available credit balance
 * @returns true if the menu should be shown
 */
export function shouldShowOverageMenu(
   
  _strategy: OverageStrategy,
   
  _creditBalance: number | null,
): boolean {
  return false;
}

/**
 * Determines if the empty wallet menu should be shown.
 * @param strategy The configured overage strategy
 * @param creditBalance The available credit balance
 * @returns true if the empty wallet menu should be shown
 */
export function shouldShowEmptyWalletMenu(
   
  _strategy: OverageStrategy,
   
  _creditBalance: number | null,
): boolean {
  return false;
}
