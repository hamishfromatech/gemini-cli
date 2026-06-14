/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MessageActionReturn } from '@the-a-tech-corporation/core';
import type { SlashCommand, LogoutActionReturn } from './types.js';
import { CommandKind } from './types.js';
import { clearCachedCredentialFile } from '@the-a-tech-corporation/core';
import { SettingScope } from '../../config/settings.js';

const AUTH_DEPRECATED_MESSAGE =
  'The /auth command is deprecated. Use /provider to configure your model provider.';

const deprecationMessage = (): MessageActionReturn => ({
  type: 'message',
  messageType: 'info',
  content: AUTH_DEPRECATED_MESSAGE,
});

const authLoginCommand: SlashCommand = {
  name: 'signin',
  altNames: ['login'],
  description: 'Deprecated: use /provider instead',
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: () => deprecationMessage(),
};

const authLogoutCommand: SlashCommand = {
  name: 'signout',
  altNames: ['logout'],
  description: 'Sign out and clear all cached credentials',
  kind: CommandKind.BUILT_IN,
  action: async (context, _args): Promise<LogoutActionReturn> => {
    await clearCachedCredentialFile();
    // Clear the selected auth type so user sees the provider selection menu
    context.services.settings.setValue(
      SettingScope.User,
      'security.auth.selectedType',
      undefined,
    );
    // Strip thoughts from history instead of clearing completely
    context.services.agentContext?.aCoderClient.stripThoughtsFromHistory();
    // Return logout action to signal explicit state change
    return {
      type: 'logout',
    };
  },
};

export const authCommand: SlashCommand = {
  name: 'auth',
  description: 'Deprecated: use /provider to configure your model provider',
  kind: CommandKind.BUILT_IN,
  subCommands: [authLoginCommand, authLogoutCommand],
  action: () => deprecationMessage(),
};
