import { cva, type VariantProps } from 'class-variance-authority';

export type SliderSize = 'sm' | 'default' | 'lg';

/**
 * Wrapper around the thin visual track. The extra vertical padding (not
 * the bar itself) is what gets the hit area close to the ~44px touch
 * target guideline without inflating the bar into a fat, ugly track —
 * `sm` stays an intentionally compact, dense-UI variant, same trade-off
 * already made for Button's `sm` (see button.styles.ts) and Rating's `sm`
 * (see rating.styles.ts).
 */
export const trackWrapperVariants = cva(['relative flex w-full items-center touch-none select-none'], {
  variants: {
    size: {
      sm: 'py-2',
      default: 'py-3',
      lg: 'py-3.5',
    },
    disabled: {
      true: 'pointer-events-none opacity-(--opacity-disabled)',
      false: 'cursor-pointer',
    },
  },
  defaultVariants: {
    size: 'default',
    disabled: false,
  },
});

export type TrackWrapperVariantProps = VariantProps<typeof trackWrapperVariants>;

export const trackBarVariants = cva(['pointer-events-none w-full rounded-full bg-surface-200 dark:bg-surface-700'], {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-1.5',
      lg: 'h-2',
    },
  },
  defaultVariants: { size: 'default' },
});

/** The highlighted portion of the track (0..value in single mode, start..end in range mode). */
export const trackFillVariants = cva(['pointer-events-none absolute rounded-full bg-brand-500 dark:bg-brand-400'], {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-1.5',
      lg: 'h-2',
    },
    invalid: {
      true: 'bg-danger-500 dark:bg-danger-400',
      false: '',
    },
  },
  defaultVariants: { size: 'default', invalid: false },
});

/** Same ring sizes already used for RadioButton's decorative ring (radio-button.styles.ts), reused for scale consistency. */
export const sliderThumbVariants = cva(
  [
    'absolute top-1/2 rounded-full border-2 border-brand-500 bg-white shadow-overlay-sm',
    'transition-transform duration-(--transition-duration-base)',
    'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500',
    'dark:border-brand-400 dark:bg-surface-900 dark:focus-visible:ring-brand-400',
  ],
  {
    variants: {
      size: {
        sm: 'size-4',
        default: 'size-5',
        lg: 'size-6',
      },
      invalid: {
        true: 'border-danger-500 focus-visible:ring-danger-500 dark:border-danger-400 dark:focus-visible:ring-danger-400',
        false: '',
      },
    },
    defaultVariants: { size: 'default', invalid: false },
  },
);

export type SliderThumbVariantProps = VariantProps<typeof sliderThumbVariants>;
