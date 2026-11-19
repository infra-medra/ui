import { cva, type VariantProps } from 'class-variance-authority';

export type InputTextSize = 'sm' | 'default' | 'lg';
export type FieldVariant = 'outlined' | 'filled';

/**
 * Sizes consume the shared form-field tokens from tailwind-theme-medraui.css
 * (--spacing-field-*, --text-field-*) established in Phase 1 specifically for
 * this — every future form component (Select, InputNumber, etc.) reuses the
 * same padding/font-size scale for visual consistency across fields.
 */
export const inputTextVariants = cva(
  [
    // `appearance-none` matters even for a plain text input: without it,
    // some browsers (Chromium) paint a native "disabled control" tint over
    // an author-styled disabled input, ignoring our own disabled:bg-* class
    // visually even though the computed background-color is correct.
    'w-full appearance-none rounded-md border bg-surface-0 text-surface-900',
    'border-surface-300 placeholder:text-surface-400',
    'dark:bg-surface-900 dark:text-surface-50 dark:border-surface-600 dark:placeholder:text-surface-500',
    'transition-colors duration-(--transition-duration-base)',
    'hover:border-surface-400 dark:hover:border-surface-500',
    'focus:outline-none focus:border-brand-500 focus:ring-(--focus-ring-width) focus:ring-brand-500',
    'disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled) disabled:bg-surface-50 dark:disabled:bg-surface-800',
  ],
  {
    variants: {
      size: {
        sm: 'px-(--spacing-field-sm-x) py-(--spacing-field-sm-y) text-(length:--text-field-sm) rounded-sm',
        default: 'px-(--spacing-field-x) py-(--spacing-field-y) text-(length:--text-field-base) rounded-md',
        lg: 'px-(--spacing-field-lg-x) py-(--spacing-field-lg-y) text-(length:--text-field-lg) rounded-lg',
      },
      invalid: {
        true: 'border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-400',
        false: '',
      },
      variant: {
        outlined: '',
        filled: 'bg-surface-100 border-transparent dark:bg-surface-800',
      },
    },
    defaultVariants: {
      size: 'default',
      invalid: false,
      variant: 'outlined',
    },
  },
);

export type InputTextVariantProps = VariantProps<typeof inputTextVariants>;
