/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfig } from '../contexts/ConfigContext.js';
import { useSettingsStore } from '../contexts/SettingsContext.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { TextInput } from './shared/TextInput.js';
import { useTextBuffer } from './shared/text-buffer.js';
import { DescriptiveRadioButtonSelect } from './shared/DescriptiveRadioButtonSelect.js';
import { CliSpinner } from './CliSpinner.js';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import {
  AuthType,
  saveApiKey,
  type Config,
} from '@the-a-tech-corporation/core';
import { SettingScope } from '../../config/settings.js';
import {
  fetchOpenAIModels,
  normalizeBaseUrl,
} from '../../services/modelProviderService.js';

interface ProviderDialogProps {
  mode: 'provider' | 'models';
  initialBaseUrl?: string;
  initialApiKey?: string;
  onClose: () => void;
  onConfigured?: (model: string, baseUrl: string, apiKey?: string) => void;
}

type DialogView = 'baseUrl' | 'apiKey' | 'loading' | 'models' | 'error';

function getDefaultBaseUrl(config: Config | null, settingsBaseUrl?: string): string {
  return (
    settingsBaseUrl ||
    config?.getContentGeneratorConfig()?.baseUrl ||
    process.env['A_CODER_BASE_URL'] ||
    process.env['OPENAI_BASE_URL'] ||
    'http://localhost:11434'
  );
}

