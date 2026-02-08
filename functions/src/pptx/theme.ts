import type { BrandTheme, ResolvedTheme } from "./types";
import { stripHash, contrastText } from "./utils/color";

const DEFAULT_THEME: BrandTheme = {
  colors: {
    primary: "#0050A0",
    secondary: "#003366",
    accent: "#00A0E9",
    background: "#FFFFFF",
    text: "#333333",
  },
  typography: {
    fontFamily: "Calibri",
    baseSize: 14,
    scale: 1.25,
  },
};

export function resolveTheme(theme?: BrandTheme): ResolvedTheme {
  const t = theme ?? DEFAULT_THEME;
  const base = t.typography.baseSize;
  const scale = t.typography.scale;

  return {
    primary: stripHash(t.colors.primary),
    secondary: stripHash(t.colors.secondary),
    accent: stripHash(t.colors.accent),
    background: stripHash(t.colors.background),
    text: stripHash(t.colors.text),
    fontFamily: t.typography.fontFamily,
    baseSize: base,
    headingSize: Math.round(base * scale),
    titleSize: Math.round(base * scale * scale),
    lightText: contrastText(t.colors.primary),
    darkText: contrastText(t.colors.background),
  };
}

export { DEFAULT_THEME };
