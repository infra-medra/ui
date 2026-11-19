import { cva, type VariantProps } from 'class-variance-authority';

export type StepState = 'completed' | 'active' | 'upcoming';

/** The numbered circle for one step — shared with Stepper, which reuses `<med-steps>` unchanged for its own header row instead of a second parallel step-indicator. */
export const stepCircleVariants = cva(
  ['flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors duration-(--transition-duration-base)'],
  {
    variants: {
      state: {
        completed: 'border-brand-500 bg-brand-500 text-white dark:border-brand-400 dark:bg-brand-400',
        active: 'border-brand-500 bg-surface-0 text-brand-600 dark:border-brand-400 dark:bg-surface-900 dark:text-brand-400',
        upcoming: 'border-surface-300 bg-surface-0 text-surface-500 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-400',
      },
    },
    defaultVariants: { state: 'upcoming' },
  },
);

export type StepCircleVariantProps = VariantProps<typeof stepCircleVariants>;

export const CONNECTOR_CLASS: Record<'complete' | 'incomplete', string> = {
  complete: 'bg-brand-500 dark:bg-brand-400',
  incomplete: 'bg-surface-300 dark:bg-surface-600',
};
