import { cva, type VariantProps } from 'class-variance-authority';

export type InputChipsSize = 'sm' | 'default' | 'lg';

/**
 * The wrapper, not a native `<input>` (unlike `inputTextVariants`) — the
 * real `<input>` living inside it is unstyled (`border-0 bg-transparent`,
 * see the component template) and just flows alongside the chips, so focus
 * state is driven by `:focus-within` on this element instead of `:focus` on
 * itself. Same shared form-field tokens as `inputTextVariants`
 * (`--spacing-field-*`, `--text-field-*`) for visual consistency with every
 * other field in the lib, but a separate CVA rather than a literal reuse of
 * `inputTextVariants` — the DOM shape genuinely differs (a wrapper holding
 * multiple children vs. the styled element being the focusable input
 * itself), same reasoning ToggleSwitch's track/thumb are their own CVAs
 * rather than reusing Checkbox's despite the shared `peer-*` pattern.
 */
export const inputChipsWrapperVariants = cva(
  [
    'flex w-full flex-wrap items-center gap-1.5 rounded-md border bg-surface-0',
    'border-surface-300 dark:border-surface-600 dark:bg-surface-900',
    'transition-colors duration-(--transition-duration-base)',
    'hover:border-surface-400 dark:hover:border-surface-500',
    'focus-within:border-brand-500 focus-within:ring-(--focus-ring-width) focus-within:ring-brand-500',
  ],
  {
    variants: {
      size: {
        sm: 'px-(--spacing-field-sm-x) py-1 text-(length:--text-field-sm) rounded-sm',
        default: 'px-(--spacing-field-x) py-1.5 text-(length:--text-field-base) rounded-md',
        lg: 'px-(--spacing-field-lg-x) py-2 text-(length:--text-field-lg) rounded-lg',
      },
      // Layered on top of the unconditional focus-within:border-brand-500 above
      // (same structure inputTextVariants uses for its own focus/invalid
      // combo) — invalid's danger border needs to win over the brand one
      // both at rest and while focused.
      invalid: {
        true: 'border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500 dark:border-danger-400',
        false: '',
      },
      // The wrapper `<div>` has no `:disabled` pseudo-class of its own to hook
      // (unlike inputTextVariants, styling a real `<input>` directly) — the
      // inner input being disabled is what this variant, driven by the
      // component's own `isDisabled()`, stands in for.
      disabled: {
        true: 'pointer-events-none bg-surface-50 opacity-(--opacity-disabled) dark:bg-surface-800',
        false: '',
      },
    },
    defaultVariants: { size: 'default', invalid: false, disabled: false },
  },
);

export type InputChipsVariantProps = VariantProps<typeof inputChipsWrapperVariants>;
