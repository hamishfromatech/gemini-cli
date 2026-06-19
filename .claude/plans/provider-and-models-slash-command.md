# Plan: `/provider` and `/models` slash commands

## Goal

- Add a new `/provider` slash command that opens a menu to configure an
  OpenAI-compatible provider: enter a base URL, optionally enter an API key,
  fetch `baseUrl/v1/models`, choose a model, and apply it.
- Add a `/models` slash command that opens the model picker against the
  currently configured `/v1/models` base URL.
- Persist the provider base URL and model, and make the next CLI startup use the
  saved provider.

## Approach

### 1. Settings schema

- Add a new top-level `provider` object to
  `packages/cli/src/config/settingsSchema.ts` with a `baseUrl` string field.
- Regenerate `schemas/settings.schema.json` and docs with
  `npm run schema:settings` / `npm run docs:settings`.

### 2. Model-provider fetch helper

- Create `packages/cli/src/services/modelProviderService.ts` with:
  - `normalizeBaseUrl(url)` → ensures the URL ends in `/v1`.
  - `fetchOpenAIModels(baseUrl, apiKey?)` → `GET {normalized}/models`, returns
    sorted model IDs.

### 3. Provider dialog UI

- Create `packages/cli/src/ui/components/ProviderDialog.tsx`:
  - Props: `mode: 'provider' | 'models'`, `initialBaseUrl?: string`,
    `initialApiKey?: string`, `onClose`, `onConfigured`.
  - Views driven by a state machine:
    - Base URL input (skipped in `models` mode when a base URL is already
      configured).
    - Optional API key input.
    - Loading spinner while fetching.
    - Model selection list using `DescriptiveRadioButtonSelect`.
    - Error view with retry.
  - On model selection:
    - Save API key to the keychain via `saveApiKey` if provided.
    - Persist base URL to `provider.baseUrl` (user settings).
    - Persist model to `model.name` via `config.setModel(model, false)`.
    - Set `security.auth.selectedType` to `AuthType.USE_OPENAI_COMPATIBLE`.
    - Call
      `config.refreshAuth(AuthType.USE_OPENAI_COMPATIBLE, apiKey, normalizedBaseUrl)`.
    - Notify the user via the `onConfigured` callback.

### 4. Slash commands

- Create `packages/cli/src/ui/commands/providerCommand.tsx`: returns a
  `custom_dialog` with `<ProviderDialog mode="provider" .../>`.
- Create `packages/cli/src/ui/commands/modelsCommand.tsx`:
  - If no base URL is configured (settings / env / config), returns an
    info/error message telling the user to run `/provider`.
  - Otherwise returns a `custom_dialog` with
    `<ProviderDialog mode="models" .../>`.
- Register both commands in `packages/cli/src/services/BuiltinCommandLoader.ts`.

### 5. Startup persistence

- In `packages/cli/src/a-coder.tsx`, when `security.auth.selectedType` is
  `USE_OPENAI_COMPATIBLE`, load the stored API key with `loadApiKey()` and the
  stored base URL from `settings.merged.provider?.baseUrl`, and pass them to
  `partialConfig.refreshAuth(...)` so the saved provider is active on restart.

### 6. Build & install

- Build core and CLI packages, run `npm run bundle`, reinstall globally with
  `npm install -g .`, and verify `a-coder-cli --version`.
- **No test suites will be run**, per the user’s instruction.
