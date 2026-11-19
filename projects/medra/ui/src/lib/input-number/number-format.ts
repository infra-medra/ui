export type InputNumberMode = 'decimal' | 'currency';
export type InputNumberCurrencyDisplay = 'symbol' | 'narrowSymbol' | 'code' | 'name';

export interface NumberFormatOptions {
  readonly locale: string;
  readonly mode: InputNumberMode;
  readonly currency: string;
  readonly currencyDisplay: InputNumberCurrencyDisplay;
  readonly minFractionDigits: number | null;
  readonly maxFractionDigits: number | null;
  readonly useGrouping: boolean;
  readonly prefix: string;
  readonly suffix: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildIntlFormatter(options: NumberFormatOptions): Intl.NumberFormat {
  const intlOptions: Intl.NumberFormatOptions = { useGrouping: options.useGrouping };
  if (options.mode === 'currency') {
    intlOptions.style = 'currency';
    intlOptions.currency = options.currency;
    intlOptions.currencyDisplay = options.currencyDisplay;
  }
  if (options.minFractionDigits !== null) {
    intlOptions.minimumFractionDigits = options.minFractionDigits;
  }
  if (options.maxFractionDigits !== null) {
    intlOptions.maximumFractionDigits = options.maxFractionDigits;
  }
  return new Intl.NumberFormat(options.locale, intlOptions);
}

export function formatNumber(value: number, options: NumberFormatOptions): string {
  return `${options.prefix}${buildIntlFormatter(options).format(value)}${options.suffix}`;
}

/**
 * The locale's decimal separator (e.g. `.` for `en-US`, `,` for `pt-BR`) is
 * the only locale-specific character this parser needs to know about:
 * everything else typed (grouping separators, currency symbols, `prefix`/
 * `suffix` text) is discarded by the digit/minus/decimal-only filter below,
 * so it never has to be stripped explicitly.
 */
function decimalSeparatorFor(locale: string): string {
  return new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
}

/**
 * Parses free-typed text back into a number, or `null` if nothing
 * numeric survives. Deliberately lenient about *where* the number sits in
 * the string (currency symbols, `prefix`/`suffix`, grouping separators are
 * all just filtered out) so the same logic works while the user is still
 * mid-edit, not just once formatting has fully settled.
 */
export function parseNumber(text: string, options: Pick<NumberFormatOptions, 'locale'>): number | null {
  const decimalSeparator = decimalSeparatorFor(options.locale);
  const escapedDecimal = escapeRegExp(decimalSeparator);

  let cleaned = text.replace(new RegExp(`[^0-9\\-${escapedDecimal}]`, 'g'), '');
  cleaned = cleaned.replace(/(?!^)-/g, '');

  const separatorIndex = cleaned.indexOf(decimalSeparator);
  if (separatorIndex !== -1) {
    cleaned =
      cleaned.slice(0, separatorIndex + decimalSeparator.length) +
      cleaned
        .slice(separatorIndex + decimalSeparator.length)
        .split(decimalSeparator)
        .join('');
  }
  if (decimalSeparator !== '.') {
    cleaned = cleaned.replace(decimalSeparator, '.');
  }

  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

function decimalPlacesOf(value: number): number {
  const text = Math.abs(value).toString();
  const separatorIndex = text.indexOf('.');
  return separatorIndex === -1 ? 0 : text.length - separatorIndex - 1;
}

/**
 * Rounds to the coarser of `step`'s own decimal places and
 * `maxFractionDigits` — keeps repeated stepping (e.g. `step="0.1"`) from
 * drifting into floating-point noise like `0.30000000000000004`.
 */
export function roundToStepPrecision(value: number, step: number, maxFractionDigits: number | null): number {
  const decimals = Math.max(decimalPlacesOf(step), maxFractionDigits ?? 0);
  return Number(value.toFixed(decimals));
}
