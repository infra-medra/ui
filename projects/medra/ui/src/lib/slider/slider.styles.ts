import { cva, type VariantProps } from 'class-variance-authority';

export type SliderSize = 'sm' | 'default' | 'lg';
export type SliderOrientation = 'horizontal' | 'vertical';

/** Size-dependent value per orientation, expanded into `compoundVariants` entries. */
function bySizeAndOrientation(values: Record<SliderOrientation, Record<SliderSize, string>>) {
  return (Object.keys(values) as SliderOrientation[]).flatMap((orientation) =>
    (Object.keys(values[orientation]) as SliderSize[]).map((size) => ({ orientation, size, class: values[orientation][size] })),
  );
}

const NO_SIZE_CLASS: Record<SliderSize, string> = { sm: '', default: '', lg: '' };

/**
 * Wrapper around the thin visual track. The extra vertical padding (not
 * the bar itself) is what gets the hit area close to the ~44px touch
 * target guideline without inflating the bar into a fat, ugly track —
 * `sm` stays an intentionally compact, dense-UI variant, same trade-off
 * already made for Button's `sm` (see button.styles.ts) and Rating's `sm`
 * (see rating.styles.ts).
 */
export const trackWrapperVariants = cva(['relative flex items-center touch-none select-none'], {
  variants: {
    size: NO_SIZE_CLASS,
    orientation: {
      horizontal: 'w-full',
      // A vertical slider has no natural height, so it gets a fixed default that the consumer `class` overrides.
      vertical: 'h-56 w-fit flex-col justify-center',
    },
    disabled: {
      true: 'pointer-events-none opacity-(--opacity-disabled)',
      false: 'cursor-pointer',
    },
  },
  compoundVariants: bySizeAndOrientation({
    horizontal: { sm: 'py-2', default: 'py-3', lg: 'py-3.5' },
    vertical: { sm: 'px-2', default: 'px-3', lg: 'px-3.5' },
  }),
  defaultVariants: {
    size: 'default',
    orientation: 'horizontal',
    disabled: false,
  },
});

export type TrackWrapperVariantProps = VariantProps<typeof trackWrapperVariants>;

export const trackBarVariants = cva(['pointer-events-none rounded-full bg-surface-200 dark:bg-surface-700'], {
  variants: {
    size: NO_SIZE_CLASS,
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full',
    },
  },
  compoundVariants: bySizeAndOrientation({
    horizontal: { sm: 'h-1', default: 'h-1.5', lg: 'h-2' },
    vertical: { sm: 'w-1', default: 'w-1.5', lg: 'w-2' },
  }),
  defaultVariants: { size: 'default', orientation: 'horizontal' },
});

/** The highlighted portion of the track (0..value in single mode, start..end in range mode). */
export const trackFillVariants = cva(['pointer-events-none absolute rounded-full bg-brand-500 dark:bg-brand-400'], {
  variants: {
    size: NO_SIZE_CLASS,
    orientation: {
      horizontal: '',
      vertical: '',
    },
    invalid: {
      true: 'bg-danger-500 dark:bg-danger-400',
      false: '',
    },
  },
  compoundVariants: bySizeAndOrientation({
    horizontal: { sm: 'h-1', default: 'h-1.5', lg: 'h-2' },
    vertical: { sm: 'w-1', default: 'w-1.5', lg: 'w-2' },
  }),
  defaultVariants: { size: 'default', orientation: 'horizontal', invalid: false },
});

/** Same ring sizes already used for RadioButton's decorative ring (radio-button.styles.ts), reused for scale consistency. */
export const sliderThumbVariants = cva(
  [
    'absolute rounded-full border-2 border-brand-500 bg-white shadow-overlay-sm',
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
      // The cross-axis centering; the position along the track is set inline (`left` or `bottom`).
      orientation: {
        horizontal: 'top-1/2',
        vertical: 'left-1/2',
      },
      invalid: {
        true: 'border-danger-500 focus-visible:ring-danger-500 dark:border-danger-400 dark:focus-visible:ring-danger-400',
        false: '',
      },
    },
    defaultVariants: { size: 'default', orientation: 'horizontal', invalid: false },
  },
);

export type SliderThumbVariantProps = VariantProps<typeof sliderThumbVariants>;
