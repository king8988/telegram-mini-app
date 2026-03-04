'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'midnight' | 'emerald' | 'cyberpunk' | 'classic-dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: { id: Theme; name: string; colors: { primary: string; bg: string; accent: string } }[] = [
    {
        id: 'midnight',
        name: 'Midnight Blue',
        colors: { primary: '#6c5ce7', bg: '#0f0f1a', accent: '#a29bfe' }
    },
    {
        id: 'emerald',
        name: 'Emerald Forest',
        colors: { primary: '#00b894', bg: '#0b1a13', accent: '#55efc4' }
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Gold',
        colors: { primary: '#fdcb6e', bg: '#1a1a0f', accent: '#ffeaa7' }
    },
    {
        id: 'classic-dark',
        name: 'Classic Dark',
        colors: { primary: '#0984e3', bg: '#0d0d0d', accent: '#74b9ff' }
    }
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('midnight');

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as Theme;
        if (savedTheme && themes.find(t => t.id === savedTheme)) {
            setTheme(savedTheme);
        }
    }, []);

    // Apply theme to document and save to localStorage
    useEffect(() => {
        const selectedTheme = themes.find(t => t.id === theme);
        if (selectedTheme) {
            const root = document.documentElement;
            root.setAttribute('data-theme', theme);

            // Manually inject theme colors into CSS variables
            root.style.setProperty('--tg-bg-color', selectedTheme.colors.bg);
            root.style.setProperty('--tg-button-color', selectedTheme.colors.primary);
            root.style.setProperty('--tg-link-color', selectedTheme.colors.primary);
            root.style.setProperty('--tg-accent-text-color', selectedTheme.colors.accent);
            root.style.setProperty('--tg-section-header-color', selectedTheme.colors.accent);

            // Handle secondary backgrounds and other derived colors
            if (theme === 'midnight') {
                root.style.setProperty('--tg-secondary-bg-color', '#1a1a2e');
                root.style.setProperty('--tg-section-bg-color', '#16213e');
            } else if (theme === 'emerald') {
                root.style.setProperty('--tg-secondary-bg-color', '#122b20');
                root.style.setProperty('--tg-section-bg-color', '#1a3a2a');
            } else if (theme === 'cyberpunk') {
                root.style.setProperty('--tg-secondary-bg-color', '#2e2e1a');
                root.style.setProperty('--tg-section-bg-color', '#3e3e16');
            } else if (theme === 'classic-dark') {
                root.style.setProperty('--tg-secondary-bg-color', '#1a1a1a');
                root.style.setProperty('--tg-section-bg-color', '#2f3542');
            }

            localStorage.setItem('app-theme', theme);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
