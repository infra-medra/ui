export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

/** Lowercase + uppercase + digit, 6+ characters. */
export const DEFAULT_MEDIUM_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
/** Lowercase + uppercase + digit + symbol, 8+ characters. */
export const DEFAULT_STRONG_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/**
 * Classifies `value` against `strongRegex` first, falling back to
 * `mediumRegex`, then `weak` for any other non-empty value — never
 * evaluates both and picks the "higher" one, since a real strong password
 * is expected to satisfy the medium pattern too (a mismatched pair of
 * custom regexes, e.g. `strongRegex` looser than `mediumRegex`, is a
 * consumer configuration error this doesn't try to detect or correct).
 */
export function classifyPasswordStrength(value: string, mediumRegex: RegExp, strongRegex: RegExp): PasswordStrength {
  if (value.length === 0) {
    return 'none';
  }
  if (strongRegex.test(value)) {
    return 'strong';
  }
  if (mediumRegex.test(value)) {
    return 'medium';
  }
  return 'weak';
}
