import React, { useState, useEffect } from 'react';
import { ThemeContext } from './useTheme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('schemesetu_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('schemesetu_theme', theme);
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-contrast');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : prev === 'light' ? 'contrast' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
