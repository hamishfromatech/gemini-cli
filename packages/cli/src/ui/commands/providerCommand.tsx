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

export const providerCommand: SlashCommand = {
  name: 'provider',
  description: 'Configure an OpenAI-compatible provider and choose a model',
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context: CommandContext) => {
    return {
      type: 'custom_dialog',
      component: (
        <ProviderDialog
          mode="provider"
          onClose={() => context.ui.removeComponent()}
          onConfigured={(model, baseUrl) => {
            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: `Provider configured: ${baseUrl} using model ${model}`,
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
