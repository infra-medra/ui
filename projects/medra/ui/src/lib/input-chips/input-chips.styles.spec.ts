import { inputChipsWrapperVariants } from './input-chips.styles';

describe('inputChipsWrapperVariants', () => {
  it.each([
    ['sm', 'py-1'],
    ['default', 'py-1.5'],
    ['lg', 'py-2'],
  ] as const)('size=%s sets padding %s', (size, expectedClass) => {
    expect(inputChipsWrapperVariants({ size })).toContain(expectedClass);
  });

  it('is unfocused/valid/enabled by default: brand focus ring, no danger border, no disabled dimming', () => {
    const classes = inputChipsWrapperVariants();
    expect(classes).toContain('focus-within:border-brand-500');
    expect(classes).not.toContain('border-danger-500');
    expect(classes).not.toContain('opacity-(--opacity-disabled)');
  });

  it('invalid overrides the border/focus-within color to danger, but the brand focus class is still present (invalid wins by CSS order, same structure as inputTextVariants)', () => {
    const classes = inputChipsWrapperVariants({ invalid: true });
    expect(classes).toContain('border-danger-500');
    expect(classes).toContain('focus-within:border-danger-500');
    expect(classes).toContain('focus-within:border-brand-500');
  });

  it('disabled dims the wrapper and blocks pointer events, since a <div> has no native :disabled to hook', () => {
    const classes = inputChipsWrapperVariants({ disabled: true });
    expect(classes).toContain('pointer-events-none');
    expect(classes).toContain('opacity-(--opacity-disabled)');
  });
});
