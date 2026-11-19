import { cva, type VariantProps } from 'class-variance-authority';

export type ToggleSwitchSize = 'sm' | 'default' | 'lg';

/**
 * Decorative track (a sibling of the real, visually-hidden native
 * `<input type="checkbox" role="switch">`, styled via `peer-*` — same
 * "real input drives all interaction state" convention as Checkbox). Sized
 * via normal flow (not `absolute`), so it's what actually gives the
 * wrapping `<span class="relative">` its box — both the input and the
 * thumb are `absolute` and size/position themselves off of it.
 */
export const trackVariants = cva(
  [
    'pointer-events-none block rounded-full bg-surface-300 dark:bg-surface-600',
    'transition-colors duration-(--transition-duration-base)',
    'peer-checked:bg-brand-500 dark:peer-checked:bg-brand-400',
    'peer-focus-visible:outline-none peer-focus-visible:ring-(--focus-ring-width) peer-focus-visible:ring-offset-(--focus-ring-offset) peer-focus-visible:ring-brand-500',
    'peer-disabled:opacity-(--opacity-disabled)',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        default: 'h-5 w-9',
        lg: 'h-6 w-11',
      },
      invalid: {
        true: 'ring-2 ring-danger-500 dark:ring-danger-400',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      invalid: false,
    },
  },
);

export type TrackVariantProps = VariantProps<typeof trackVariants>;

/** Decorative thumb — same `peer-*`-driven convention, translated sideways on `peer-checked`. */
export const thumbVariants = cva(
  [
    'pointer-events-none absolute left-0.5 top-0.5 rounded-full bg-white shadow-overlay-sm',
    'transition-transform duration-(--transition-duration-base)',
  ],
  {
    variants: {
      size: {
        sm: 'size-3 peer-checked:translate-x-3',
        default: 'size-4 peer-checked:translate-x-4',
        lg: 'size-5 peer-checked:translate-x-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type ThumbVariantProps = VariantProps<typeof thumbVariants>;
