/**
 * @license
 * Copyright 2026 The A-Tech Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { InMemoryTaskStore } from '@a2a-js/sdk/server';
import type { Task } from '@a2a-js/sdk';
import type { ServerCallContext, TaskStore } from '@a2a-js/sdk/server';

/**
 * Local replacement for the previous Google Cloud Storage task store.
 * The A-Coder CLI A2A server does not use GCS; tasks are kept in memory.
 */
export class GCSTaskStore extends InMemoryTaskStore implements TaskStore {
  constructor(private readonly _bucketName: string) {
    super();
    void this._bucketName;
  }
}

/**
 * Task store wrapper that delegates to an inner store.
 * Retained for API compatibility with the original persistence layer.
 */
export class NoOpTaskStore implements TaskStore {
  constructor(private readonly _inner: TaskStore) {}

  async save(task: Task, context?: ServerCallContext): Promise<void> {
    return this._inner.save(task, context);
  }

  async load(
    taskId: string,
    context?: ServerCallContext,
  ): Promise<Task | undefined> {
    return this._inner.load(taskId, context);
  }
}
