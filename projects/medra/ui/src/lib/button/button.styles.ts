import { cva, type VariantProps } from 'class-variance-authority';

export type ButtonSeverity =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warn'
  | 'help'
  | 'danger'
  | 'contrast';

export type ButtonStyleVariant = 'filled' | 'outlined' | 'text' | 'link';

export type ButtonSize = 'sm' | 'default' | 'lg';

/**
 * Color classes per severity x style variant. Written out as full literal
 * strings (not built via template-literal interpolation) because Tailwind's
 * scanner only picks up utility classes it can find as literal text in the
 * source — interpolated class names like `bg-${token}-500` are invisible to it.
 */
export const FILLED_SEVERITY_CLASSES: Record<ButtonSeverity, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 dark:active:bg-brand-400',
  secondary: 'bg-surface-100 text-surface-900 hover:bg-surface-200 active:bg-surface-300 dark:bg-surface-800 dark:text-surface-50 dark:hover:bg-surface-700 dark:active:bg-surface-600',
  info: 'bg-info-500 text-white hover:bg-info-600 active:bg-info-700 dark:bg-info-600 dark:hover:bg-info-500 dark:active:bg-info-400',
  success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 dark:bg-success-600 dark:hover:bg-success-500 dark:active:bg-success-400',
  warn: 'bg-warn-500 text-white hover:bg-warn-600 active:bg-warn-700 dark:bg-warn-600 dark:hover:bg-warn-500 dark:active:bg-warn-400',
  help: 'bg-help-500 text-white hover:bg-help-600 active:bg-help-700 dark:bg-help-600 dark:hover:bg-help-500 dark:active:bg-help-400',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 dark:bg-danger-600 dark:hover:bg-danger-500 dark:active:bg-danger-400',
  contrast: 'bg-surface-950 text-surface-0 hover:bg-surface-800 active:bg-surface-700 dark:bg-surface-0 dark:text-surface-950 dark:hover:bg-surface-100 dark:active:bg-surface-200',
};

const OUTLINED: Record<ButtonSeverity, string> = {
  primary: 'border border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100 dark:text-brand-400 dark:border-brand-400 dark:hover:bg-brand-950 dark:active:bg-brand-900',
  secondary: 'border border-surface-300 text-surface-900 hover:bg-surface-50 active:bg-surface-100 dark:border-surface-600 dark:text-surface-50 dark:hover:bg-surface-800 dark:active:bg-surface-700',
  info: 'border border-info-500 text-info-600 hover:bg-info-50 active:bg-info-100 dark:text-info-400 dark:border-info-400 dark:hover:bg-info-950 dark:active:bg-info-900',
  success: 'border border-success-500 text-success-600 hover:bg-success-50 active:bg-success-100 dark:text-success-400 dark:border-success-400 dark:hover:bg-success-950 dark:active:bg-success-900',
  warn: 'border border-warn-500 text-warn-600 hover:bg-warn-50 active:bg-warn-100 dark:text-warn-400 dark:border-warn-400 dark:hover:bg-warn-950 dark:active:bg-warn-900',
  help: 'border border-help-500 text-help-600 hover:bg-help-50 active:bg-help-100 dark:text-help-400 dark:border-help-400 dark:hover:bg-help-950 dark:active:bg-help-900',
  danger: 'border border-danger-500 text-danger-600 hover:bg-danger-50 active:bg-danger-100 dark:text-danger-400 dark:border-danger-400 dark:hover:bg-danger-950 dark:active:bg-danger-900',
  contrast: 'border border-surface-950 text-surface-950 hover:bg-surface-100 active:bg-surface-200 dark:border-surface-0 dark:text-surface-0 dark:hover:bg-surface-900 dark:active:bg-surface-800',
};

