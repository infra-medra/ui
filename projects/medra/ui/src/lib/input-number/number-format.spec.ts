import { formatNumber, parseNumber, roundToStepPrecision } from './number-format';

const decimalOptions = {
  locale: 'en-US',
  mode: 'decimal' as const,
  currency: 'USD',
  currencyDisplay: 'symbol' as const,
  minFractionDigits: null,
  maxFractionDigits: null,
  useGrouping: true,
  prefix: '',
  suffix: '',
};

describe('formatNumber', () => {
  it('formats a plain decimal with grouping', () => {
    expect(formatNumber(1234.5, decimalOptions)).toBe('1,234.5');
  });

  it('formats as currency when mode is currency', () => {
    expect(formatNumber(1234.5, { ...decimalOptions, mode: 'currency', currency: 'USD' })).toBe('$1,234.50');
  });

  it('applies prefix and suffix around the formatted number', () => {
    expect(formatNumber(42, { ...decimalOptions, prefix: '~', suffix: ' kg' })).toBe('~42 kg');
  });

  it('respects minFractionDigits/maxFractionDigits', () => {
    expect(formatNumber(1, { ...decimalOptions, minFractionDigits: 2, maxFractionDigits: 2 })).toBe('1.00');
  });

  it('omits grouping separators when useGrouping is false', () => {
    expect(formatNumber(1234, { ...decimalOptions, useGrouping: false })).toBe('1234');
  });

  it('uses the locale-specific decimal separator (pt-BR)', () => {
    expect(formatNumber(1234.5, { ...decimalOptions, locale: 'pt-BR' })).toBe('1.234,5');
  });
});

describe('parseNumber', () => {
  it('parses a plain integer', () => {
    expect(parseNumber('42', decimalOptions)).toBe(42);
  });

  it('parses a decimal typed mid-edit', () => {
    expect(parseNumber('12.', decimalOptions)).toBe(12);
  });

  it('strips grouping separators, currency symbols, and prefix/suffix text', () => {
    expect(parseNumber('$1,234.50', decimalOptions)).toBe(1234.5);
    expect(parseNumber('~42 kg', decimalOptions)).toBe(42);
  });

  it('keeps only a leading minus sign', () => {
    expect(parseNumber('1-2-3', decimalOptions)).toBe(123);
    expect(parseNumber('-5', decimalOptions)).toBe(-5);
  });

  it('keeps only the first decimal separator', () => {
    expect(parseNumber('1.2.3', decimalOptions)).toBe(1.23);
  });

  it('returns null for text with nothing numeric left over', () => {
    expect(parseNumber('', decimalOptions)).toBeNull();
    expect(parseNumber('-', decimalOptions)).toBeNull();
    expect(parseNumber('.', decimalOptions)).toBeNull();
    expect(parseNumber('abc', decimalOptions)).toBeNull();
  });

  it('parses using a locale-specific decimal separator (pt-BR)', () => {
    expect(parseNumber('1.234,5', { ...decimalOptions, locale: 'pt-BR' })).toBe(1234.5);
  });
});

describe('roundToStepPrecision', () => {
  it('avoids floating-point drift when repeatedly adding a fractional step', () => {
    expect(roundToStepPrecision(0.1 + 0.2, 0.1, null)).toBe(0.3);
  });

  it('rounds to the step precision even when maxFractionDigits is coarser', () => {
    expect(roundToStepPrecision(1.23456, 0.01, 0)).toBe(1.23);
  });

  it('rounds to maxFractionDigits when it is finer than the step precision', () => {
    expect(roundToStepPrecision(1.23456, 1, 2)).toBe(1.23);
  });
});
