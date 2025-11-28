import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Theme: 'dark' or 'light'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });

    // Accent Color: 'blue', 'indigo', 'violet', etc.
    const [accentColor, setAccentColor] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accentColor') || 'blue';
        }
        return 'blue';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old theme class
        root.classList.remove('light', 'dark');
        // Add new theme class
        root.classList.add(theme);

        localStorage.setItem('theme', theme);
    }, [theme]);

    const colorMap = {
        blue: { primary: '#2563eb', hover: '#1d4ed8', ring: '219 100% 50%' }, // blue-600, blue-700
        indigo: { primary: '#4f46e5', hover: '#4338ca', ring: '243 75% 59%' }, // indigo-600, indigo-700
        violet: { primary: '#7c3aed', hover: '#6d28d9', ring: '261 81% 58%' }, // violet-600, violet-700
        emerald: { primary: '#059669', hover: '#047857', ring: '159 93% 30%' }, // emerald-600, emerald-700
        rose: { primary: '#e11d48', hover: '#be123c', ring: '343 77% 50%' }, // rose-600, rose-700
        amber: { primary: '#d97706', hover: '#b45309', ring: '38 92% 44%' }, // amber-600, amber-700
    };

    useEffect(() => {
        localStorage.setItem('accentColor', accentColor);

        const root = window.document.documentElement;
        const colors = colorMap[accentColor] || colorMap.blue;

        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-hover', colors.hover);
        // We can add more variables if needed, e.g. for rings or light backgrounds
    }, [accentColor]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
