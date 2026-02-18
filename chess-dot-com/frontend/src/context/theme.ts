import { createContext } from 'react';

export type THEME = 'default' | 'bubblegum';

export type THEME_CONTEXT = {
  theme: THEME;
  updateTheme: (theme: THEME) => void;
};

export const AVAILABLE_THEMES: THEME[] = ['default', 'bubblegum'];

export const ThemeContext = createContext<THEME_CONTEXT | null>(null);
