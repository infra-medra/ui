import { cva, type VariantProps } from 'class-variance-authority';
import { SOLID_SEVERITY_TEXT } from '../button/button.styles';

export type RatingSize = 'sm' | 'default' | 'lg';

/**
 * Per-star hit target. Padding (not the icon itself) is what gets each size
 * close to the ~44px touch-target guideline without inflating the star into
 * an oversized icon — `sm` stays an intentionally compact, dense-UI variant,
 * same trade-off already made for Button's `sm` (see button.styles.ts).
 */
export const starButtonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-sm',
    'transition-colors duration-(--transition-duration-base)',
    'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-warn-500 dark:focus-visible:ring-warn-400',
    'disabled:pointer-events-none disabled:opacity-(--opacity-disabled)',
  ],
  {
    variants: {
      size: {
        sm: 'p-0.5',
        default: 'p-1.5',
        lg: 'p-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type RatingVariantProps = VariantProps<typeof starButtonVariants>;

export const STAR_ICON_SIZE_CLASS: Record<RatingSize, string> = {
  sm: 'size-4',
  default: 'size-6',
  lg: 'size-8',
};

/** Reuses Button's shared warn/amber token instead of a parallel color (same reuse already done for Tag/Badge). */
export const ACTIVE_STAR_CLASS = SOLID_SEVERITY_TEXT.warn;
export const INACTIVE_STAR_CLASS = 'text-surface-300 dark:text-surface-600';
