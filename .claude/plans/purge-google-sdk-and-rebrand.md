# Plan: Purge Google SDK runtime dependency and complete the A-Coder rebrand

## Goal

A-Coder CLI is being rebranded from its Gemini CLI lineage into a purely
OpenAI-compatible product. The README already claims "no Google SDKs, no Google
auth flows, no Google telemetry," but as of 2026-06-27 that claim is
**aspirational, not factual**. This plan makes it factual.

The chosen approach is **Option B — runtime + tracking purge**: the
`@google/genai` package moves to `devDependencies` only (types survive `tsc`,
get tree-shaken at build time, never ship in the bundle, never run at runtime),
all Google-only transports are deleted, the chat engine is renamed/relicensed,
and every residual Google/Gemini string in the codebase, docs, headers, and
release infra is scrubbed. After this, no Google code runs and no Google package
ships to end users — while the existing OpenAI-compatible feature surface
(tools, headless loop, session resume, approval modes, IDE bridge, A2A server)
stays fully intact.

This is **not** Option A (full type-system rewrite with a vendored
`packages/core/src/types/` module). The type-only devDependency is the pragmatic
choice for shipping A-Coder Cloud on the current timeline. Option A remains a
possible future cleanup if a fully Google-free repo becomes a
marketing/legal requirement.

## Scope of the audit (verified by grepping the actual code)

- `@google/genai` is a runtime `dependency` in `packages/core/package.json` and
  `packages/cli/package.json`. 176 import sites across `packages/` pull types
  and runtime values from it (`Content`, `Part`, `PartListUnion`, `FunctionCall`,
  `FunctionDeclaration`, `Tool`, `CallableTool`, `GenerateContentResponse`,
  `GenerateContentConfig`, `GenerateContentParameters`, `FinishReason`, `Type`,
  `ThinkingLevel`, `FunctionCallingConfigMode`, `ApiError`, `GoogleGenAI`,
  `Environment`, `createUserContent`, `createPartFromText`,
  `GroundingMetadata`, `SchemaUnion`).
- `packages/core/src/core/geminiChat.ts` is a vendored copy of
  `googleapis/js-genai`'s chats module. Its header comment links to
  `b.corp.google.com` and says `Copyright 2025 Google LLC`. `ACoderChat` is the
  class every caller (`a-coder-client.ts`, `local-executor.ts`,
  `snapshotSuperseder.ts`, `turn.ts`, `agents/types.ts`, plus 4 test files)
  depends on.
- `packages/core/src/code_assist/` is the Google Code Assist OAuth + admin +
  experiments + telemetry surface. It is wired into:
  `packages/core/src/index.ts`, `packages/core/src/billing/billing.ts`,
  `packages/core/src/agent/legacy-agent-session.ts`,
  `packages/cli/src/core/auth.ts`, `packages/cli/src/a-coder.tsx`,
  `packages/a2a-server/src/config/config.ts`, and
  `packages/core/src/mcp/token-storage/hybrid-token-storage.test.ts`.
- `packages/core/src/utils/googleQuotaErrors.ts` exports
  `ValidationRequiredError`, used by `retry.ts`, `errorClassification.ts`,
  `a-coder-client.ts`, `geminiChat.ts`, and `packages/cli/src/ui/hooks/useACoderStream.ts`.
- `packages/core/src/routing/strategies/gemmaClassifierStrategy.ts` is the
  Gemma-model router. Wired only through `modelRouterService.ts` behind
  `if (config.getGemmaModelRouterSettings()?.enabled)`.
- `packages/core/src/core/localLiteRtLmClient.ts` + the CLI-side
  `packages/cli/src/services/liteRtServerManager.ts` implement on-device LiteRT
  inference. The only runtime `new GoogleGenAI(...)` call site besides
  `code_assist`. This is a local-only feature, not a Google transport — but it
  pulls the Google SDK into the runtime path.
- 2,109 files still carry `Copyright Google LLC` headers.
  `eslint.config.js` (line ~311) enforces `'Copyright (year) Google LLC'` as the
  required header template, so any new file auto-stamps Google LLC.
