/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CommandKind,
  type CommandContext,
  type SlashCommand,
} from './types.js';
import { MessageType } from '../types.js';
import { ProviderDialog } from '../components/ProviderDialog.js';

export const modelsCommand: SlashCommand = {
  name: 'models',
  description: 'Choose a model from the configured OpenAI-compatible provider',
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context: CommandContext) => {
    const config = context.services.agentContext?.config;
    const settings = context.services.settings;

    const configuredBaseUrl =
      settings.merged.provider?.baseUrl ||
      config?.getContentGeneratorConfig()?.baseUrl ||
      process.env['A_CODER_BASE_URL'] ||
      process.env['OPENAI_BASE_URL'];

    if (!configuredBaseUrl) {
      context.ui.addItem(
        {
          type: MessageType.ERROR,
          text: 'No provider base URL is configured. Use /provider to configure one.',
        },
        Date.now(),
      );
      return;
    }

    const apiKey = config?.getContentGeneratorConfig()?.apiKey ?? '';

    return {
      type: 'custom_dialog',
      component: (
        <ProviderDialog
          mode="models"
          initialBaseUrl={configuredBaseUrl}
          initialApiKey={apiKey}
          onClose={() => context.ui.removeComponent()}
          onConfigured={(model, baseUrl) => {
            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: `Model set to ${model} from ${baseUrl}`,
              },
              Date.now(),
            );
            context.ui.removeComponent();
          }}
        />
      ),
    };
  },
};
