/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { CodeAssistServer } from '../server.js';
import {
  type FetchAdminControlsResponse,
  FetchAdminControlsResponseSchema,
  McpConfigDefinitionSchema,
  type AdminControlsSettings,
} from '../types.js';
import type { Config } from '../../config/config.js';

let pollingInterval: NodeJS.Timeout | undefined;

export function sanitizeAdminSettings(
  settings: FetchAdminControlsResponse,
): AdminControlsSettings {
  const result = FetchAdminControlsResponseSchema.safeParse(settings);
  if (!result.success) {
    return {};
  }
  const sanitized = result.data;
  let mcpConfig;

  if (sanitized.mcpSetting?.mcpConfigJson) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(sanitized.mcpSetting.mcpConfigJson);
      const validationResult = McpConfigDefinitionSchema.safeParse(parsed);

      if (validationResult.success) {
        mcpConfig = validationResult.data;
        // Sort include/exclude tools for stable comparison
        if (mcpConfig.mcpServers) {
          for (const server of Object.values(mcpConfig.mcpServers)) {
            if (server.includeTools) {
              server.includeTools.sort();
            }
            if (server.excludeTools) {
              server.excludeTools.sort();
            }
          }
        }
        if (mcpConfig.requiredMcpServers) {
          for (const server of Object.values(mcpConfig.requiredMcpServers)) {
            if (server.includeTools) {
              server.includeTools.sort();
            }
            if (server.excludeTools) {
              server.excludeTools.sort();
            }
          }
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }

  // Apply defaults (secureModeEnabled is supported for backward compatibility)
  let strictModeDisabled = false;
  if (sanitized.strictModeDisabled !== undefined) {
    strictModeDisabled = sanitized.strictModeDisabled;
  } else if (sanitized.secureModeEnabled !== undefined) {
    strictModeDisabled = !sanitized.secureModeEnabled;
  }

  return {
    strictModeDisabled,
    cliFeatureSetting: {
      ...sanitized.cliFeatureSetting,
      extensionsSetting: {
        extensionsEnabled:
          sanitized.cliFeatureSetting?.extensionsSetting?.extensionsEnabled ??
          false,
      },
      unmanagedCapabilitiesEnabled:
        sanitized.cliFeatureSetting?.unmanagedCapabilitiesEnabled ?? false,
    },
    mcpSetting: {
      mcpEnabled: sanitized.mcpSetting?.mcpEnabled ?? false,
      mcpConfig: mcpConfig ?? {},
      ...(mcpConfig?.requiredMcpServers && {
        requiredMcpConfig: mcpConfig.requiredMcpServers,
      }),
    },
  };
}

/**
 * Fetches the admin controls from the server if enabled by experiment flag.
 * Safely handles polling start/stop based on the flag and server availability.
 *
 * This stub stops any polling and returns empty settings without calling a
 * Google endpoint.
 */
export async function fetchAdminControls(
   
  _server: CodeAssistServer | undefined,
  cachedSettings: AdminControlsSettings | undefined,
   
  _adminControlsEnabled: boolean,
   
  _onSettingsChanged: (settings: AdminControlsSettings) => void,
): Promise<AdminControlsSettings> {
  stopAdminControlsPolling();
  return cachedSettings ?? {};
}

/**
 * Fetches the admin controls from the server a single time.
 * This function does not start or stop any polling.
 */
export async function fetchAdminControlsOnce(
   
  _server: CodeAssistServer | undefined,
   
  _adminControlsEnabled: boolean,
): Promise<FetchAdminControlsResponse> {
  return {};
}

/**
 * Stops polling for admin controls.
 */
export function stopAdminControlsPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = undefined;
  }
}

/**
 * Returns a standardized error message for features disabled by admin settings.
 */
export function getAdminErrorMessage(
  featureName: string,
   
  _config: Config | undefined,
): string {
  return `${featureName} is disabled by your administrator.`;
}

/**
 * Returns a standardized error message for MCP servers blocked by the admin allowlist.
 */
export function getAdminBlockedMcpServersMessage(
  blockedServers: string[],
   
  _config: Config | undefined,
): string {
  const count = blockedServers.length;
  const serverText = count === 1 ? 'server is' : 'servers are';

  return `${count} MCP ${serverText} not allowlisted by your administrator.`;
}
