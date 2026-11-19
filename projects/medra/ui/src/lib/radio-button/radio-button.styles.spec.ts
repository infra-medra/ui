import { radioRingVariants } from './radio-button.styles';

describe('radioRingVariants', () => {
  it('defaults to the default size and no invalid state', () => {
    const classes = radioRingVariants();
    expect(classes).toContain('size-5');
    expect(classes).not.toContain('border-danger-500');
  });

  it.each([
    ['sm', 'size-4'],
    ['default', 'size-5'],
    ['lg', 'size-6'],
  ] as const)('size=%s sets ring size %s', (size, expectedClass) => {
    expect(radioRingVariants({ size })).toContain(expectedClass);
  });

  it('invalid overrides the border color', () => {
    expect(radioRingVariants({ invalid: true })).toContain('border-danger-500');
  });

  it('reacts to the peer input state, not its own prop', () => {
    const classes = radioRingVariants();
    expect(classes).toContain('peer-checked:border-brand-500');
    expect(classes).toContain('peer-focus-visible:ring-brand-500');
    expect(classes).toContain('peer-disabled:opacity-(--opacity-disabled)');
  });
});