const TEXT: Record<ButtonSeverity, string> = {
  primary: 'text-brand-600 hover:bg-brand-50 active:bg-brand-100 dark:text-brand-400 dark:hover:bg-brand-950 dark:active:bg-brand-900',
  secondary: 'text-surface-900 hover:bg-surface-100 active:bg-surface-200 dark:text-surface-50 dark:hover:bg-surface-800 dark:active:bg-surface-700',
  info: 'text-info-600 hover:bg-info-50 active:bg-info-100 dark:text-info-400 dark:hover:bg-info-950 dark:active:bg-info-900',
  success: 'text-success-600 hover:bg-success-50 active:bg-success-100 dark:text-success-400 dark:hover:bg-success-950 dark:active:bg-success-900',
  warn: 'text-warn-600 hover:bg-warn-50 active:bg-warn-100 dark:text-warn-400 dark:hover:bg-warn-950 dark:active:bg-warn-900',
  help: 'text-help-600 hover:bg-help-50 active:bg-help-100 dark:text-help-400 dark:hover:bg-help-950 dark:active:bg-help-900',
  danger: 'text-danger-600 hover:bg-danger-50 active:bg-danger-100 dark:text-danger-400 dark:hover:bg-danger-950 dark:active:bg-danger-900',
  contrast: 'text-surface-950 hover:bg-surface-100 active:bg-surface-200 dark:text-surface-0 dark:hover:bg-surface-900 dark:active:bg-surface-800',
};

const LINK: Record<ButtonSeverity, string> = {
  primary: 'text-brand-600 underline-offset-4 hover:underline dark:text-brand-400',
  secondary: 'text-surface-900 underline-offset-4 hover:underline dark:text-surface-50',
  info: 'text-info-600 underline-offset-4 hover:underline dark:text-info-400',
  success: 'text-success-600 underline-offset-4 hover:underline dark:text-success-400',
  warn: 'text-warn-600 underline-offset-4 hover:underline dark:text-warn-400',
  help: 'text-help-600 underline-offset-4 hover:underline dark:text-help-400',
  danger: 'text-danger-600 underline-offset-4 hover:underline dark:text-danger-400',
  contrast: 'text-surface-950 underline-offset-4 hover:underline dark:text-surface-0',
};

/** Focus ring color per severity, applied regardless of style variant. */
const FOCUS_RING: Record<ButtonSeverity, string> = {
  primary: 'focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400',
  secondary: 'focus-visible:ring-surface-400 dark:focus-visible:ring-surface-500',
  info: 'focus-visible:ring-info-500 dark:focus-visible:ring-info-400',
  success: 'focus-visible:ring-success-500 dark:focus-visible:ring-success-400',
  warn: 'focus-visible:ring-warn-500 dark:focus-visible:ring-warn-400',
  help: 'focus-visible:ring-help-500 dark:focus-visible:ring-help-400',
  danger: 'focus-visible:ring-danger-500 dark:focus-visible:ring-danger-400',
  contrast: 'focus-visible:ring-surface-950 dark:focus-visible:ring-surface-0',
};

const COLOR_CLASSES_BY_VARIANT: Record<ButtonStyleVariant, Record<ButtonSeverity, string>> = {
  filled: FILLED_SEVERITY_CLASSES,
  outlined: OUTLINED,
  text: TEXT,
  link: LINK,
};

/**
 * Solid background only, no hover/active — for non-interactive
 * severity-colored elements that aren't buttons (ProgressBar's fill, etc.).
 * `FILLED_SEVERITY_CLASSES` above always includes hover/active states,
 * which don't apply (and would be dead CSS) on something nobody clicks.
 */
export const SOLID_SEVERITY_BG: Record<ButtonSeverity, string> = {
  primary: 'bg-brand-500 dark:bg-brand-400',
  secondary: 'bg-surface-500 dark:bg-surface-400',
  info: 'bg-info-500 dark:bg-info-400',
  success: 'bg-success-500 dark:bg-success-400',
  warn: 'bg-warn-500 dark:bg-warn-400',
  help: 'bg-help-500 dark:bg-help-400',
  danger: 'bg-danger-500 dark:bg-danger-400',
  contrast: 'bg-surface-950 dark:bg-surface-0',
};

/**
 * Solid text color only (drives `currentColor`, e.g. an SVG's `stroke`), no
 * hover/active — for non-interactive severity-colored elements
 * (ProgressSpinner's stroke, etc.).
 */
export const SOLID_SEVERITY_TEXT: Record<ButtonSeverity, string> = {
  primary: 'text-brand-500 dark:text-brand-400',
  secondary: 'text-surface-500 dark:text-surface-400',
  info: 'text-info-500 dark:text-info-400',
  success: 'text-success-500 dark:text-success-400',
  warn: 'text-warn-500 dark:text-warn-400',
  help: 'text-help-500 dark:text-help-400',
  danger: 'text-danger-500 dark:text-danger-400',
  contrast: 'text-surface-950 dark:text-surface-0',
};

