import { checkboxBoxVariants } from './checkbox.styles';

describe('checkboxBoxVariants', () => {
  it('defaults to the default size and no invalid state', () => {
    const classes = checkboxBoxVariants();

    expect(classes).toContain('size-5');
    expect(classes).toContain('peer-checked:bg-brand-500');
    expect(classes).not.toContain('border-danger-500');
  });

  it.each([
    ['sm', 'size-4'],
    ['default', 'size-5'],
    ['lg', 'size-6'],
  ] as const)('size=%s sets box size %s', (size, expectedClass) => {
    expect(checkboxBoxVariants({ size })).toContain(expectedClass);
  });

  it('invalid overrides the border color', () => {
    const classes = checkboxBoxVariants({ invalid: true });

    expect(classes).toContain('border-danger-500');
  });

  it('reacts to the peer input state via peer-* variants, not its own checked prop', () => {
    const classes = checkboxBoxVariants();

    expect(classes).toContain('peer-checked:border-brand-500');
    expect(classes).toContain('peer-indeterminate:bg-brand-500');
    expect(classes).toContain('peer-focus-visible:ring-brand-500');
    expect(classes).toContain('peer-disabled:opacity-(--opacity-disabled)');
  });
});
