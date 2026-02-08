export function stripHash(hex: string): string {
  return hex.replace(/^#/, "");
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = stripHash(hex);
  const n = parseInt(clean, 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastText(bgHex: string): string {
  return luminance(bgHex) > 0.4 ? "333333" : "FFFFFF";
}

export function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return [lr, lg, lb].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.max(0, Math.round(r * (1 - amount)));
  const dg = Math.max(0, Math.round(g * (1 - amount)));
  const db = Math.max(0, Math.round(b * (1 - amount)));
  return [dr, dg, db].map((c) => c.toString(16).padStart(2, "0")).join("");
}
