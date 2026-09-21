import React, { createContext, useContext } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const value = {
    theme: 'light',
    toggleTheme: jest.fn(),
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'light', toggleTheme: jest.fn() };
  }
  return context;
}

export default ThemeContext;
