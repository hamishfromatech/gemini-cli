/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from 'ink';
import { UserIdentity } from './UserIdentity.js';
import { Tips } from './Tips.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { Banner } from './Banner.js';
import { useBanner } from '../hooks/useBanner.js';
import { useTips } from '../hooks/useTips.js';
import { theme } from '../semantic-colors.js';
import { ThemedGradient } from './ThemedGradient.js';
import { CliSpinner } from './CliSpinner.js';

import { isAppleTerminal } from '@the-a-tech-corporation/core';

interface AppHeaderProps {
  version: string;
  showDetails?: boolean;
}

/**
 * A-Coder CLI mark: a slanted block-drawing "A" that is unique to the brand.
 */
const DEFAULT_ICON = ` ▝▜▄
   ▝▜▄
  ▗▟▀
 ▝▀`;

/**
 * Apple Terminal.app adds extra line-height padding between rows, which breaks
 * vertical adjacency for half-block characters. This variant keeps the same
 * outer shape as DEFAULT_ICON but uses horizontally-connecting blocks so the
 * padding gaps read as intentional scanlines rather than a broken diagonal.
 */
const MAC_TERMINAL_ICON = ` ▝▜▄
   ▝▜▄
   ▗▟▀
 ▗▟▀`;

/**
 * The terminal width below which we switch to a narrow/column layout to prevent
 * UI elements from wrapping or overlapping.
 */
const NARROW_TERMINAL_BREAKPOINT = 60;

export const AppHeader = ({ version, showDetails = true }: AppHeaderProps) => {
  const settings = useSettings();
  const config = useConfig();
  const {
    terminalWidth,
    bannerData,
    bannerVisible,
    updateInfo,
  } = useUIState();

  const { bannerText } = useBanner(bannerData);
  const { showTips } = useTips();

  const showHeader = !(
    settings.merged.ui.hideBanner || config.getScreenReader()
  );

  const ICON = isAppleTerminal() ? MAC_TERMINAL_ICON : DEFAULT_ICON;

  // If the terminal is too narrow to fit the icon and metadata (especially long nightly versions)
  // side-by-side, we switch to column mode to prevent wrapping.
  const isNarrow = terminalWidth < NARROW_TERMINAL_BREAKPOINT;

  const renderLogo = () => (
    <Box flexShrink={0}>
      <ThemedGradient>{ICON}</ThemedGradient>
    </Box>
  );

  const renderMetadata = (isBelow = false) => (
    <Box marginLeft={isBelow ? 0 : 2} flexDirection="column">
      {/* Line 1: A-Coder CLI vVersion [Updating] */}
      <Box>
        <Text bold color={theme.text.primary}>
          A-Coder CLI
        </Text>
        <Text color={theme.text.secondary}> v{version}</Text>
        {updateInfo?.isUpdating && (
          <Box marginLeft={2}>
            <Text color={theme.text.secondary}>
              <CliSpinner /> Updating
            </Text>
          </Box>
        )}
      </Box>

      {showDetails && (
        <>
          {/* Line 2: Blank */}
          <Box height={1} />

          {/* Lines 3 & 4: User Identity info (Email /auth and Plan /upgrade) */}
          {settings.merged.ui.showUserIdentity !== false && (
            <UserIdentity config={config} />
          )}
        </>
      )}
    </Box>
  );

  const useColumnLayout = isNarrow;

  return (
    <Box flexDirection="column">
      {showHeader && (
        <Box
          flexDirection={useColumnLayout ? 'column' : 'row'}
          marginTop={1}
          marginBottom={1}
          paddingLeft={1}
        >
          {renderLogo()}
          {useColumnLayout ? (
            <Box marginTop={1}>{renderMetadata(true)}</Box>
          ) : (
            renderMetadata(false)
          )}
        </Box>
      )}

      {bannerVisible && bannerText && (
        <Banner
          width={terminalWidth}
          bannerText={bannerText}
          isWarning={bannerData.warningText !== ''}
        />
      )}

      {!(settings.merged.ui.hideTips || config.getScreenReader()) &&
        showTips && <Tips config={config} />}
    </Box>
  );
};
