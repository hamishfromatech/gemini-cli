/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import type { BaseLlmClient } from '../core/baseLlmClient.js';
import type { Config } from '../config/config.js';
import {
  AutoModeClassifier,
  isAutoModeFastPath,
  type AutoModeContext,
} from './autoModeClassifier.js';

function makeClient(decision: string, category = 'in_scope'): BaseLlmClient {
  return {
    generateJson: vi.fn().mockResolvedValue({
      decision,
      category,
      reasoning: 'mocked',
    }),
  } as unknown as BaseLlmClient;
}

const baseCtx: AutoModeContext = {
  userTurns: [{ text: 'refactor the auth module' }],
  toolCall: { name: 'shell', args: { command: 'rm -rf build' } },
  workspaceDir: '/tmp/project',
  trustedDomains: ['/tmp/project'],
};

describe('AutoModeClassifier', () => {
  it('short-circuits to allow when stage 1 says allow', async () => {
    const client = makeClient('allow');
    const config = {
      getActiveModel: () => 'auto-classifier',
    } as unknown as Config;
    const classifier = new AutoModeClassifier({
      client,
      config,
      modelConfigKey: { model: 'auto-classifier' },
    });
    const result = await classifier.classify(baseCtx);
    expect(result).toBe('allow');
    expect(client.generateJson).toHaveBeenCalledTimes(1);
  });

  it('abstains when stage 1 says abstain (no stage 2)', async () => {
    const client = makeClient('abstain');
    const config = {
      getActiveModel: () => 'auto-classifier',
    } as unknown as Config;
    const classifier = new AutoModeClassifier({
      client,
      config,
      modelConfigKey: { model: 'auto-classifier' },
    });
    const result = await classifier.classify(baseCtx);
    expect(result).toBe('abstain');
    expect(client.generateJson).toHaveBeenCalledTimes(1);
  });

  it('runs stage 2 only when stage 1 denies', async () => {
    let call = 0;
    const client = {
      generateJson: vi.fn().mockImplementation(async () => {
        call += 1;
        if (call === 1) {
          return { decision: 'deny', category: 'destructive', reasoning: '' };
        }
        return { decision: 'allow', category: 'in_scope', reasoning: '' };
      }),
    } as unknown as BaseLlmClient;
    const config = {
      getActiveModel: () => 'auto-classifier',
    } as unknown as Config;
    const classifier = new AutoModeClassifier({
      client,
      config,
      modelConfigKey: { model: 'auto-classifier' },
    });
    const result = await classifier.classify(baseCtx);
    expect(result).toBe('allow');
    expect(client.generateJson).toHaveBeenCalledTimes(2);
  });

  it('returns deny if stage 2 also denies', async () => {
    const client = {
      generateJson: vi
        .fn()
        .mockResolvedValue({
          decision: 'deny',
          category: 'exfil',
          reasoning: '',
        }),
    } as unknown as BaseLlmClient;
    const config = {
      getActiveModel: () => 'auto-classifier',
    } as unknown as Config;
    const classifier = new AutoModeClassifier({
      client,
      config,
      modelConfigKey: { model: 'auto-classifier' },
    });
    const result = await classifier.classify(baseCtx);
    expect(result).toBe('deny');
    expect(client.generateJson).toHaveBeenCalledTimes(2);
  });

  it('treats classifier errors as abstain (fail closed)', async () => {
    const client = {
      generateJson: vi.fn().mockRejectedValue(new Error('api down')),
    } as unknown as BaseLlmClient;
    const config = {
      getActiveModel: () => 'auto-classifier',
    } as unknown as Config;
    const classifier = new AutoModeClassifier({
      client,
      config,
      modelConfigKey: { model: 'auto-classifier' },
    });
    const result = await classifier.classify(baseCtx);
    expect(result).toBe('abstain');
  });

  it('treats unknown decision values as abstain', async () => {
    const client = makeClient('garbage');
    const config = {
      getActiveModel: () => 'auto-classifier',
    } as unknown as Config;
    const classifier = new AutoModeClassifier({
      client,
      config,
      modelConfigKey: { model: 'auto-classifier' },
    });
    const result = await classifier.classify(baseCtx);
    expect(result).toBe('abstain');
  });
});

describe('isAutoModeFastPath', () => {
  const workspace = '/home/user/project';

  it('allows read-only tools without consulting the classifier', () => {
    expect(
      isAutoModeFastPath('read_file', { file_path: '/etc/passwd' }, workspace),
    ).toBe(true);
    expect(isAutoModeFastPath('glob', { pattern: '**/*' }, workspace)).toBe(
      true,
    );
  });

  it('allows in-project writes without consulting the classifier', () => {
    expect(
      isAutoModeFastPath(
        'write_file',
        { file_path: '/home/user/project/src/index.ts' },
        workspace,
      ),
    ).toBe(true);
    expect(
      isAutoModeFastPath(
        'edit',
        { file_path: '/home/user/project/src/index.ts' },
        workspace,
      ),
    ).toBe(true);
  });

  it('does not allow out-of-project writes', () => {
    expect(
      isAutoModeFastPath(
        'write_file',
        { file_path: '/home/user/.ssh/authorized_keys' },
        workspace,
      ),
    ).toBe(false);
  });

  it('does not allow shell to fast-path', () => {
    expect(isAutoModeFastPath('shell', { command: 'ls' }, workspace)).toBe(
      false,
    );
  });
});
