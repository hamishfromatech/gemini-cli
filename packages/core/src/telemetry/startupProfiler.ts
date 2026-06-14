/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

export interface StartupPhaseHandle {
  end(_details?: Record<string, string | number | boolean>): void;
}

export class StartupProfiler {
  private static instance: StartupProfiler;

  private constructor() {}

  static getInstance(): StartupProfiler {
    if (!StartupProfiler.instance) {
      StartupProfiler.instance = new StartupProfiler();
    }
    return StartupProfiler.instance;
  }

  start(_phaseName: string, _details?: Record<string, string | number | boolean>): StartupPhaseHandle {
    return {
      end: () => {},
    };
  }

  recordMark(_name: string): void {}

  flush(_config: unknown): void {}
}

export const startupProfiler = StartupProfiler.getInstance();
