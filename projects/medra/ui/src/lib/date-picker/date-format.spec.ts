import { formatDate, formatRange, formatTime, parseDate, startOfDay } from './date-format';

describe('formatDate', () => {
  it('formats mm/dd/yyyy with zero-padding', () => {
    expect(formatDate(new Date(2026, 6, 5), 'mm/dd/yyyy')).toBe('07/05/2026');
  });

  it('formats unpadded tokens without leading zeros', () => {
    expect(formatDate(new Date(2026, 0, 1), 'd/m/yy')).toBe('1/1/26');
  });

  it('passes literal separators through verbatim', () => {
    expect(formatDate(new Date(2026, 6, 5), 'yyyy-mm-dd')).toBe('2026-07-05');
  });
});

describe('parseDate', () => {
  it('round-trips a zero-padded format', () => {
    expect(parseDate('07/05/2026', 'mm/dd/yyyy')).toEqual(new Date(2026, 6, 5));
  });

  it('accepts unpadded digits even when the format token is unpadded', () => {
    expect(parseDate('7/5/26', 'm/d/yy')).toEqual(new Date(2026, 6, 5));
  });

  it('pivots 2-digit years below 50 into the 2000s', () => {
    expect(parseDate('7/5/49', 'm/d/yy')).toEqual(new Date(2049, 6, 5));
  });

  it('pivots 2-digit years at/above 50 into the 1900s', () => {
    expect(parseDate('7/5/50', 'm/d/yy')).toEqual(new Date(1950, 6, 5));
  });

  it('rejects a month outside 1-12', () => {
    expect(parseDate('13/05/2026', 'mm/dd/yyyy')).toBeNull();
  });

  it('rejects a day that rolls over into the next month (Feb 30)', () => {
    expect(parseDate('02/30/2026', 'mm/dd/yyyy')).toBeNull();
  });

  it('accepts Feb 29 on a leap year', () => {
    expect(parseDate('02/29/2024', 'mm/dd/yyyy')).toEqual(new Date(2024, 1, 29));
  });

  it('rejects Feb 29 on a non-leap year', () => {
    expect(parseDate('02/29/2026', 'mm/dd/yyyy')).toBeNull();
  });

  it('rejects unparseable text', () => {
    expect(parseDate('nonsense', 'mm/dd/yyyy')).toBeNull();
  });

  it('rejects trailing garbage around an otherwise-valid match (anchored)', () => {
    expect(parseDate('ab07/05/2026', 'mm/dd/yyyy')).toBeNull();
    expect(parseDate('07/05/2026cd', 'mm/dd/yyyy')).toBeNull();
  });
});

describe('formatRange', () => {
  it('formats both endpoints with the default separator', () => {
    const range = { start: new Date(2026, 6, 5), end: new Date(2026, 6, 10) };
    expect(formatRange(range, 'mm/dd/yyyy')).toBe('07/05/2026 - 07/10/2026');
  });

  it('supports a custom separator', () => {
    const range = { start: new Date(2026, 6, 5), end: new Date(2026, 6, 10) };
    expect(formatRange(range, 'mm/dd/yyyy', ' to ')).toBe('07/05/2026 to 07/10/2026');
  });

  it('returns an empty string when both endpoints are null', () => {
    expect(formatRange({ start: null, end: null }, 'mm/dd/yyyy')).toBe('');
  });
});

describe('formatTime', () => {
  it('formats 24-hour with zero-padded hour and minute', () => {
    expect(formatTime(new Date(2026, 6, 5, 14, 5), '24')).toBe('14:05');
    expect(formatTime(new Date(2026, 6, 5, 0, 0), '24')).toBe('00:00');
  });

  it('formats 12-hour with an unpadded hour and AM/PM', () => {
    expect(formatTime(new Date(2026, 6, 5, 14, 5), '12')).toBe('2:05 PM');
    expect(formatTime(new Date(2026, 6, 5, 9, 30), '12')).toBe('9:30 AM');
  });

  it('shows midnight and noon as 12 in 12-hour format', () => {
    expect(formatTime(new Date(2026, 6, 5, 0, 0), '12')).toBe('12:00 AM');
    expect(formatTime(new Date(2026, 6, 5, 12, 0), '12')).toBe('12:00 PM');
  });
});

describe('startOfDay', () => {
  it('normalizes to local midnight without mutating the input', () => {
    const original = new Date(2026, 6, 5, 14, 30, 15);
    const result = startOfDay(original);
    expect(result).toEqual(new Date(2026, 6, 5, 0, 0, 0, 0));
    expect(original.getHours()).toBe(14);
  });
});
