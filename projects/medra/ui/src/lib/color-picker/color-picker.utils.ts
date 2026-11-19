export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Hue in [0, 360), saturation/brightness in [0, 100]. */
export interface Hsb {
  h: number;
  s: number;
  b: number;
}

export function hsbToRgb(hsb: Hsb): Rgb {
  const h = ((hsb.h % 360) + 360) % 360;
  const s = hsb.s / 100;
  const v = hsb.b / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToHsb(rgb: Rgb): Hsb {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / d) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / d + 2);
    } else {
      h = 60 * ((r - g) / d + 4);
    }
  }
  if (h < 0) {
    h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  return { h, s: s * 100, b: max * 100 };
}

export function rgbToHex(rgb: Rgb): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/** Accepts `#rgb` or `#rrggbb` (case-insensitive, `#` optional). Returns `null` for anything else. */
export function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.trim().replace(/^#/, '');
  const expanded = normalized.length === 3 ? normalized.replace(/(.)/g, '$1$1') : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null;
  }
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

export function hsbToHex(hsb: Hsb): string {
  return rgbToHex(hsbToRgb(hsb));
}

/** `null` for a string `hexToRgb` can't parse. */
export function hexToHsb(hex: string): Hsb | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsb(rgb) : null;
}

/** CSS-style `rgb(r, g, b)`/`hsb(h, s%, b%)` string round-trips — the two extra `format` shapes `ColorPickerComponent` reads/writes, alongside the default hex string. */
export function rgbToRgbString(rgb: Rgb): string {
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

/** Accepts `rgb(r, g, b)` (whitespace-insensitive). Returns `null` for anything else. */
export function parseRgbString(value: string): Rgb | null {
  const match = value.trim().match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (!match) {
    return null;
  }
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

export function hsbToHsbString(hsb: Hsb): string {
  return `hsb(${Math.round(hsb.h)}, ${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%)`;
}

/** Accepts `hsb(h, s%, b%)` (whitespace-insensitive). Returns `null` for anything else. */
export function parseHsbString(value: string): Hsb | null {
  const match = value.trim().match(/^hsb\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i);
  if (!match) {
    return null;
  }
  return { h: Number(match[1]), s: Number(match[2]), b: Number(match[3]) };
}
