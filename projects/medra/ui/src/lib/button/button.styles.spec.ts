import { buttonVariants } from './button.styles';

describe('buttonVariants', () => {
  it('applies filled/primary/default-size defaults with no arguments', () => {
    const classes = buttonVariants();

    expect(classes).toContain('bg-brand-500');
    expect(classes).toContain('text-white');
    expect(classes).toContain('px-4 py-2.5');
    expect(classes).toContain('focus-visible:ring-brand-500');
  });

  it.each([
    ['primary', 'bg-brand-500'],
    ['secondary', 'bg-surface-100'],
    ['info', 'bg-info-500'],
    ['success', 'bg-success-500'],
    ['warn', 'bg-warn-500'],
    ['help', 'bg-help-500'],
    ['danger', 'bg-danger-500'],
    ['contrast', 'bg-surface-950'],
  ] as const)('filled + severity=%s includes %s', (severity, expectedClass) => {
    expect(buttonVariants({ severity, variant: 'filled' })).toContain(expectedClass);
  });

  it('outlined variant uses a border and no solid background', () => {
    const classes = buttonVariants({ variant: 'outlined', severity: 'danger' });

    expect(classes).toContain('border');
    expect(classes).toContain('border-danger-500');
    expect(classes).toContain('text-danger-600');
    expect(classes).not.toContain('bg-danger-500');
  });

  it('text variant has no border and no solid background', () => {
    const classes = buttonVariants({ variant: 'text', severity: 'success' });

    expect(classes).toContain('text-success-600');
    expect(classes).not.toContain('border-success-500');
    expect(classes).not.toContain('bg-success-500');
  });

  it('link variant is underlined on hover and has no background or border', () => {
    const classes = buttonVariants({ variant: 'link', severity: 'info' });

    expect(classes).toContain('hover:underline');
    expect(classes).not.toContain('bg-info-500');
    expect(classes).not.toContain('border-info-500');
  });

  it('includes the severity focus ring color regardless of style variant', () => {
    expect(buttonVariants({ severity: 'help', variant: 'text' })).toContain('focus-visible:ring-help-500');
  });

  it.each([
    ['sm', 'px-3 py-1.5'],
    ['default', 'px-4 py-2.5'],
    ['lg', 'px-5 py-2.5'],
  ] as const)('size=%s sets padding %s', (size, expectedClass) => {
    expect(buttonVariants({ size })).toContain(expectedClass);
  });

  it('pill sets fully rounded corners', () => {
    expect(buttonVariants({ pill: true })).toContain('rounded-full');
  });

  it.each([
    ['sm', 'p-1.5'],
    ['default', 'p-2.5'],
    ['lg', 'p-2.5'],
  ] as const)('iconOnly + size=%s sets square padding %s', (size, expectedClass) => {
    const classes = buttonVariants({ iconOnly: true, size });
    expect(classes).toContain('aspect-square');
    expect(classes).toContain(expectedClass);
  });

  it('carries the shared disabled-state classes', () => {
    expect(buttonVariants()).toContain('disabled:pointer-events-none');
  });
});
