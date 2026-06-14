/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, type MutableRefObject } from 'react';
import type { LoadedSettings } from '../../config/settings.js';
import {
  AuthType,
  type Config,
  loadApiKey,
  debugLogger,
  isAccountSuspendedError,
  ProjectIdRequiredError,
} from '@the-a-tech-corporation/core';
import { getErrorMessage } from '@the-a-tech-corporation/core';
import { AuthState } from '../types.js';
import { validateAuthMethod } from '../../config/auth.js';

export async function validateAuthMethodWithSettings(
  authType: AuthType,
  settings: LoadedSettings,
): Promise<string | null> {
  const enforcedType = settings.merged.security.auth.enforcedType;
  if (enforcedType && enforcedType !== authType) {
    return `Authentication is enforced to be ${enforcedType}, but you are currently using ${authType}.`;
  }
  if (settings.merged.security.auth.useExternal) {
    return null;
  }
  // If using Gemini API key, we don't validate it here as we might need to prompt for it.
  if (authType === AuthType.USE_GEMINI) {
    return null;
  }
  return validateAuthMethod(authType);
}

import type { AccountSuspensionInfo } from '../contexts/UIStateContext.js';

export const useAuthCommand = (
  settings: LoadedSettings,
  config: Config,
  initialAuthError: string | null = null,
  initialAccountSuspensionInfo: AccountSuspensionInfo | null = null,
  openProviderDialogRef?: MutableRefObject<() => void>,
) => {
  const [authState, setAuthState] = useState<AuthState>(
    initialAuthError ? AuthState.Updating : AuthState.Unauthenticated,
  );

  const [authError, setAuthError] = useState<string | null>(initialAuthError);
  const [accountSuspensionInfo, setAccountSuspensionInfo] =
    useState<AccountSuspensionInfo | null>(initialAccountSuspensionInfo);
  const [apiKeyDefaultValue, setApiKeyDefaultValue] = useState<
    string | undefined
  >(undefined);

  const onAuthError = useCallback(
    (error: string | null) => {
      setAuthError(error);
      if (error) {
        setAuthState(AuthState.Updating);
      }
    },
    [setAuthError, setAuthState],
  );

  const reloadApiKey = useCallback(async () => {
    const envKey = process.env['OPENAI_API_KEY'];
    if (envKey !== undefined) {
      setApiKeyDefaultValue(envKey);
      return envKey;
    }

    const storedKey = (await loadApiKey()) ?? '';
    setApiKeyDefaultValue(storedKey);
    return storedKey;
  }, []);

  useEffect(() => {
    if (authState === AuthState.AwaitingApiKeyInput) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      reloadApiKey();
    }
  }, [authState, reloadApiKey]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      if (authState !== AuthState.Unauthenticated) {
        return;
      }

      const authType = settings.merged.security.auth.selectedType;
      if (!authType) {
        if (process.env['OPENAI_API_KEY']) {
          onAuthError(
            'Existing API key detected (OPENAI_API_KEY). Run /provider to configure your provider.',
          );
        } else if (openProviderDialogRef?.current) {
          openProviderDialogRef.current();
          setAuthState(AuthState.AwaitingProviderConfiguration);
        } else {
          onAuthError(
            'No authentication method selected. Run /provider to configure your provider.',
          );
        }
        return;
      }

      if (authType === AuthType.USE_GEMINI) {
        const key = await reloadApiKey(); // Use the unified function
        if (!key) {
          setAuthState(AuthState.AwaitingApiKeyInput);
          return;
        }
      }

      const error = await validateAuthMethodWithSettings(
        authType,
        settings,
      ).catch((e: unknown) => getErrorMessage(e));

      if (error) {
        onAuthError(error);
        return;
      }

      const defaultAuthType = process.env['A_CODER_DEFAULT_AUTH_TYPE'];
      if (
        defaultAuthType &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        !Object.values(AuthType).includes(defaultAuthType as AuthType)
      ) {
        onAuthError(
          `Invalid value for A_CODER_DEFAULT_AUTH_TYPE: "${defaultAuthType}". ` +
            `Valid values are: ${Object.values(AuthType).join(', ')}.`,
        );
        return;
      }

      try {
        await config.refreshAuth(authType);

        debugLogger.log(`Authenticated via "${authType}".`);
        setAuthError(null);
        setAuthState(AuthState.Authenticated);
      } catch (e) {
        const suspendedError = isAccountSuspendedError(e);
        if (suspendedError) {
          setAccountSuspensionInfo({
            message: suspendedError.message,
            appealUrl: suspendedError.appealUrl,
            appealLinkText: suspendedError.appealLinkText,
          });
        } else if (e instanceof ProjectIdRequiredError) {
          // OAuth succeeded but account setup requires project ID
          // Show the error message directly without "Failed to login" prefix
          onAuthError(getErrorMessage(e));
        } else {
          onAuthError(`Failed to sign in. Message: ${getErrorMessage(e)}`);
        }
      }
    })();
  }, [
    settings,
    config,
    authState,
    setAuthState,
    setAuthError,
    onAuthError,
    reloadApiKey,
    openProviderDialogRef,
  ]);

  return {
    authState,
    setAuthState,
    authError,
    onAuthError,
    apiKeyDefaultValue,
    reloadApiKey,
    accountSuspensionInfo,
    setAccountSuspensionInfo,
  };
};
