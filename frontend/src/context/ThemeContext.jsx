import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference in localStorage or prefers dark mode
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('color-theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }

      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    return 'light'; // Default theme
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const rawSetTheme = (themeValue) => {
    const root = window.document.documentElement;
    const isDark = themeValue === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(themeValue);

    localStorage.setItem('color-theme', themeValue);
  };

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  // PERFORMANCE: Memoize toggleTheme to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // PERFORMANCE: Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 