'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initTelegramSdk, TelegramTheme, DEFAULT_THEME } from '@/lib/telegram';

interface TelegramContextValue {
    theme: TelegramTheme;
    isTelegram: boolean;
    isReady: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
    theme: DEFAULT_THEME,
    isTelegram: false,
    isReady: false,
});

export function useTelegram() {
    return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<TelegramContextValue>({
        theme: DEFAULT_THEME,
        isTelegram: false,
        isReady: false,
    });

    useEffect(() => {
        const { theme, isTelegram } = initTelegramSdk();

        // Apply CSS custom properties from theme
        const root = document.documentElement;
        root.style.setProperty('--tg-bg-color', theme.bgColor);
        root.style.setProperty('--tg-text-color', theme.textColor);
        root.style.setProperty('--tg-hint-color', theme.hintColor);
        root.style.setProperty('--tg-link-color', theme.linkColor);
        root.style.setProperty('--tg-button-color', theme.buttonColor);
        root.style.setProperty('--tg-button-text-color', theme.buttonTextColor);
        root.style.setProperty('--tg-secondary-bg-color', theme.secondaryBgColor);
        root.style.setProperty('--tg-header-bg-color', theme.headerBgColor);
        root.style.setProperty('--tg-accent-text-color', theme.accentTextColor);
        root.style.setProperty('--tg-section-bg-color', theme.sectionBgColor);
        root.style.setProperty('--tg-section-header-color', theme.sectionHeaderTextColor);
        root.style.setProperty('--tg-subtitle-color', theme.subtitleTextColor);
        root.style.setProperty('--tg-destructive-color', theme.destructiveTextColor);

        setState({ theme, isTelegram, isReady: true });
    }, []);

    if (!state.isReady) {
        return (
            <div className="tg-loading">
                <div className="tg-loading-spinner" />
            </div>
        );
    }

    return (
        <TelegramContext.Provider value={state}>
            {children}
        </TelegramContext.Provider>
    );
}
