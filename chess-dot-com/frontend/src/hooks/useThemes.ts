import { useContext } from "react";
import { ThemeContext, type THEME_CONTEXT } from "../context/theme";

export function useThemeContext() {
  const data = useContext(ThemeContext) as THEME_CONTEXT;
  return data;
}