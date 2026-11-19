import { CONNECTOR_CLASS, stepCircleVariants } from './steps.styles';

describe('stepCircleVariants', () => {
  it('completed: filled brand background', () => {
    expect(stepCircleVariants({ state: 'completed' })).toContain('bg-brand-500');
  });

  it('active: brand border, no fill', () => {
    const classes = stepCircleVariants({ state: 'active' });
    expect(classes).toContain('border-brand-500');
    expect(classes).not.toContain('bg-brand-500');
  });

  it('upcoming: neutral surface border', () => {
    expect(stepCircleVariants({ state: 'upcoming' })).toContain('border-surface-300');
  });
});

describe('CONNECTOR_CLASS', () => {
  it('has a complete and an incomplete tone', () => {
    expect(CONNECTOR_CLASS.complete).toContain('bg-brand-500');
    expect(CONNECTOR_CLASS.incomplete).toContain('bg-surface-300');
  });
});