/**
 * Shared danger-ring treatment for an invalid/error state on any button-family
 * control. Previously duplicated verbatim in ToggleButtonComponent and
 * SelectButtonComponent (each hand-rolling the same string on top of
 * `buttonVariants` since Button itself had no `invalid` input) — extracted
 * here so all three consume one definition.
 */
export const INVALID_RING_CLASS = 'ring-(--focus-ring-width) ring-danger-500 dark:ring-danger-400';

/**
 * `raised`: elevation on top of whatever severity/variant is already
 * set — same "extra class appended after the CVA output" treatment as `INVALID_RING_CLASS`.
 * Deliberately Tailwind's tighter `shadow`/`shadow-md` pair, not `shadow-md`/`shadow-lg`
 * (`--shadow-overlay-md`/`-lg` in `tailwind-theme-medraui.css`) — those two are tuned for
 * something floating meaningfully above the page (Dialog/Popover/Drawer), with enough
 * blur/spread to read as "hovering". A button that's merely a little raised off flat
 * siblings reads as a design mismatch with that much blur; caught via a user screenshot
 * comparison on 2026-09-09, not something a Jest test can tell you.
 */
export const RAISED_CLASS = 'shadow hover:shadow-md dark:shadow-black/40';

/**
 * `plain`: forces the neutral/gray treatment regardless of
 * `severity`, per style variant — reuses `secondary`'s own color classes
 * rather than a third palette, since "plain" and "secondary severity" are
 * visually the same idea (muted, no color association). Appended *after*
 * the CVA output in `hostClass()`, so `mergeClasses()` (tailwind-merge)
 * lets these win over whatever severity color was already set.
 */
export const PLAIN_CLASS: Record<ButtonStyleVariant, string> = {
  filled: `${FILLED_SEVERITY_CLASSES.secondary} ${FOCUS_RING.secondary}`,
  outlined: `${OUTLINED.secondary} ${FOCUS_RING.secondary}`,
  text: `${TEXT.secondary} ${FOCUS_RING.secondary}`,
  link: `${LINK.secondary} ${FOCUS_RING.secondary}`,
};

const SEVERITIES: ButtonSeverity[] = ['primary', 'secondary', 'info', 'success', 'warn', 'help', 'danger', 'contrast'];
const STYLE_VARIANTS: ButtonStyleVariant[] = ['filled', 'outlined', 'text', 'link'];

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium select-none whitespace-nowrap',
    'transition-colors duration-(--transition-duration-base)',
    'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset)',
    'disabled:pointer-events-none disabled:opacity-(--opacity-disabled)',
  ],
  {
    variants: {
      severity: Object.fromEntries(SEVERITIES.map((severity) => [severity, ''])) as Record<ButtonSeverity, string>,
      variant: Object.fromEntries(STYLE_VARIANTS.map((variant) => [variant, ''])) as Record<ButtonStyleVariant, string>,
      /*
       * `default` and `lg` land at/above the ~44px touch-target guideline
       * (roadmap/checklist-padrao-componente.md). `sm` is an intentionally compact,
       * dense-UI variant (toolbars, tables) and is not meant for primary
       * mobile touch targets.
       */
      size: {
        sm: 'text-sm px-3 py-1.5 rounded-sm',
        default: 'text-base px-4 py-2.5 rounded-md',
        lg: 'text-lg px-5 py-2.5 rounded-lg',
      },
      pill: {
        true: 'rounded-full',
        false: '',
      },
      iconOnly: {
        true: 'aspect-square justify-center',
        false: '',
      },
    },
    compoundVariants: [
      ...STYLE_VARIANTS.flatMap((variant) =>
        SEVERITIES.map((severity) => ({
          severity,
          variant,
          class: `${COLOR_CLASSES_BY_VARIANT[variant][severity]} ${FOCUS_RING[severity]}`,
        })),
      ),
      { iconOnly: true, size: 'sm' as const, class: 'p-1.5' },
      { iconOnly: true, size: 'default' as const, class: 'p-2.5' },
      { iconOnly: true, size: 'lg' as const, class: 'p-2.5' },
    ],
    defaultVariants: {
      severity: 'primary',
      variant: 'filled',
      size: 'default',
      pill: false,
      iconOnly: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
