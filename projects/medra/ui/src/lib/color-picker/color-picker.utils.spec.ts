import { hexToHsb, hexToRgb, hsbToHex, hsbToHsbString, hsbToRgb, parseHsbString, parseRgbString, rgbToHex, rgbToHsb, rgbToRgbString } from './color-picker.utils';

describe('color-picker.utils', () => {
  describe('hexToRgb', () => {
    it('parses a 6-digit hex color', () => {
      expect(hexToRgb('#3b82f6')).toEqual({ r: 0x3b, g: 0x82, b: 0xf6 });
    });

    it('parses a 3-digit shorthand hex color', () => {
      expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('works without the leading #', () => {
      expect(hexToRgb('3b82f6')).toEqual({ r: 0x3b, g: 0x82, b: 0xf6 });
    });

    it('returns null for an unparseable string', () => {
      expect(hexToRgb('not-a-color')).toBeNull();
      expect(hexToRgb('#12')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('formats as a lowercase 6-digit hex color, zero-padded', () => {
      expect(rgbToHex({ r: 0, g: 8, b: 255 })).toBe('#0008ff');
    });
  });

  describe('hsbToRgb / rgbToHsb', () => {
    it('converts pure red', () => {
      expect(hsbToRgb({ h: 0, s: 100, b: 100 })).toEqual({ r: 255, g: 0, b: 0 });
      expect(rgbToHsb({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, b: 100 });
    });

    it('converts pure green', () => {
      expect(hsbToRgb({ h: 120, s: 100, b: 100 })).toEqual({ r: 0, g: 255, b: 0 });
      expect(rgbToHsb({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, b: 100 });
    });

    it('converts pure blue', () => {
      expect(hsbToRgb({ h: 240, s: 100, b: 100 })).toEqual({ r: 0, g: 0, b: 255 });
      expect(rgbToHsb({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, b: 100 });
    });

    it('converts white to zero saturation, full brightness', () => {
      expect(rgbToHsb({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, b: 100 });
    });

    it('converts black to zero brightness', () => {
      expect(rgbToHsb({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, b: 0 });
    });
  });

  describe('hexToHsb / hsbToHex round-trip', () => {
    it('round-trips a color through hex -> HSB -> hex', () => {
      expect(hsbToHex(hexToHsb('#3b82f6')!)).toBe('#3b82f6');
    });

    it('returns null for an unparseable hex string', () => {
      expect(hexToHsb('nope')).toBeNull();
    });
  });

  describe('rgb() string round-trip (format="rgb")', () => {
    it('formats as rgb(r, g, b)', () => {
      expect(rgbToRgbString({ r: 59, g: 130, b: 246 })).toBe('rgb(59, 130, 246)');
    });

    it('parses back, whitespace-insensitive', () => {
      expect(parseRgbString('rgb(59, 130, 246)')).toEqual({ r: 59, g: 130, b: 246 });
      expect(parseRgbString('rgb(59,130,246)')).toEqual({ r: 59, g: 130, b: 246 });
    });

    it('returns null for an unparseable string', () => {
      expect(parseRgbString('not-a-color')).toBeNull();
      expect(parseRgbString('hsb(210, 76%, 96%)')).toBeNull();
    });
  });

  describe('hsb() string round-trip (format="hsb")', () => {
    it('formats as hsb(h, s%, b%)', () => {
      expect(hsbToHsbString({ h: 217, s: 76, b: 96 })).toBe('hsb(217, 76%, 96%)');
    });

    it('parses back, whitespace-insensitive', () => {
      expect(parseHsbString('hsb(217, 76%, 96%)')).toEqual({ h: 217, s: 76, b: 96 });
      expect(parseHsbString('hsb(217,76%,96%)')).toEqual({ h: 217, s: 76, b: 96 });
    });

    it('returns null for an unparseable string', () => {
      expect(parseHsbString('not-a-color')).toBeNull();
      expect(parseHsbString('rgb(59, 130, 246)')).toBeNull();
    });
  });
});
