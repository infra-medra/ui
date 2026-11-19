import { cva, type VariantProps } from 'class-variance-authority';

export type CheckboxSize = 'sm' | 'default' | 'lg';

/**
 * Classes for the decorative box (a sibling of the real, visually-hidden
 * native `<input type="checkbox">`, styled via the `peer-*` variants so all
 * interaction state — hover/focus/disabled — comes from the real input,
 * never duplicated in component state).
 */
export const checkboxBoxVariants = cva(
  [
    'pointer-events-none inline-flex shrink-0 items-center justify-center',
    'rounded-sm border-2 border-surface-300 bg-transparent text-white',
    'transition-colors duration-(--transition-duration-base)',
    'peer-checked:border-brand-500 peer-checked:bg-brand-500',
    'peer-indeterminate:border-brand-500 peer-indeterminate:bg-brand-500',
    'dark:border-surface-600 dark:peer-checked:border-brand-400 dark:peer-checked:bg-brand-400',
    'dark:peer-indeterminate:border-brand-400 dark:peer-indeterminate:bg-brand-400',
    'peer-focus-visible:outline-none peer-focus-visible:ring-(--focus-ring-width) peer-focus-visible:ring-offset-(--focus-ring-offset) peer-focus-visible:ring-brand-500',
    'peer-disabled:opacity-(--opacity-disabled)',
  ],
  {
    variants: {
      size: {
        sm: 'size-4',
        default: 'size-5',
        lg: 'size-6',
      },
      invalid: {
        true: 'border-danger-500 dark:border-danger-400',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      invalid: false,
    },
  },
);

export type CheckboxVariantProps = VariantProps<typeof checkboxBoxVariants>;
