import { useEffect, useState } from 'react';
import { AVAILABLE_THEMES, ThemeContext, type THEME, type THEME_CONTEXT } from './theme';

export function ThemesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<THEME>(() => {
    const stored = localStorage.getItem('theme') as THEME | null;
    return stored && AVAILABLE_THEMES.includes(stored) ? stored : 'default';
  });

  const updateTheme: THEME_CONTEXT['updateTheme'] = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Keep DOM in sync with theme.
  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, updateTheme }}>{children}</ThemeContext.Provider>;
}
