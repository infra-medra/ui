import { cva, type VariantProps } from 'class-variance-authority';
import { InputTextSize } from '../input-text/input-text.styles';

export type InputNumberButtonLayout = 'stacked' | 'horizontal' | 'vertical';

/**
 * `horizontal` buttons sit flush against the field's left/right edge as
 * full-height siblings (own border, inner corner squared off via
 * `compoundVariants` below). `stacked` buttons instead overlay the field's
 * right edge as half-height rows — see `INPUT_NUMBER_STACKED_TRAILING_PADDING_REM`
 * for the padding reserved on the input to keep typed text clear of them.
 * `vertical` stacks full-width siblings instead — increment
 * above the field, decrement below — closer to `horizontal`'s "real sibling
 * buttons, not an overlay" shape than to `stacked`'s.
 */
export const stepButtonVariants = cva(
  [
    'flex items-center justify-center text-surface-500 dark:text-surface-400',
    'transition-colors duration-(--transition-duration-base)',
    'hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-surface-700 dark:hover:text-surface-200',
    'focus:outline-none focus:z-10 focus:ring-(--focus-ring-width) focus:ring-brand-500',
    'disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled) disabled:hover:bg-transparent',
  ],
  {
    variants: {
      layout: {
        stacked: 'flex-1 px-1',
        horizontal: 'w-9 shrink-0 border border-surface-300 bg-surface-0 dark:border-surface-600 dark:bg-surface-900',
        vertical: 'h-8 w-full shrink-0 border border-surface-300 bg-surface-0 dark:border-surface-600 dark:bg-surface-900',
      },
      position: {
        leading: '',
        trailing: '',
      },
    },
    compoundVariants: [
      { layout: 'horizontal', position: 'leading', class: 'rounded-l-md rounded-r-none border-r-0' },
      { layout: 'horizontal', position: 'trailing', class: 'rounded-r-md rounded-l-none border-l-0' },
      { layout: 'vertical', position: 'leading', class: 'rounded-t-md rounded-b-none border-b-0' },
      { layout: 'vertical', position: 'trailing', class: 'rounded-b-md rounded-t-none border-t-0' },
    ],
    defaultVariants: {
      layout: 'stacked',
      position: 'trailing',
    },
  },
);

export type StepButtonVariantProps = VariantProps<typeof stepButtonVariants>;

/** Space reserved on the input for the overlaid `stacked` button column — same rationale as DatePicker's own trailing-padding constant. */
export const INPUT_NUMBER_STACKED_TRAILING_PADDING_REM: Record<InputTextSize, string> = {
  sm: '1.75rem',
  default: '2rem',
  lg: '2.25rem',
};
