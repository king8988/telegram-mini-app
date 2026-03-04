'use client';

import {
  init,
  backButton,
  miniApp,
  themeParams,
  viewport,
  swipeBehavior,
  closingBehavior,
} from '@tma.js/sdk';

export interface TelegramTheme {
  bgColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBgColor: string;
  headerBgColor: string;
  accentTextColor: string;
  sectionBgColor: string;
  sectionHeaderTextColor: string;
  subtitleTextColor: string;
  destructiveTextColor: string;
}

const DEFAULT_THEME: TelegramTheme = {
  bgColor: '#0f0f1a',
  textColor: '#ffffff',
  hintColor: '#7c7c8a',
  linkColor: '#6c5ce7',
  buttonColor: '#6c5ce7',
  buttonTextColor: '#ffffff',
  secondaryBgColor: '#1a1a2e',
  headerBgColor: '#0f0f1a',
  accentTextColor: '#a29bfe',
  sectionBgColor: '#16213e',
  sectionHeaderTextColor: '#a29bfe',
  subtitleTextColor: '#7c7c8a',
  destructiveTextColor: '#ff6b6b',
};

export function isTelegramEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    window.location.hash.includes('tgWebAppData') ||
    (window as unknown as Record<string, unknown>).Telegram
  );
}

export function initTelegramSdk(): { theme: TelegramTheme; isTelegram: boolean } {
  if (typeof window === 'undefined') {
    return { theme: DEFAULT_THEME, isTelegram: false };
  }

  const isTelegram = isTelegramEnvironment();

  if (!isTelegram) {
    console.info('[TG Mini App] Not running in Telegram — using fallback theme.');
    return { theme: DEFAULT_THEME, isTelegram: false };
  }

  try {
    init();

    // Expand the viewport to full height
    if (!viewport.isMounted()) {
      viewport.mount().then(() => {
        if (!viewport.isExpanded()) {
          viewport.expand();
        }
      }).catch(() => { });
    }

    // Disable swipe-to-close for better UX
    try {
      if (!swipeBehavior.isMounted()) {
        swipeBehavior.mount();
      }
      swipeBehavior.disableVertical();
    } catch {
      // Not supported in all versions
    }

    // Enable close confirmation
    try {
      closingBehavior.enableConfirmation();
    } catch {
      // Not supported in all versions
    }

    // Mount theme params
    if (!themeParams.isMounted()) {
      themeParams.mount();
    }

    const theme: TelegramTheme = {
      bgColor: themeParams.bgColor() ?? DEFAULT_THEME.bgColor,
      textColor: themeParams.textColor() ?? DEFAULT_THEME.textColor,
      hintColor: themeParams.hintColor() ?? DEFAULT_THEME.hintColor,
      linkColor: themeParams.linkColor() ?? DEFAULT_THEME.linkColor,
      buttonColor: themeParams.buttonColor() ?? DEFAULT_THEME.buttonColor,
      buttonTextColor: themeParams.buttonTextColor() ?? DEFAULT_THEME.buttonTextColor,
      secondaryBgColor: themeParams.secondaryBgColor() ?? DEFAULT_THEME.secondaryBgColor,
      headerBgColor: themeParams.headerBgColor() ?? DEFAULT_THEME.headerBgColor,
      accentTextColor: themeParams.accentTextColor() ?? DEFAULT_THEME.accentTextColor,
      sectionBgColor: themeParams.sectionBgColor() ?? DEFAULT_THEME.sectionBgColor,
      sectionHeaderTextColor: themeParams.sectionHeaderTextColor() ?? DEFAULT_THEME.sectionHeaderTextColor,
      subtitleTextColor: themeParams.subtitleTextColor() ?? DEFAULT_THEME.subtitleTextColor,
      destructiveTextColor: themeParams.destructiveTextColor() ?? DEFAULT_THEME.destructiveTextColor,
    };

    return { theme, isTelegram: true };
  } catch (error) {
    console.error('[TG Mini App] SDK init failed:', error);
    return { theme: DEFAULT_THEME, isTelegram: false };
  }
}

export function setupBackButton(onBack: () => void): () => void {
  if (!isTelegramEnvironment()) return () => { };

  try {
    if (!backButton.isMounted()) {
      backButton.mount();
    }
    backButton.show();
    const off = backButton.onClick(onBack);
    return () => {
      off();
      backButton.hide();
    };
  } catch {
    return () => { };
  }
}

export { DEFAULT_THEME };
