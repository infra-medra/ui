import { sliderThumbVariants, trackBarVariants, trackFillVariants, trackWrapperVariants } from './slider.styles';

describe('trackWrapperVariants', () => {
  it.each([
    ['sm', 'py-2'],
    ['default', 'py-3'],
    ['lg', 'py-3.5'],
  ] as const)('size=%s sets padding %s', (size, expectedClass) => {
    expect(trackWrapperVariants({ size })).toContain(expectedClass);
  });

  it('disabled dims the wrapper and disables pointer events', () => {
    const classes = trackWrapperVariants({ disabled: true });
    expect(classes).toContain('pointer-events-none');
    expect(classes).toContain('opacity-(--opacity-disabled)');
  });

  it('enabled shows a pointer cursor', () => {
    expect(trackWrapperVariants({ disabled: false })).toContain('cursor-pointer');
  });
});

describe('trackBarVariants / trackFillVariants', () => {
  it.each([
    ['sm', 'h-1'],
    ['default', 'h-1.5'],
    ['lg', 'h-2'],
  ] as const)('size=%s sets thickness %s on both the bar and the fill', (size, expectedClass) => {
    expect(trackBarVariants({ size })).toContain(expectedClass);
    expect(trackFillVariants({ size })).toContain(expectedClass);
  });

  it('the fill uses the brand color by default and danger when invalid', () => {
    expect(trackFillVariants({ invalid: false })).toContain('bg-brand-500');
    expect(trackFillVariants({ invalid: true })).toContain('bg-danger-500');
  });
});

describe('sliderThumbVariants', () => {
  it.each([
    ['sm', 'size-4'],
    ['default', 'size-5'],
    ['lg', 'size-6'],
  ] as const)('size=%s sets thumb size %s (same scale as RadioButton)', (size, expectedClass) => {
    expect(sliderThumbVariants({ size })).toContain(expectedClass);
  });

  it('invalid overrides the border/focus-ring color to danger', () => {
    const classes = sliderThumbVariants({ invalid: true });
    expect(classes).toContain('border-danger-500');
    expect(classes).toContain('focus-visible:ring-danger-500');
  });
});
