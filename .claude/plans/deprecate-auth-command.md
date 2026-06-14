# Plan: Deprecate `/auth` and make `/provider` the default on new installs

## Goal
- Retire the Google-centric `/auth` slash command as the primary authentication path.
- Make the OpenAI-compatible provider dialog (`/provider`) the first-run experience when no provider is configured.
- Keep the minimal credential-clearing path available under `/provider` while warning users who still invoke `/auth`.

## Approach

### 1. Deprecate `/auth` command behavior
File: `packages/cli/src/ui/commands/authCommand.ts`
- Change the top-level `/auth` default action and the `/auth signin` (and `/login` alias) subcommand to return an `info` message:
  `"The /auth command is deprecated. Use /provider to configure your model provider."`
- Keep the `/auth signout` (and `/logout` alias) subcommand functional so users can still clear cached credentials and reset `security.auth.selectedType`.
- Update `authCommand.description` to indicate the command is deprecated.

### 2. Open `/provider` automatically on first run
Files: `packages/cli/src/ui/auth/useAuth.ts`, `packages/cli/src/ui/AppContainer.tsx`, `packages/cli/src/ui/hooks/slashCommandProcessor.ts`
- Add an `openProviderDialog` callback to `SlashCommandProcessorActions` and the `slashCommandActions` object in `AppContainer.tsx`.
- In `AppContainer.tsx`, implement `openProviderDialog` by setting `customDialog` to a `<ProviderDialog mode="provider" .../>` component that closes itself with `setCustomDialog(null)`.
- Pass `openProviderDialog` into `useAuthCommand` and change the no-auth-type effect so that, when `security.auth.selectedType` is undefined and no `OPENAI_API_KEY` env var exists, it opens the provider dialog instead of calling `onAuthError('No authentication method selected.')`.
- If `OPENAI_API_KEY` is present, preserve the existing hint but point the user to `/provider` instead of the old auth dialog.

### 3. Update remaining `/auth` references in UI copy
- `packages/cli/src/ui/constants/tips.ts`: replace `"Change your authentication method with /auth"` with `"Configure your model provider with /provider"`.
- `packages/cli/src/ui/components/EmptyWalletDialog.tsx`: replace the `/auth` line with `/provider`.
- `packages/cli/src/ui/hooks/slashCommandProcessor.ts`: in the logout-confirmation flow, change the "Login" choice label to "Configure Provider" and make it open the provider dialog instead of the auth dialog.

### 4. Update tests
- `packages/cli/src/ui/commands/authCommand.test.ts`: update expectations so `/auth` and `/auth signin` return the deprecation message. Keep `/auth signout` tests as-is.
- `packages/cli/src/ui/AppContainer.test.tsx` and `packages/cli/src/ui/hooks/slashCommandProcessor.test.tsx`: add mocks for `openProviderDialog` if needed.

### 5. Build & verify
- Run `npm run bundle` (or the package build commands) and reinstall globally.
- Start A-Coder CLI with no `security.auth.selectedType` set and confirm the provider dialog opens automatically.
- Verify that `/auth` prints the deprecation message and `/provider` still opens the provider dialog.
