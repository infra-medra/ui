import { DEFAULT_MEDIUM_REGEX, DEFAULT_STRONG_REGEX, classifyPasswordStrength } from './password-strength';

describe('classifyPasswordStrength', () => {
  it('classifies an empty value as none', () => {
    expect(classifyPasswordStrength('', DEFAULT_MEDIUM_REGEX, DEFAULT_STRONG_REGEX)).toBe('none');
  });

  it('classifies a value matching neither regex as weak', () => {
    expect(classifyPasswordStrength('abc', DEFAULT_MEDIUM_REGEX, DEFAULT_STRONG_REGEX)).toBe('weak');
  });

  it('classifies lower+upper+digit (6+ chars) as medium', () => {
    expect(classifyPasswordStrength('Abcdef1', DEFAULT_MEDIUM_REGEX, DEFAULT_STRONG_REGEX)).toBe('medium');
  });

  it('classifies lower+upper+digit+symbol (8+ chars) as strong', () => {
    expect(classifyPasswordStrength('Abcdef1!', DEFAULT_MEDIUM_REGEX, DEFAULT_STRONG_REGEX)).toBe('strong');
  });

  it('accepts custom regexes', () => {
    const anyNonEmpty = /.+/;
    expect(classifyPasswordStrength('x', anyNonEmpty, anyNonEmpty)).toBe('strong');
  });
});
