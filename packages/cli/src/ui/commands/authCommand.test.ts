/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authCommand } from './authCommand.js';
import { type CommandContext } from './types.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import { SettingScope } from '../../config/settings.js';
import type { ACoderClient } from '@the-a-tech-corporation/core';

vi.mock('@the-a-tech-corporation/core', async () => {
  const actual = await vi.importActual('@the-a-tech-corporation/core');
  return {
    ...actual,
    clearCachedCredentialFile: vi.fn().mockResolvedValue(undefined),
  };
});

const DEPRECATION_MESSAGE =
  'The /auth command is deprecated. Use /provider to configure your model provider.';

describe('authCommand', () => {
  let mockContext: CommandContext;

  beforeEach(() => {
    mockContext = createMockCommandContext({
      services: {
        agentContext: {
          aCoderClient: {
            stripThoughtsFromHistory: vi.fn(),
          },
        },
      },
    });
    // Add setValue mock to settings
    mockContext.services.settings.setValue = vi.fn();
    vi.clearAllMocks();
  });

  it('should have subcommands: signin and signout', () => {
    expect(authCommand.subCommands).toBeDefined();
    expect(authCommand.subCommands).toHaveLength(2);
    expect(authCommand.subCommands?.[0]?.name).toBe('signin');
    expect(authCommand.subCommands?.[0]?.altNames).toContain('login');
    expect(authCommand.subCommands?.[1]?.name).toBe('signout');
    expect(authCommand.subCommands?.[1]?.altNames).toContain('logout');
  });

  it('should return a deprecation message when called with no args', () => {
    if (!authCommand.action) {
      throw new Error('The auth command must have an action.');
    }

    const result = authCommand.action(mockContext, '');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: DEPRECATION_MESSAGE,
    });
  });

  it('should have the correct name and description', () => {
    expect(authCommand.name).toBe('auth');
    expect(authCommand.description).toBe(
      'Deprecated: use /provider to configure your model provider',
    );
  });

  describe('auth signin subcommand', () => {
    it('should return a deprecation message', () => {
      const loginCommand = authCommand.subCommands?.[0];
      expect(loginCommand?.name).toBe('signin');
      const result = loginCommand!.action!(mockContext, '');
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: DEPRECATION_MESSAGE,
      });
    });
  });

  describe('auth signout subcommand', () => {
    it('should clear cached credentials', async () => {
      const logoutCommand = authCommand.subCommands?.[1];
      expect(logoutCommand?.name).toBe('signout');

      const { clearCachedCredentialFile } = await import(
        '@the-a-tech-corporation/core'
      );

      await logoutCommand!.action!(mockContext, '');

      expect(clearCachedCredentialFile).toHaveBeenCalledOnce();
    });

    it('should clear selectedAuthType setting', async () => {
      const logoutCommand = authCommand.subCommands?.[1];

      await logoutCommand!.action!(mockContext, '');

      expect(mockContext.services.settings.setValue).toHaveBeenCalledWith(
        SettingScope.User,
        'security.auth.selectedType',
        undefined,
      );
    });

    it('should strip thoughts from history', async () => {
      const logoutCommand = authCommand.subCommands?.[1];
      const mockStripThoughts = vi.fn();
      const mockClient = {
        stripThoughtsFromHistory: mockStripThoughts,
      } as unknown as ACoderClient;
      if (mockContext.services.agentContext?.config) {
        mockContext.services.agentContext.config.getACoderClient = vi.fn(
          () => mockClient,
        );
      }

      await logoutCommand!.action!(mockContext, '');

      expect(
        mockContext.services.agentContext?.aCoderClient
          .stripThoughtsFromHistory,
      ).toHaveBeenCalled();
    });

    it('should return logout action to signal explicit state change', async () => {
      const logoutCommand = authCommand.subCommands?.[1];
      const result = await logoutCommand!.action!(mockContext, '');

      expect(result).toEqual({ type: 'logout' });
    });

    it('should handle missing config gracefully', async () => {
      const logoutCommand = authCommand.subCommands?.[1];
      mockContext.services.agentContext = null;

      const result = await logoutCommand!.action!(mockContext, '');

      expect(result).toEqual({ type: 'logout' });
    });
  });
});
