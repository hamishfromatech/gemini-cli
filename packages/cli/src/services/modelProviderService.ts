/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normalizes a user-provided OpenAI-compatible base URL so that it ends in
 * `/v1`. The OpenAI SDK and the `/models` endpoint both expect this path.
 */
export function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/v1')) {
    return trimmed;
  }
  return `${trimmed}/v1`;
}

interface OpenAIModelsResponse {
  data?: Array<{ id?: string }>;
}

/**
 * Fetches the list of model IDs from an OpenAI-compatible `/v1/models`
 * endpoint.
 */
export async function fetchOpenAIModels(
  baseUrl: string,
  apiKey?: string,
): Promise<string[]> {
  const normalized = normalizeBaseUrl(baseUrl);
  const url = `${normalized}/models`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch models from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as OpenAIModelsResponse;
  if (!Array.isArray(body?.data)) {
    throw new Error(`Unexpected response format from ${url}`);
  }

  return body.data
    .map((model) => model.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
    .sort();
}
