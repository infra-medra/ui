import { cva, type VariantProps } from 'class-variance-authority';

export type RadioButtonSize = 'sm' | 'default' | 'lg';

export const DOT_SIZE_CLASS: Record<RadioButtonSize, string> = {
  sm: 'size-1.5',
  default: 'size-2',
  lg: 'size-2.5',
};

/**
 * Classes for the decorative ring (a sibling of the real, visually-hidden
 * native `<input type="radio">`, styled via `peer-*` — same pattern as
 * Checkbox's box, see checkbox.styles.ts).
 */
export const radioRingVariants = cva(
  [
    'pointer-events-none inline-flex shrink-0 items-center justify-center',
    'rounded-full border-2 border-surface-300 bg-transparent',
    'transition-colors duration-(--transition-duration-base)',
    'peer-checked:border-brand-500 dark:border-surface-600 dark:peer-checked:border-brand-400',
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

export type RadioButtonVariantProps = VariantProps<typeof radioRingVariants>;
