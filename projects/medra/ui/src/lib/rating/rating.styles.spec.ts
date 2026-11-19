import { ACTIVE_STAR_CLASS, INACTIVE_STAR_CLASS, STAR_ICON_SIZE_CLASS, starButtonVariants } from './rating.styles';

describe('starButtonVariants', () => {
  it('defaults to the default size padding', () => {
    expect(starButtonVariants()).toContain('p-1.5');
  });

  it.each([
    ['sm', 'p-0.5'],
    ['default', 'p-1.5'],
    ['lg', 'p-2'],
  ] as const)('size=%s sets padding %s', (size, expectedClass) => {
    expect(starButtonVariants({ size })).toContain(expectedClass);
  });

  it('includes a warn-colored focus ring, matching the active star color', () => {
    const classes = starButtonVariants();
    expect(classes).toContain('focus-visible:ring-warn-500');
    expect(classes).toContain('dark:focus-visible:ring-warn-400');
  });
});

describe('STAR_ICON_SIZE_CLASS', () => {
  it('has one entry per size', () => {
    expect(STAR_ICON_SIZE_CLASS).toEqual({ sm: 'size-4', default: 'size-6', lg: 'size-8' });
  });
});

describe('active/inactive star colors', () => {
  it('reuses the shared warn/amber token for the active state (no parallel color system)', () => {
    expect(ACTIVE_STAR_CLASS).toContain('text-warn-500');
    expect(ACTIVE_STAR_CLASS).toContain('dark:text-warn-400');
  });

  it('uses a neutral surface tone for the inactive state', () => {
    expect(INACTIVE_STAR_CLASS).toContain('text-surface-300');
    expect(INACTIVE_STAR_CLASS).toContain('dark:text-surface-600');
  });
});
