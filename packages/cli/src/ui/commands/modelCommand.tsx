/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ModelSlashCommandEvent,
  logModelSlashCommand,
  AuthType,
} from '@the-a-tech-corporation/core';
import {
  type CommandContext,
  CommandKind,
  type SlashCommand,
  type OpenCustomDialogActionReturn,
} from './types.js';
import { MessageType } from '../types.js';
import { ProviderDialog } from '../components/ProviderDialog.js';

const setModelCommand: SlashCommand = {
  name: 'set',
  description:
    'Set the model to use. Usage: /model set <model-name> [--persist]',
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  action: async (context: CommandContext, args: string) => {
    const parts = args.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      context.ui.addItem({
        type: MessageType.ERROR,
        text: 'Usage: /model set <model-name> [--persist]',
      });
      return;
    }

    const modelName = parts[0];
    const persist = parts.includes('--persist');

    if (context.services.agentContext?.config) {
      context.services.agentContext.config.setModel(modelName, !persist);
      const event = new ModelSlashCommandEvent(modelName);
      logModelSlashCommand(context.services.agentContext.config, event);

      context.ui.addItem({
        type: MessageType.INFO,
        text: `Model set to ${modelName}${persist ? ' (persisted)' : ''}`,
      });
    }
  },
};

function openProviderModelDialog(
  context: CommandContext,
): OpenCustomDialogActionReturn | undefined {
  const config = context.services.agentContext?.config;
  const settings = context.services.settings;
  const configuredBaseUrl =
    settings.merged.provider?.baseUrl ||
    config?.getContentGeneratorConfig()?.baseUrl ||
    process.env['A_CODER_BASE_URL'] ||
    process.env['OPENAI_BASE_URL'];
  const apiKey = config?.getContentGeneratorConfig()?.apiKey ?? '';

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
}

const manageModelCommand: SlashCommand = {
  name: 'manage',
  description: '[Deprecated] Use /models or /provider instead',
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context: CommandContext) => {
    context.ui.addItem(
      {
        type: MessageType.INFO,
        text: '/model is deprecated. Use /models to choose from your provider or /provider to configure a new one.',
      },
      Date.now(),
    );

    const authType =
      context.services.agentContext?.config?.getContentGeneratorConfig()
        ?.authType;
    if (authType === AuthType.USE_OPENAI_COMPATIBLE) {
      const result = openProviderModelDialog(context);
      if (result) {
        return result;
      }
      return;
    }

    if (context.services.agentContext?.config) {
      await context.services.agentContext.config.refreshUserQuota();
    }
    return {
      type: 'dialog',
      dialog: 'model',
    };
  },
};

export const modelCommand: SlashCommand = {
  name: 'model',
  description: '[Deprecated] Use /models or /provider instead',
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  hidden: true,
  subCommands: [manageModelCommand, setModelCommand],
  action: async (context: CommandContext, args: string) =>
    manageModelCommand.action!(context, args),
};
