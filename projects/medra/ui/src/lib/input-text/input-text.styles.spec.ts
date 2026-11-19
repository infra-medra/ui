import { inputTextVariants } from './input-text.styles';

describe('inputTextVariants', () => {
  it('applies the default size and no invalid state by default', () => {
    const classes = inputTextVariants();

    expect(classes).toContain('px-(--spacing-field-x)');
    expect(classes).toContain('text-(length:--text-field-base)');
    expect(classes).not.toContain('border-danger-500');
  });

  it.each([
    ['sm', 'px-(--spacing-field-sm-x)'],
    ['default', 'px-(--spacing-field-x)'],
    ['lg', 'px-(--spacing-field-lg-x)'],
  ] as const)('size=%s sets field padding %s', (size, expectedClass) => {
    expect(inputTextVariants({ size })).toContain(expectedClass);
  });

  it('invalid overrides the border and focus ring color', () => {
    const classes = inputTextVariants({ invalid: true });

    expect(classes).toContain('border-danger-500');
    expect(classes).toContain('focus:ring-danger-500');
  });

  it('carries the shared disabled-state classes', () => {
    const classes = inputTextVariants();

    expect(classes).toContain('disabled:cursor-not-allowed');
    expect(classes).toContain('disabled:opacity-(--opacity-disabled)');
  });
});
