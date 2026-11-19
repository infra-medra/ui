import { DateRange } from './date-picker.types';

/**
 * Numeric-only token grammar (`d`/`dd`, `m`/`mm`, `yy`/`yyyy`) for
 * `DatePicker`'s `dateFormat` input. Deliberately not `Intl`-based: month/
 * weekday *names* in the calendar chrome come from `Intl.DateTimeFormat`
 * keyed by a separate `locale` input instead — this module only knows about
 * the numeric value the user types/sees, never a locale. No textual month
 * tokens (`MMM`, `January`, ...) are supported, see DatePicker's scope cuts.
 */
export type DateToken =
  | { readonly kind: 'day'; readonly padded: boolean }
  | { readonly kind: 'month'; readonly padded: boolean }
  | { readonly kind: 'year'; readonly digits: 2 | 4 }
  | { readonly kind: 'literal'; readonly value: string };

const TOKEN_PATTERN = /yyyy|yy|mm|dd|m|d/g;

function tokenFor(raw: string): DateToken {
  switch (raw) {
    case 'yyyy':
      return { kind: 'year', digits: 4 };
    case 'yy':
      return { kind: 'year', digits: 2 };
    case 'mm':
      return { kind: 'month', padded: true };
    case 'm':
      return { kind: 'month', padded: false };
    case 'dd':
      return { kind: 'day', padded: true };
    case 'd':
      return { kind: 'day', padded: false };
    default:
      throw new Error(`Unknown date format token: ${raw}`);
  }
}

export function tokenizeFormat(format: string): DateToken[] {
  const tokens: DateToken[] = [];
  let lastIndex = 0;
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(format))) {
    if (match.index > lastIndex) {
      tokens.push({ kind: 'literal', value: format.slice(lastIndex, match.index) });
    }
    tokens.push(tokenFor(match[0]));
    lastIndex = TOKEN_PATTERN.lastIndex;
  }
  if (lastIndex < format.length) {
    tokens.push({ kind: 'literal', value: format.slice(lastIndex) });
  }
  return tokens;
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

export function formatDate(date: Date, format: string): string {
  return tokenizeFormat(format)
    .map((token) => {
      switch (token.kind) {
        case 'day':
          return token.padded ? pad(date.getDate(), 2) : String(date.getDate());
        case 'month':
          return token.padded ? pad(date.getMonth() + 1, 2) : String(date.getMonth() + 1);
        case 'year':
          return token.digits === 4 ? String(date.getFullYear()) : pad(date.getFullYear() % 100, 2);
        case 'literal':
          return token.value;
      }
    })
    .join('');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface CompiledFormat {
  readonly regex: RegExp;
  readonly fields: ReadonlyArray<{ readonly kind: 'day' | 'month' | 'year'; readonly digits?: 2 | 4 }>;
}

function compileFormat(format: string): CompiledFormat {
  const fields: Array<{ kind: 'day' | 'month' | 'year'; digits?: 2 | 4 }> = [];
  let pattern = '^';
  for (const token of tokenizeFormat(format)) {
    switch (token.kind) {
      case 'day':
        pattern += '(\\d{1,2})';
        fields.push({ kind: 'day' });
        break;
      case 'month':
        pattern += '(\\d{1,2})';
        fields.push({ kind: 'month' });
        break;
      case 'year':
        pattern += token.digits === 4 ? '(\\d{4})' : '(\\d{2})';
        fields.push({ kind: 'year', digits: token.digits });
        break;
      case 'literal':
        pattern += escapeRegExp(token.value);
        break;
    }
  }
  pattern += '$';
  return { regex: new RegExp(pattern), fields };
}

/** `yy < 50 → 2000+yy`, else `1900+yy` (the jQuery UI convention). */
function pivotYear(twoDigit: number): number {
  return twoDigit < 50 ? 2000 + twoDigit : 1900 + twoDigit;
}

/**
 * Parses `text` against `format`, or returns `null` if it doesn't match or
 * describes an impossible calendar date (month outside 1-12, or a day that
 * rolls over into the next month, e.g. "02/30/2026" — checked by
 * re-extracting the constructed `Date`'s fields and comparing them back
 * against what was typed, since `new Date(2026, 1, 30)` silently normalizes
 * to March 2nd rather than throwing).
 */
export function parseDate(text: string, format: string): Date | null {
  const { regex, fields } = compileFormat(format);
  const match = regex.exec(text.trim());
  if (!match) {
    return null;
  }

  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  fields.forEach((field, i) => {
    const value = Number(match[i + 1]);
    if (field.kind === 'day') {
      day = value;
    } else if (field.kind === 'month') {
      month = value;
    } else {
      year = field.digits === 4 ? value : pivotYear(value);
    }
  });

  if (day === null || month === null || year === null || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function formatRange(range: DateRange, format: string, separator = ' - '): string {
  const startText = range.start ? formatDate(range.start, format) : '';
  const endText = range.end ? formatDate(range.end, format) : '';
  if (!startText && !endText) {
    return '';
  }
  return `${startText}${separator}${endText}`;
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Formats only the time-of-day portion of `date` for `DatePicker`'s
 * `showTime` — independent of `dateFormat`'s numeric-token grammar above
 * (never parsed back from typed text, same "no free-text range" category of
 * cut applied to datetime: see the component's class doc). `'24'` pads the
 * hour to 2 digits (`'14:05'`); `'12'` never pads the hour and appends a
 * space-separated `AM`/`PM` (`'2:05 PM'`), midnight/noon shown as `12`.
 */
export function formatTime(date: Date, hourFormat: '12' | '24'): string {
  const minutes = pad(date.getMinutes(), 2);
  if (hourFormat === '24') {
    return `${pad(date.getHours(), 2)}:${minutes}`;
  }
  const hour12 = date.getHours() % 12 || 12;
  const period = date.getHours() < 12 ? 'AM' : 'PM';
  return `${hour12}:${minutes} ${period}`;
}
