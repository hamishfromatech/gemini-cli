/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { EventEmitter } from 'node:events';
import type {
  TranscriptionProvider,
  TranscriptionEvents,
} from './transcriptionProvider.js';

/**
 * Stub transcription provider that implements the original Gemini Live API
 * signature but does not connect to any Google service.
 */
export class GeminiLiveTranscriptionProvider
  extends EventEmitter<TranscriptionEvents>
  implements TranscriptionProvider
{
  private currentTranscription = '';

  constructor(private readonly _apiKey: string) {
    super();
  }

  async connect(): Promise<void> {
    this.currentTranscription = '';
  }

  sendAudioChunk(_chunk: Buffer): void {
    // no-op
  }

  getTranscription(): string {
    return this.currentTranscription;
  }

  disconnect(): void {
    // no-op
  }
}
