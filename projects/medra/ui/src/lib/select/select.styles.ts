import { cva, type VariantProps } from 'class-variance-authority';
import { InputTextSize } from '../input-text/input-text.styles';

export type SelectSize = InputTextSize;

/**
 * The trigger can't reuse `inputTextVariants` as-is (unlike Textarea):
 * it's a `role="combobox"` `<div>`, not a real form control, so there's no
 * `:disabled` pseudo-class to key off of — `aria-disabled` stands in for it
 * instead. Layout (flex/justify-between) and `focus-visible` (button-like,
 * not text-field-like) also differ from the plain field CVA. Sizing still
 * reuses the same `--spacing-field-*`/`--text-field-*` tokens for visual
 * consistency with InputText/Textarea.
 */
export const selectTriggerVariants = cva(
  [
    'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-surface-0 text-left text-surface-900',
    'border-surface-300 placeholder:text-surface-400',
    'dark:bg-surface-900 dark:text-surface-50 dark:border-surface-600',
    'transition-colors duration-(--transition-duration-base)',
    'hover:border-surface-400 dark:hover:border-surface-500',
    'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-(--opacity-disabled) aria-disabled:bg-surface-50 dark:aria-disabled:bg-surface-800',
  ],
  {
    variants: {
      size: {
        sm: 'px-(--spacing-field-sm-x) py-(--spacing-field-sm-y) text-(length:--text-field-sm) rounded-sm',
        default: 'px-(--spacing-field-x) py-(--spacing-field-y) text-(length:--text-field-base) rounded-md',
        lg: 'px-(--spacing-field-lg-x) py-(--spacing-field-lg-y) text-(length:--text-field-lg) rounded-lg',
      },
      invalid: {
        true: 'border-danger-500 focus-visible:ring-danger-500 dark:border-danger-400',
        false: '',
      },
      /** `outlined` (default) keeps the bordered look; `filled` uses the tinted background of `inputTextVariants`. */
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

export type SelectTriggerVariantProps = VariantProps<typeof selectTriggerVariants>;

/** One row inside the dropdown panel — shared by Select and MultiSelect. */
export const selectOptionVariants = cva(
  ['flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-surface-900 dark:text-surface-50'],
  {
    variants: {
      active: {
        true: 'bg-brand-50 dark:bg-brand-500/20',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-(--opacity-disabled)',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  },
);

export type SelectOptionVariantProps = VariantProps<typeof selectOptionVariants>;

/**
 * The decorative checkbox square in MultiSelect's option rows. Can't reuse
 * `checkboxBoxVariants` (Checkbox component): that one is driven by a real
 * `peer` sibling `<input>`'s `:checked` state, but here "checked" is just a
 * plain boolean the row already knows — there's no native input to pair it
 * with inside a `role="option"` row.
 */
export const selectCheckboxIndicatorVariants = cva(
  [
    'pointer-events-none inline-flex size-4 shrink-0 items-center justify-center rounded-sm border-2 text-white',
    'transition-colors duration-(--transition-duration-base)',
  ],
  {
    variants: {
      checked: {
        true: 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400',
        false: 'border-surface-300 bg-transparent dark:border-surface-600',
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);

export type SelectCheckboxIndicatorVariantProps = VariantProps<typeof selectCheckboxIndicatorVariants>;

/** Panel container classes, shared by Select and MultiSelect's `openConnected()` calls. */
export const SELECT_PANEL_CLASS = [
  'rounded-lg',
  'border',
  'border-surface-200',
  'bg-surface-0',
  'shadow-overlay-lg',
  'overflow-hidden',
  'dark:border-surface-700',
  'dark:bg-surface-800',
];
