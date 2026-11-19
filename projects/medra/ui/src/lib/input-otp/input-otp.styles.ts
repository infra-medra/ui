import { cva, type VariantProps } from 'class-variance-authority';

export type InputOtpSize = 'sm' | 'default' | 'lg';

/** One single-character box — same base look as `inputTextVariants` (shared border/focus tokens) but centered text and a fixed, not full, width, since each box holds exactly one character. */
export const otpBoxVariants = cva(
  [
    'appearance-none rounded-md border bg-surface-0 text-center font-medium text-surface-900',
    'border-surface-300 dark:bg-surface-900 dark:text-surface-50 dark:border-surface-600',
    'transition-colors duration-(--transition-duration-base)',
    'hover:border-surface-400 dark:hover:border-surface-500',
    'focus:outline-none focus:border-brand-500 focus:ring-(--focus-ring-width) focus:ring-brand-500',
    'disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled) disabled:bg-surface-50 dark:disabled:bg-surface-800',
  ],
  {
    variants: {
      size: {
        sm: 'size-9 rounded-sm text-(length:--text-field-sm)',
        default: 'size-11 text-(length:--text-field-base)',
        lg: 'size-14 rounded-lg text-(length:--text-field-lg)',
      },
      invalid: {
        true: 'border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-400',
        false: '',
      },
    },
    defaultVariants: { size: 'default', invalid: false },
  },
);

export type OtpBoxVariantProps = VariantProps<typeof otpBoxVariants>;
