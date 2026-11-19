import { cva, type VariantProps } from 'class-variance-authority';
import { InputTextSize } from '../input-text/input-text.styles';

/** Space reserved on the input for the overlaid mask-toggle button — same rationale as DatePicker's own trailing-padding constant. */
export const PASSWORD_TOGGLE_TRAILING_PADDING_REM: Record<InputTextSize, string> = {
  sm: '2rem',
  default: '2.25rem',
  lg: '2.5rem',
};

/** Space reserved when `showClear` is on but `toggleMask` isn't — a single icon button, same footprint as the mask toggle above. */
export const PASSWORD_CLEAR_TRAILING_PADDING_REM: Record<InputTextSize, string> = {
  sm: '2rem',
  default: '2.25rem',
  lg: '2.5rem',
};

/** Space reserved when both `showClear` and `toggleMask` are on — same combined widths as DatePicker's clear+toggle pair. */
export const PASSWORD_CLEAR_AND_TOGGLE_TRAILING_PADDING_REM: Record<InputTextSize, string> = {
  sm: '3.25rem',
  default: '3.75rem',
  lg: '4.25rem',
};

/**
 * One segment of the 3-bar strength meter in `PasswordFeedbackPanelComponent`.
 * `active` alone (no color) is a neutral "not reached yet" segment — color
 * only appears once a segment is actually lit, keyed off `strength` so a
 * `weak` result colors just its first segment red while `strong` colors
 * all three green, rather than every lit segment always taking the same
 * "final" color regardless of how many are lit.
 */
export const strengthSegmentVariants = cva(['h-1 flex-1 rounded-full transition-colors duration-(--transition-duration-base)'], {
  variants: {
    active: {
      true: '',
      false: 'bg-surface-200 dark:bg-surface-700',
    },
    strength: {
      weak: 'bg-danger-500',
      medium: 'bg-warn-500',
      strong: 'bg-success-500',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export type StrengthSegmentVariantProps = VariantProps<typeof strengthSegmentVariants>;