- Runtime strings that surface to end users or cloud logs:
  - `packages/core/src/tools/web-fetch.ts`: `User-Agent: Mozilla/5.0 (compatible; Google-Gemini-CLI/1.0; +https://github.com/hamishfromatech/a-coder-cli)`
  - `packages/cli/src/utils/sandboxUtils.ts`: `gemini-cli-sandbox`, `gemini-cli-sandbox-proxy`
  - `packages/cli/src/acp/acpRpcDispatcher.ts:87`: ACP agent name `'gemini-cli'`
  - `packages/core/src/mcp/token-storage/index.ts`: `DEFAULT_SERVICE_NAME = 'gemini-cli-oauth'`
  - `packages/core/src/agents/browser/browserManager.ts:566`: `'gemini-cli-browser-agent'`; `mcp-client.ts:1846`: `'gemini-cli-mcp-client'`
  - `packages/cli/src/utils/sandbox.ts`: error messages mention `gemini-cli-dev@google.com` and "the gemini-cli repo"
  - `packages/cli/src/ui/commands/helpCommand.ts`: `description: 'For help on gemini-cli'`
  - `packages/cli/src/ui/commands/docsCommand.ts`: `https://goo.gle/gemini-cli-docs`
  - `packages/cli/src/ui/components/views/McpStatus.tsx:64`: `https://goo.gle/gemini-cli-docs-mcp`
  - `packages/cli/src/utils/gitUtils.ts`: `run-gemini-cli` references
  - `packages/cli/src/utils/startupWarnings.ts`: `gemini-cli-warnings.txt`
  - Temp-file prefixes `gemini-cli-tool-modify-`, `gemini-cli-seatbelt-`, `gemini-cli-macos-test-`, etc.
- `A-Coder.md` (the agent context doc — actively mis-tunes any assistant working
  on this repo) still says: "brings the power of Gemini directly into the
  terminal", "terminal interface for Gemini models", "Gemini API
  orchestration", "signing the Google CLA", "Copyright 2026 Google LLC".
- `CONTRIBUTING.md` (root + `docs/CONTRIBUTING.md` duplicate) mandates the Google
  CLA (`cla.developers.google.com`), Google's Open Source Community Guidelines
  (`opensource.google/conduct`), and the Google Developer Documentation Style
  Guide (`developers.google.com/style`).
- `SECURITY.md` says "The Google Security Team will" handle vulnerabilities.
- `docs/releases.md` references `@google-a-coder-cli/**` package scopes, Wombat
  Dressing Room, Google Cloud Build, `github.com/google-a-coder-cli/...` URLs,
  and has a copy-paste error in the package-scope table (the "A2A Server" text
  bleeds into the Core row).
- `docs/resources/faq.md`, `tos-privacy.md`, `quota-and-pricing.md`,
  `troubleshooting.md`, `keyboard-shortcuts.md`, `policy-engine.md`, and
  `docs/changelogs/index.md` link to `github.com/google-a-coder-cli/a-coder-cli-cli/...`
  and Google properties (`developers.google.com/a-coder-cli-cli-code-assist`,
  `ai.google.dev/a-coder-cli-api`, `cloud.google.com/vertex-ai`,
  `policies.google.com/privacy`). The "Gemini" → "A-Coder" string substitution
  was applied to the prose but the URLs are now invalid/contradictory.
