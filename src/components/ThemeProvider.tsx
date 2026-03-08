'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'midnight' | 'emerald' | 'cyberpunk' | 'classic-dark' | 'pearl-white';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: { id: Theme; name: string; colors: { primary: string; bg: string; accent: string } }[] = [
    {
        id: 'midnight',
        name: 'Midnight Blue',
        colors: { primary: '#6c5ce7', bg: '#0f0f1a', accent: '#a29bfe' }
    },
    {
        id: 'pearl-white',
        name: 'Pearl White',
        colors: { primary: '#D4AF37', bg: '#FDFBF7', accent: '#B78F82' }
    },
    {
        id: 'emerald',
        name: 'Emerald Forest',
        colors: { primary: '#D4AF37', bg: '#0D1F15', accent: '#E8D2A6' }
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
    const [theme, setTheme] = useState<Theme>('emerald');

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
            } else if (theme === 'pearl-white') {
                root.style.setProperty('--tg-secondary-bg-color', '#F5F2EB');
                root.style.setProperty('--tg-section-bg-color', '#FFFFFF');
                root.style.setProperty('--tg-text-color', '#2C2A29');
                root.style.setProperty('--tg-hint-color', '#8A847C');
                root.style.setProperty('--tg-button-text-color', '#FFFFFF');
                root.style.setProperty('--tg-header-bg-color', '#FDFBF7');
            } else if (theme === 'emerald') {
                root.style.setProperty('--tg-secondary-bg-color', '#122B1E');
                root.style.setProperty('--tg-section-bg-color', '#163624');
                root.style.setProperty('--tg-text-color', '#FDFBF7');
                root.style.setProperty('--tg-hint-color', '#A4B8AD');
                root.style.setProperty('--tg-button-text-color', '#0D1F15');
                root.style.setProperty('--tg-header-bg-color', '#0D1F15');
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

    const toggleTheme = () => {
        setTheme(prev => prev === 'emerald' ? 'pearl-white' : 'emerald');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
