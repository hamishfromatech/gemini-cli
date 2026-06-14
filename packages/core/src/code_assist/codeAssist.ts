/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

type AuthClient = unknown;
import type { AuthType, ContentGenerator } from '../core/contentGenerator.js';
import { CodeAssistServer, type HttpOptions } from './server.js';
import type { Config } from '../config/config.js';
import { LoggingContentGenerator } from '../core/loggingContentGenerator.js';
import { ModelMappingContentGenerator } from '../core/modelMappingContentGenerator.js';

function createStubAuthClient(): AuthClient {
  return {
    request: async () => ({ data: undefined as unknown }),
  } as unknown;
}

export async function createCodeAssistContentGenerator(
  httpOptions: HttpOptions,
   
  _authType: AuthType,
  config: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const authClient = createStubAuthClient();
  return new CodeAssistServer(
    authClient,
    undefined,
    httpOptions,
    sessionId,
    undefined,
    undefined,
    undefined,
    config,
  );
}

export function getCodeAssistServer(
  config: Config,
): CodeAssistServer | undefined {
  let server = config.getContentGenerator();

  // Recursively unwrap LoggingContentGenerator and ModelMappingContentGenerator
  while (true) {
    if (server instanceof LoggingContentGenerator) {
      server = server.getWrapped();
    } else if (server instanceof ModelMappingContentGenerator) {
      server = server.getWrapped();
    } else {
      break;
    }
  }

  if (!(server instanceof CodeAssistServer)) {
    return undefined;
  }
  return server;
}