- `.npmrc` has `@google:registry=https://wombat-dressing-room.appspot.com`
  (Google's npm publishing system).
- `.github/actions/setup-npmrc/action.yml` echoes the same Wombat Dressing Room
  line into `~/.npmrc`.
- `scripts/releasing/create-patch-pr.js:140` sets
  `git config user.email "gemini-cli-robot@google.com"` — release PRs authored
  by a Google bot identity.
- `integration-tests/checkpointing.test.ts:152` asserts
  `'A-Coder CLI <gemini-cli@google.com>'` (half-rebranded, now inconsistent).
- `packages/a2a-server/vitest.config.ts:42` inlines `/@google\/gemini-cli-core/`.
- `packages/sdk/src/agent.ts` exports `class GeminiCliAgent` with
  `GeminiCliAgentOptions`, `GeminiCliSession` — the published SDK surface users
  import. The old name is a breaking change that needs a changelog entry.
- `package-lock.json` resolves `@google/genai` and pulls
  `google-auth-library`, `gcp-metadata`, `google-logging-utils`, `gtoken`
  transitively. After the dep move, `npm ci` regenerates the lockfile and these
  transitive deps drop out.

## Approach

### Phase 1 — Kill the Google-only transports (the deletes)

#### 1.1 `gemmaClassifierStrategy` (clean, self-contained)
- Delete `packages/core/src/routing/strategies/gemmaClassifierStrategy.ts`
  and `gemmaClassifierStrategy.test.ts`.
- Remove the
  `if (this.config.getGemmaModelRouterSettings()?.enabled) { strategies.push(new GemmaClassifierStrategy()); }`
  branch in `packages/core/src/routing/modelRouterService.ts`.
- Remove `getGemmaModelRouterSettings` and the `GemmaModelRouterSettings` type
  from `packages/core/src/config/config.ts`.
- Update `packages/core/src/routing/modelRouterService.test.ts` and
  `packages/core/src/config/config.test.ts` to drop the Gemma cases.

#### 1.2 `googleQuotaErrors` → OpenAI-shaped rate-limit handling
- Create `packages/core/src/utils/quotaErrors.ts` exporting
  `RateLimitError` (OpenAI returns HTTP 429, not Google's "validation
  required" flow). Keep the class shape compatible with the current
  `ValidationRequiredError` consumers so the call sites need only an
  import-rename, not a rewrite.
- Delete `packages/core/src/utils/googleQuotaErrors.ts` and
  `googleQuotaErrors.test.ts`.
- Rewire import sites: `packages/core/src/utils/retry.ts`,
  `packages/core/src/availability/errorClassification.ts`,
  `packages/core/src/availability/autoRoutingFallback.integration.test.ts`,
  `packages/core/src/core/a-coder-client.ts`,
  `packages/core/src/core/geminiChat.ts` (becomes `chat.ts` in Phase 3),
  `packages/cli/src/ui/hooks/useACoderStream.ts`,
  `packages/cli/src/ui/hooks/useACoderStream.test.tsx`,
  `packages/core/src/utils/retry.test.ts`,
  `packages/core/src/utils/flashFallback.test.ts`,
  `packages/core/src/fallback/handler.test.ts`,
  `packages/cli/src/core/auth.test.ts`.
- Update `packages/core/src/utils/errorParsing.ts` if it pattern-matches on
  the Google quota error shape.

#### 1.3 `localLiteRtLmClient` + `liteRtServerManager` (pending decision)
**Pending decision**: This is a local, on-device inference feature, not a
Google transport. It uses `new GoogleGenAI(...)` only because LiteRT's TS
bindings ship under the `@google/genai` namespace. Deleting it removes
on-device inference support (a feature loss); keeping it means one local-only
`GoogleGenAI` instantiation survives in the runtime path.

**Option 1.3a — Delete (recommended for the cleanest purge):**
- Delete `packages/core/src/core/localLiteRtLmClient.ts` and
  `localLiteRtLmClient.test.ts`.
- Delete `packages/cli/src/services/liteRtServerManager.ts` and
  `liteRtServerManager.test.ts`.
- Remove the LiteRT config flag from `packages/core/src/config/config.ts`,
  `packages/core/src/config/config.test.ts`, and
  `packages/cli/src/config/config.test.ts`.
- Remove any LiteRT-related entries from `packages/core/src/core/contentGenerator.ts`
  dispatch.
- Drop on-device inference from the README feature list and
  `docs/core/local-model-routing.md`.

**Option 1.3b — Keep:** Document the local-only `GoogleGenAI` use as an
accepted exception in the rebrand changelog. No work in this phase; the
runtime path survives but is feature-gated off by default.

#### 1.4 `code_assist/` directory + auth rewrite (pending decision)
**Pending decision**: This is the biggest item and the bulk of the effort
(~60-70% of the total). Deleting `code_assist/` means rewriting the auth
subsystem as **OpenAI-key-only** — no OAuth login flow, no Google account,
just `A_CODER_API_KEY` / `OPENAI_API_KEY` env vars and the `/provider` picker.

**Option 1.4a — Full rip-out (recommended for "purely OpenAI-compatible"):**
- Delete the entire `packages/core/src/code_assist/` directory (16 files:
  `codeAssist.ts`, `codeAssist.test.ts`, `converter.ts`, `converter.test.ts`,
  `server.ts`, `server.test.ts`, `setup.ts`, `setup.test.ts`,
  `telemetry.ts`, `telemetry.test.ts`, `types.ts`, `oauth-credential-storage.ts`,
  `oauth-credential-storage.test.ts`, `oauth2.ts`, `oauth2.test.ts`,
  `admin/admin_controls.ts`, `experiments/experiments.ts`).
- Remove `code_assist` re-exports from `packages/core/src/index.ts`.
- Rewrite `packages/core/src/billing/billing.ts` to either delete the billing
  module (OpenAI keys don't have a billing/commerce layer) or stub it for a
  future A-Coder Pro subscription flow.
- Rewrite `packages/core/src/agent/legacy-agent-session.ts` to drop the
  `code_assist` import.
- Rewrite `packages/cli/src/core/auth.ts` and `auth.test.ts` to be
  OpenAI-key-only. The `/auth` slash command should be fully removed or
  reduced to a deprecation pointer to `/provider` (this overlaps with the
  existing `.claude/plans/deprecate-auth-command.md` plan — that plan's
  end-state is now the starting state).
- Update `packages/cli/src/a-coder.tsx` (app entry) to drop the OAuth/Code
  Assist initialization path and go straight to env-var/OpenAI-key auth.
- Update `packages/a2a-server/src/config/config.ts` and
  `config.test.ts` to drop the Code Assist dependency.
- Update `packages/core/src/mcp/token-storage/hybrid-token-storage.test.ts`
  to drop the Code Assist OAuth token path; keep the API-key path.
- Drop the Code Assist entry from `packages/core/src/availability/policyCatalog.ts`,
  `packages/core/src/core/fakeContentGenerator.ts`,
  `packages/core/src/core/modelMappingContentGenerator.ts`,
  `packages/core/src/core/recordingContentGenerator.ts`, and
  `packages/core/src/core/loggingContentGenerator.test.ts`.
- Drop `packages/core/src/utils/errorParsing.ts` Code Assist references.

**Option 1.4b — Defang only:** Keep `code_assist/` for now, remove it from
the default auth flow so an OpenAI-key user never hits it, defer full
deletion to a follow-up. Faster, but leaves Google OAuth code paths in the
bundle (contradicts "purely OpenAI-compatible").

### Phase 2 — Defang the type dependency

- In `packages/core/package.json` and `packages/cli/package.json`, move
  `@google/genai` from `dependencies` → `devDependencies`.
- Run `npm ci` to regenerate `package-lock.json`. Confirm
  `google-auth-library`, `gcp-metadata`, `google-logging-utils`, `gtoken`
  drop out of the lockfile.
- Run `npm run typecheck` — confirm all 176 import sites still resolve
  (devDependencies satisfy `tsc`).
- Run `npm run build` — confirm `@google/genai` does NOT appear in
  `bundle/a-coder.js` (esbuild tree-shakes type-only imports).
- Grep the built bundle for `google`, `genai`, `GoogleGenAI` — expect zero
  hits in shipped code.

### Phase 3 — Rename and relicense the chat engine

- `git mv packages/core/src/core/geminiChat.ts packages/core/src/core/chat.ts`.
- `git mv packages/core/src/core/geminiChat.test.ts packages/core/src/core/chat.test.ts`.
- `git mv packages/core/src/core/geminiChat_network_retry.test.ts packages/core/src/core/chat_network_retry.test.ts`.
- Strip the
  `// DISCLAIMER: This is a copied version of https://github.com/googleapis/js-genai/blob/main/src/chats.ts ... b.corp.google.com/issues/420354090`
  comment from the new `chat.ts` header. Replace with an Apache-2.0
  A-Tech Corporation header.
- Update every import site:
  - `packages/core/src/core/a-coder-client.ts`
  - `packages/core/src/agents/local-executor.ts`
  - `packages/core/src/agents/local-executor.test.ts`
  - `packages/core/src/agents/browser/snapshotSuperseder.ts`
  - `packages/core/src/agents/browser/snapshotSuperseder.test.ts`
  - `packages/core/src/agents/types.ts`
  - `packages/core/src/core/turn.ts`
  - `packages/core/src/core/turn.test.ts`
  - `packages/core/src/core/client.test.ts`
  - `packages/core/src/index.ts`
  - `packages/core/src/utils/nextSpeakerChecker.ts`
  - `packages/core/src/utils/nextSpeakerChecker.test.ts`
  - `packages/core/src/utils/sessionUtils.ts`
  - `packages/core/src/context/initializer.ts`
  - `packages/core/src/context/chatCompressionService.ts`
  - `packages/core/src/context/chatCompressionService.test.ts`
  - `packages/core/src/services/sessionSummaryService.ts`
  - `packages/core/src/services/chatRecordingService.ts`
  - `packages/core/src/tools/glob.test.ts`
  - `packages/core/src/core/geminiRequest.ts` → rename to `request.ts`
    (also drops the `gemini` prefix), update its one importer
    (`a-coder-client.ts: import { partListUnionToString } from './geminiRequest.js'`).
- `ACoderChat` class name stays as-is (it's already rebranded and is the
  internal chat manager). Only the file name and the file's own header
  comment change.

### Phase 4 — Sweep runtime strings

For each file, the string substitution is mechanical but must be done
file-by-file (not a global sed) because some `gemini-cli-*` strings are
used as test-fixture identifiers that may need fixture updates too.

- `packages/core/src/tools/web-fetch.ts:45`:
  `User-Agent: 'Mozilla/5.0 (compatible; Google-Gemini-CLI/1.0; +https://github.com/hamishfromatech/a-coder-cli)'`
  → `'Mozilla/5.0 (compatible; A-Coder-CLI/1.0; +https://github.com/hamishfromatech/a-coder-cli)'`.
- `packages/cli/src/utils/sandboxUtils.ts:13-15`:
  `LOCAL_DEV_SANDBOX_IMAGE_NAME = 'a-coder-cli-sandbox'`,
  `SANDBOX_NETWORK_NAME = 'a-coder-cli-sandbox'`,
  `SANDBOX_PROXY_NAME = 'a-coder-cli-sandbox-proxy'`.
  Update any test or Dockerfile that references the old `gemini-cli-sandbox`
  image name.
- `packages/cli/src/acp/acpRpcDispatcher.ts:87`: agent name `'gemini-cli'` →
  `'a-coder-cli'`. Update `acpSession.ts` if it asserts on the name.
- `packages/core/src/mcp/token-storage/index.ts:12`:
  `DEFAULT_SERVICE_NAME = 'a-coder-cli-oauth'`. Update
  `base-token-storage.test.ts:56` (`'gemini-cli-mcp-oauth'` fixture) and any
  other token-storage tests.
- `packages/core/src/agents/browser/browserManager.ts:566`:
  `'a-coder-cli-browser-agent'`. Update
  `browserManager.test.ts:784` fixture.
- `packages/core/src/tools/mcp-client.ts:1846`:
  `'a-coder-cli-mcp-client'`.
- `packages/cli/src/utils/sandbox.ts`: remove `gemini-cli-dev@google.com`
  from error messages, fix the "gemini-cli repo" / "run-gemini-cli" / "npm
  link ./packages/cli under gemini-cli repo" references to point at the
  A-Tech repo.
- `packages/cli/src/ui/commands/helpCommand.ts:14`:
  `description: 'For help on a-coder-cli'`.
- `packages/cli/src/ui/commands/docsCommand.ts:22`: replace
  `'https://goo.gle/gemini-cli-docs'` with the A-Coder docs URL (or the
  in-repo `docs/` path if no canonical URL exists yet).
- `packages/cli/src/ui/components/views/McpStatus.tsx:64`: replace
  `https://goo.gle/gemini-cli-docs-mcp` with the A-Coder MCP docs path.
- `packages/cli/src/utils/gitUtils.ts:89,93`: fix
  `run-gemini-cli` references to `a-coder-cli`.
- `packages/cli/src/utils/startupWarnings.ts:12`:
  `a-coder-cli-warnings.txt`. Update any test that reads the file.
- `packages/cli/src/config/extension-manager-themes.spec.ts:38`:
  `gemini-cli-test-` temp-dir prefix → `a-coder-cli-test-`.
- Temp-file prefixes in `packages/core/src/tools/modifiable-tool.ts:68,86,90`
  and `modifiable-tool.test.ts`: `gemini-cli-tool-modify-` →
  `a-coder-cli-tool-modify-`, `gemini-cli-modify-` → `a-coder-cli-modify-`.
- `packages/core/src/sandbox/macos/MacOsSandboxManager.ts:198` and tests:
  `gemini-cli-seatbelt-` → `a-coder-cli-seatbelt-`,
  `gemini-cli-macos-test-` → `a-coder-cli-macos-test-`.
- `packages/core/src/sandbox/linux/LinuxSandboxManager.test.ts:108`:
  `gemini-cli-bwrap-args-` → `a-coder-cli-bwrap-args-`.
- `packages/core/src/utils/errorReporting.test.ts:39`:
  `gemini-client-error-` → `a-coder-cli-error-` (and update the production
  path in `errorReporting.ts` if it uses the same prefix).
- `packages/core/src/utils/fsErrorMessages.test.ts:44,46`:
  `/etc/gemini-cli/settings.json` → `/etc/a-coder-cli/settings.json`.
- `packages/core/src/utils/installationManager.test.ts:65` and
  `userAccountManager.test.ts:38`:
  `gemini-cli-test-home-` → `a-coder-cli-test-home-`.
- `packages/core/src/policy/config.test.ts:850,897`,
  `packages/core/src/policy/integrity.test.ts:20`,
  `packages/core/src/agents/acknowledgedAgents.test.ts`,
  `packages/core/src/agents/registry_acknowledgement.test.ts`,
  `packages/core/src/tools/confirmation-policy.test.ts:35,81`,
  `packages/core/src/tools/line-endings.test.ts:36`,
  `packages/core/src/tools/write-file.test.ts:47,48`,
  `packages/core/src/config/defaultModelConfigs.ts` (if it references
  `gemini-cli`):
  all `gemini-cli-test-`, `gemini-cli-temp`, `gemini-cli-policy-test-`,
  `gemini-cli-line-ending-test-root`, `gemini-cli-test-plans`,
  `gemini-cli-test-root` temp-dir prefixes → `a-coder-cli-*` equivalents.
- `packages/cli/src/ui/hooks/useLogger.ts:21`: comment says
  "see the gemini-cli prompt" → "see the a-coder-cli prompt".
- `packages/a2a-server/src/agent/task.ts:152`: comment
  "state managed within the @gemini-cli/core module" →
  "state managed within the @the-a-tech-corporation/core module".
- `packages/a2a-server/src/config/settings.ts:73`: comment
  "How is it different to gemini-cli/cli" → "How is it different to
  a-coder-cli/cli".
- `packages/a2a-server/vitest.config.ts:42`:
  `inline: [/@google\/gemini-cli-core/]` →
  `inline: [/@the-a-tech-corporation\/core/]`.

### Phase 5 — SDK public surface rename

The published SDK exports `GeminiCliAgent`, `GeminiCliAgentOptions`,
`GeminiCliSession`. This is a **breaking change** — user code says
`new GeminiCliAgent(...)`. Rename and ship a changelog entry.

- `packages/sdk/src/agent.ts`: `class GeminiCliAgent` → `class ACoderCliAgent`.
- `packages/sdk/src/types.ts`: `GeminiCliAgentOptions` →
  `ACoderCliAgentOptions`.
- `packages/sdk/src/session.ts` + `session.test.ts`: `GeminiCliSession` →
  `ACoderCliSession`.
- `packages/sdk/src/agent.integration.test.ts`: update all
  `new GeminiCliAgent(...)` sites and the `describe('GeminiCliAgent
  Integration', ...)` block.
- Update `packages/sdk/src/index.ts` exports.
- Update SDK examples in `packages/sdk/examples/*.ts`.
- Add a `CHANGELOG.md` entry under `# Breaking Changes` documenting the
  rename and the migration (`s/GeminiCliAgent/ACoderCliAgent/g`,
  `s/GeminiCliSession/ACoderCliSession/g`).
- Keep `GeminiCliAgent` as a `@deprecated` type alias for one release cycle
  to soften the break:
  ```ts
  /** @deprecated Use ACoderCliAgent. Removed in v0.2.0. */
  export type GeminiCliAgent = ACoderCliAgent;
  ```

### Phase 6 — Headers, docs, config

#### 6.1 License header template
- `eslint.config.js:311`: change
  `'Copyright (year) Google LLC'` → `'Copyright (year) The A-Tech Corporation'`.
- Also update the header on `eslint.config.js` itself (line 3) and
  `esbuild.config.js` (line 3).
- Run `npm run lint:fix` to auto-rewrite all 2,109 file headers in one pass.
- Verify with `grep -rIl "Copyright.*Google LLC" --include="*.ts"
  --include="*.tsx" --include="*.js" --include="*.md" . | wc -l` → expect 0
  (excluding `third_party/` and any licensed vendored code).

#### 6.2 `A-Coder.md` (the agent context doc)
Rewrite to describe the OpenAI-compatible architecture:
- Line 3: "brings the power of Gemini directly into the terminal" →
  "brings OpenAI-compatible language models directly into the terminal".
- Line 9: "terminal interface for Gemini models" →
  "terminal interface for OpenAI-compatible models (OpenAI, Ollama, LM
  Studio, vLLM, Navya, and any OpenAI-shaped endpoint)".
- Line 23: "Gemini API orchestration" →
  "OpenAI-compatible API orchestration".
- Line 70: "signing the Google CLA" → drop the CLA reference entirely or
  point at the A-Tech contribution process (see 6.3).
- Line 80: "`Copyright 2026 Google LLC`" →
  "`Copyright 2026 The A-Tech Corporation`".

#### 6.3 `CONTRIBUTING.md` (root + `docs/CONTRIBUTING.md` duplicate)
- Drop the Google CLA section entirely (lines ~22-30, 559). Replace with
  the A-Tech Corporation contribution process (DCO sign-off, or no CLA
  if that's the chosen model — pending Hamish's decision).
- Drop `[Google's Open Source Community Guidelines]` (line 36) → replace
  with a generic Code of Conduct reference or the A-Tech CoC.
- Drop `[Google Developer Documentation Style Guide]` (line 524) →
  replace with a generic style note or remove.
- Update all `cla.developers.google.com` and `opensource.google` links.

#### 6.4 `SECURITY.md`
- Line 5: "The Google Security Team will" → "The A-Tech Corporation
  security team will". Update the reporting instructions to point at
  A-Tech's contact channel (security@atechds.com or equivalent).

#### 6.5 `docs/releases.md`
- Lines 12, 15-16: drop `@google-a-coder-cli/**` and Wombat Dressing Room
  references. The "dev" environment column in the package-scope table
  should describe the A-Tech internal npm registry (or be removed if
  there is no private dev registry).
- Lines 25-27: fix the package-scope table. Remove the copy-paste error
  ("A2A Server" text in the Core row). The `prod` column already says
  `@the-a-tech-corporation/*` — keep that. Decide on a `dev` column
  (A-Tech internal registry, GitHub Packages, or drop the column).
- Line 371: "We also run a Google cloud build called" → drop or
  reframe as the A-Tech CI.
- Lines 400, 432, 505, 530: replace all
  `github.com/google-a-coder-cli/a-coder-cli-cli/...` URLs with
  `github.com/hamishfromatech/a-coder-cli/...`.

#### 6.6 `docs/resources/*`
These files had "Gemini" → "A-Coder" string-substituted in the prose but
the URLs are now broken (they point at non-existent
`a-coder-cli-*` Google paths). Each needs a real review:
- `faq.md:177,179`: `github.com/google-a-coder-cli/a-coder-cli-cli/discussions`
  → `github.com/hamishfromatech/a-coder-cli/discussions`.
- `tos-privacy.md:6,104`: update GitHub URLs. Lines 41-98 reference
  `developers.google.com/a-coder-cli-code-assist`, `ai.google.dev/a-coder-cli-api`,
  `cloud.google.com/vertex-ai`, `policies.google.com/privacy`. **These are
  Google legal/privacy documents with no A-Coder equivalent.** Decision
  required: either (a) delete the entire ToS/privacy section since A-Coder
  is local-first/OpenAI-compatible and routes all data to the user's chosen
  endpoint, or (b) replace with A-Tech's own ToS/privacy policy URLs.
- `quota-and-pricing.md:59-172`: every URL points at Google Code Assist /
  Vertex AI / `ai.google.dev`. **This entire document is Google-specific
  pricing.** Decision required: delete it (OpenAI-compatible products
  inherit the user's endpoint pricing — there's nothing for A-Coder to
  document), or rewrite it to describe Navya's pricing tiers.
- `troubleshooting.md:182`: update the issue-tracker URL.
- `keyboard-shortcuts.md:357`, `policy-engine.md:130`,
  `changelogs/index.md` (every line): replace
  `github.com/google-a-coder-cli/a-coder-cli-cli/...` URLs with
  `github.com/hamishfromatech/a-coder-cli/...`.

#### 6.7 npm / CI config
- `.npmrc`: remove `@google:registry=https://wombat-dressing-room.appspot.com`.
  Replace with the A-Tech npm registry line if one exists, otherwise delete
  the file's only line (leaving an empty `.npmrc` or removing it).
- `.github/actions/setup-npmrc/action.yml:22`: remove the Wombat Dressing
  Room echo. Replace with the A-Tech registry setup if applicable.
- `scripts/releasing/create-patch-pr.js:140`:
  `gemini-cli-robot@google.com` → an A-Tech bot identity
  (e.g. `bot@atechds.com` or `hamish@atechds.com` — pending Hamish's
  decision).

#### 6.8 Other residual references
- `integration-tests/checkpointing.test.ts:152`: assertion
  `'A-Coder CLI <gemini-cli@google.com>'` is already half-rebranded and
  inconsistent. Update to `'A-Coder CLI <noreply@atechds.com>'` (or whatever
  A-Tech bot identity is chosen in 6.7). Update the production code that
  emits this string so the test passes.
- `.lycheeignore:3`:
  `https://github.com/google-gemini/maintainers-gemini-cli/blob/main/npm.md`
  → remove (dead link, no longer relevant).
- `docs/release-confidence.md:81`: "Sign in with Google" checklist item →
  drop or replace with "Configure OpenAI-compatible provider".
- `docs/core/local-model-routing.md:82,83,101,102,120`: Gemma terms URLs
  (`ai.google.dev/gemma/terms`). If 1.3a is chosen (delete LiteRT), these
  references go too. If 1.3b is chosen, keep them as they're Gemma license
  terms, not Google SDK references.
- `packages/core/src/telemetry/constants.ts:40`:
  `export const GeminiCliOperation = ACoderCliOperation;` (deprecated
  alias). After Phase 4, no production code should reference
  `GeminiCliOperation`. Grep to confirm, then delete the alias line and
  the `/** @deprecated */` comment. Update any remaining references in
  `packages/cli/src/ui/hooks/useACoderStream.ts:39,1593,1594` (these use
  the deprecated alias — switch to `ACoderCliOperation` directly).
- `packages/core/src/agents/registry.test.ts:17,376,403` and
  `packages/core/src/skills/skillManager.ts:11,62` +
  `skillManager.test.ts:13,63,138`:
  `GeminiCLIExtension` type → rename to `ACoderCliExtension` in
  `packages/core/src/config/config.ts:394,505,3098`. Update all
  import sites. This is an internal type, not a breaking change.

### Phase 7 — Verify

- `npm ci` (regenerates `package-lock.json` without Google transitive deps).
- `npm run typecheck` — all 176 former `@google/genai` import sites still
  resolve via devDependencies.
- `npm run lint:ci` — confirms the new header template is enforced and no
  `Copyright Google LLC` lines remain.
- `npm run build` — produces `bundle/a-coder.js`.
- `grep -c "@google/genai\|GoogleGenAI\|google-auth-library\|gcp-metadata"
  bundle/a-coder.js` → expect 0.
- `grep -rIn -E "gemini-cli|gemini_cli|geminiCli|GeminiCli|Google LLC|
    @google/genai|google-a-coder-cli|wombat-dressing-room|
    goo\.gle/gemini|blog\.google/.*gemini" packages/ bundle/` →
  expect zero hits in shipped code paths (test fixtures may retain
  `a-coder-cli-*` prefixes that were renamed from `gemini-cli-*`).
- `npm run test:ci` — all unit tests pass with the renamed files and
  updated fixtures.
- `npm run test:e2e` — integration tests pass with the new auth flow
  (assuming 1.4a) and the updated `checkpointing.test.ts` assertion.
- Smoke-test the install script:
  `./scripts/install.sh --prefix ~/.local --skip-build` then run
  `a-coder-cli --version` and `a-coder-cli --help` to confirm the
  rebranded User-Agent, help text, and docs URL.
- Smoke-test the OpenAI-compatible path:
  `A_CODER_BASE_URL=https://navya.ai/v1 A_CODER_API_KEY=nv-...
   a-coder-cli` → confirm it connects and chats.

### Phase 8 — a2a-server auth stubs (post-purge, separate workstream)

The a2a-server currently has hardcoded bearer/basic auth stubs. This is
not part of the Google purge but is a prerequisite for shipping A-Coder
Cloud. Replace the stubs with real A-Coder Pro subscription auth (tied
to the A-Tech subscription system — pending that system's design). Track
this as a follow-up plan doc, not part of this one.

## Open decisions (block Phase 1.3 and 1.4)

1. **`code_assist/` + auth rewrite (Phase 1.4):**
   - **1.4a (recommended)**: Full rip-out, rewrite `auth.ts` as
     OpenAI-key-only. ~60-70% of total effort. Aligns with "purely
     OpenAI-compatible."
   - **1.4b**: Defang only, defer full deletion. Faster, but leaves
     Google OAuth in the bundle.

2. **`localLiteRtLmClient` + `liteRtServerManager` (Phase 1.3):**
   - **1.3a (recommended for cleanest purge)**: Delete both. Lose
     on-device LiteRT inference. No `GoogleGenAI` runtime use anywhere.
   - **1.3b**: Keep. One local-only `GoogleGenAI` instantiation survives.
     Feature preserved.

3. **ToS/privacy docs (Phase 6.6):**
   - Delete `docs/resources/quota-and-pricing.md` and the Google-legal
     sections of `tos-privacy.md` entirely (A-Coder is local-first,
     routes data to the user's chosen endpoint, has no Google quota to
     document)? Or rewrite them with A-Tech's own policy URLs?

4. **Bot identity (Phase 6.7):**
   - What email should replace `gemini-cli-robot@google.com` and
     `gemini-cli@google.com`? `bot@atechds.com`?
     `hamish@atechds.com`? `noreply@atechds.com`?

5. **Contribution model (Phase 6.3):**
   - Drop the CLA entirely (Apache 2.0 + DCO sign-off is enough for most
     open-source projects)? Or write an A-Tech CLA? Pending Hamish's
     legal preference.

## Estimate

- Phase 1.1 (Gemma): 0.5 day
- Phase 1.2 (quota errors): 0.5 day
- Phase 1.3 (LiteRT): 0.5 day (delete) or 0 days (keep)
- Phase 1.4 (code_assist + auth): 2-3 days (1.4a) or 0.5 day (1.4b)
- Phase 2 (dep move + verify): 0.5 day
- Phase 3 (chat rename): 0.5 day
- Phase 4 (runtime strings): 1 day
- Phase 5 (SDK rename): 0.5 day
- Phase 6 (headers/docs/config): 1-1.5 days
- Phase 7 (verify): 0.5 day

**Total: ~5-7 days for the full 1.4a purge; ~3-4 days for 1.4b.**

## What this plan is NOT

- Not Option A (vendored `packages/core/src/types/` module). The
  devDependency move satisfies "no Google code runs or ships" without a
  176-file import rewrite. Option A remains a future cleanup.
- Not a feature rewrite. Every cloud-agent capability (tools, headless
  loop, session resume, approval modes, IDE bridge, A2A server) stays
  intact. This is a cleanup, not a rebuild.
- Not the a2a-server subscription-auth work (Phase 8, separate plan).
- Not the Open Terminal container packaging (separate workstream).
- Not the IDE Plan → A2A POST wiring (lives in the A-Coder IDE repo, not
  here).