function isValidUrl(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function ProviderDialog({
  mode,
  initialBaseUrl,
  initialApiKey = '',
  onClose,
  onConfigured,
}: ProviderDialogProps): React.JSX.Element {
  const config = useConfig();
  const { settings, setSetting } = useSettingsStore();
  const { terminalWidth } = useUIState();
  const viewportWidth = Math.max(20, terminalWidth - 8);

  const settingsBaseUrl = settings.merged.provider?.baseUrl;
  const defaultBaseUrl = useMemo(
    () => getDefaultBaseUrl(config, initialBaseUrl ?? settingsBaseUrl),
    [config, initialBaseUrl, settingsBaseUrl],
  );

  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [view, setView] = useState<DialogView>(() => {
    if (mode === 'models') {
      return defaultBaseUrl ? 'loading' : 'error';
    }
    return 'baseUrl';
  });
  const [models, setModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const baseUrlBuffer = useTextBuffer({
    initialText: defaultBaseUrl,
    initialCursorOffset: defaultBaseUrl.length,
    viewport: { width: viewportWidth, height: 4 },
    singleLine: true,
    inputFilter: (text) => text.replace(/[\r\n]/g, ''),
  });

  const apiKeyBuffer = useTextBuffer({
    initialText: initialApiKey,
    initialCursorOffset: initialApiKey.length,
    viewport: { width: viewportWidth, height: 4 },
    singleLine: true,
    inputFilter: (text) => text.replace(/[\r\n]/g, ''),
  });

  const handleBaseUrlSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || !isValidUrl(trimmed)) {
        setError('Please enter a valid URL.');
        setView('error');
        return;
      }
      setBaseUrl(trimmed);
      setView('apiKey');
    },
    [setBaseUrl, setView, setError],
  );

  const handleApiKeySubmit = useCallback(
    (value: string) => {
      setApiKey(value.trim());
      setView('loading');
    },
    [setApiKey, setView],
  );

  const handleApiKeyCancel = useCallback(() => {
    if (mode === 'provider') {
      setView('baseUrl');
    } else {
      onClose();
    }
  }, [mode, onClose, setView]);

  const loadModels = useCallback(async () => {
    setError(null);
    try {
      const normalized = normalizeBaseUrl(baseUrl);
      const fetched = await fetchOpenAIModels(normalized, apiKey || undefined);
      if (fetched.length === 0) {
        setError('The provider returned no models.');
        setView('error');
        return;
      }
      setModels(fetched);
      setView('models');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setView('error');
    }
  }, [baseUrl, apiKey]);

  useEffect(() => {
    if (view === 'loading') {
      void loadModels();
    }
  }, [view, loadModels]);

  useEffect(() => {
    if (mode === 'models' && !defaultBaseUrl) {
      setError('No provider is configured. Run /provider to configure one.');
    }
  }, [mode, defaultBaseUrl]);

  const handleRetry = useCallback(() => {
    setView('loading');
  }, [setView]);

  const handleBackFromError = useCallback(() => {
    if (mode === 'provider') {
      setView('baseUrl');
    } else {
      onClose();
    }
  }, [mode, onClose, setView]);

  const handleSelectModel = useCallback(
    async (model: string) => {
      if (model === '__cancel__') {
        onClose();
        return;
      }

      if (!config) {
        setError('Config is not available.');
        setView('error');
        return;
      }

      try {
        const normalized = normalizeBaseUrl(baseUrl);
        const finalApiKey = apiKey || undefined;

        if (finalApiKey) {
          await saveApiKey(finalApiKey);
        }

        setSetting(SettingScope.User, 'provider.baseUrl', normalized);
        setSetting(
          SettingScope.User,
          'security.auth.selectedType',
          AuthType.USE_OPENAI_COMPATIBLE,
        );
        config.setModel(model, false);
        await config.refreshAuth(
          AuthType.USE_OPENAI_COMPATIBLE,
          finalApiKey || '',
          normalized,
        );

        onConfigured?.(model, normalized, finalApiKey);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setView('error');
      }
    },
    [baseUrl, apiKey, config, onConfigured, onClose, setSetting],
  );

  const modelOptions = useMemo(
    () => [
      ...models.map((m) => ({ value: m, title: m, description: '', key: m })),
      {
        value: '__cancel__',
        title: 'Cancel',
        description: 'Keep the current model and provider',
        key: '__cancel__',
      },
    ],
    [models],
  );

  useKeypress(
    (key) => {
      if (view !== 'error') {
        return false;
      }
      if (key.name === 'escape') {
        handleBackFromError();
        return true;
      }
      if (key.name === 'enter' && mode === 'provider') {
        handleRetry();
        return true;
      }
      return false;
    },
    { isActive: view === 'error' },
  );

  const inputBox = (
    <Box
      borderStyle="round"
      borderColor={theme.border.default}
      paddingX={1}
      flexGrow={1}
    >
      {view === 'baseUrl' ? (
        <TextInput
          buffer={baseUrlBuffer}
          onSubmit={handleBaseUrlSubmit}
          onCancel={onClose}
          placeholder="http://localhost:11434"
        />
      ) : view === 'apiKey' ? (
        <TextInput
          buffer={apiKeyBuffer}
          onSubmit={handleApiKeySubmit}
          onCancel={handleApiKeyCancel}
          placeholder="API key (optional)"
        />
      ) : null}
    </Box>
  );

  return (
    <Box
      borderStyle="round"
      borderColor={theme.border.default}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold>
        {mode === 'provider' ? 'Configure Provider' : 'Select Model'}
      </Text>

      {view === 'baseUrl' && (
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.text.primary}>Enter the provider base URL:</Text>
          <Text color={theme.text.secondary}>
            /v1 will be appended automatically.
          </Text>
          <Box marginTop={1} flexDirection="row">
            {inputBox}
          </Box>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              (Press Enter to continue, Esc to cancel)
            </Text>
          </Box>
        </Box>
      )}

      {view === 'apiKey' && (
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.text.primary}>
            Enter an API key for {normalizeBaseUrl(baseUrl)}:
          </Text>
          <Text color={theme.text.secondary}>Leave blank if the provider does not require a key.</Text>
          <Box marginTop={1} flexDirection="row">
            {inputBox}
          </Box>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              (Press Enter to continue, Esc to go back)
            </Text>
          </Box>
        </Box>
      )}

      {view === 'loading' && (
        <Box marginTop={1} flexDirection="row">
          <Text>Fetching models from {normalizeBaseUrl(baseUrl)}... </Text>
          <CliSpinner />
        </Box>
      )}

      {view === 'models' && (
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.text.primary}>
            Choose a model from {normalizeBaseUrl(baseUrl)}:
          </Text>
          <Box marginTop={1}>
            <DescriptiveRadioButtonSelect
              items={modelOptions}
              onSelect={handleSelectModel}
              showNumbers={true}
            />
          </Box>
        </Box>
      )}

      {view === 'error' && (
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.status.error}>{error}</Text>
          <Box marginTop={1}>
            {mode === 'provider' ? (
              <Text color={theme.text.secondary}>
                (Press Enter to retry, Esc to go back)
              </Text>
            ) : (
              <Text color={theme.text.secondary}>(Press Esc to close)</Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
