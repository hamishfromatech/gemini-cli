/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { CodeAssistServer } from '../server.js';
import type { Flag } from './types.js';

export interface Experiments {
  flags: Record<string, Flag>;
  experimentIds: number[];
}

let experimentsPromise: Promise<Experiments> | undefined;

/**
 * Gets the experiments from the server.
 *
 * The experiments are cached so that they are only fetched once.
 * This stub always returns an empty set of experiments and never calls a
 * Google endpoint.
 */
export async function getExperiments(
   
  _server?: CodeAssistServer,
): Promise<Experiments> {
  if (experimentsPromise) {
    return experimentsPromise;
  }

  experimentsPromise = Promise.resolve({
    flags: {},
    experimentIds: [],
  });
  return experimentsPromise;
}
