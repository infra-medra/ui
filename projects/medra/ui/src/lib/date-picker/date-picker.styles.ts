import { cva, type VariantProps } from 'class-variance-authority';
import { InputTextSize } from '../input-text/input-text.styles';

/**
 * One day cell in the calendar grid. Like `SelectPanelComponent`'s options,
 * this follows the activedescendant pattern, not real roving `tabindex`:
 * DOM focus stays on the `role="grid"` container (a single `.focus()` call
 * per view, see `date-picker-panel.component.ts`), and `aria-activedescendant`
 * on that container points at the "virtually active" cell — so the `active`
 * variant below stands in for a focus ring (cells are never really
 * DOM-focused, so `focus-visible:` wouldn't fire on them).
 */
export const dayCellVariants = cva(
  ['flex size-9 items-center justify-center rounded-full text-sm text-surface-900 dark:text-surface-50', 'cursor-pointer select-none transition-colors duration-(--transition-duration-base)'],
  {
    variants: {
      // Ring geometry only, no color: the color depends on whether this cell
      // also has a solid fill (`selected`/`rangeStart`/`rangeEnd`) — see the
      // `compoundVariants` below. Putting a fixed color here would leave two
      // conflicting `ring-*` color utility classes in the output whenever
      // both applied (cva concatenates variant strings; it doesn't dedupe
      // conflicting Tailwind classes the way `mergeClasses()`/tailwind-merge
      // does — that's only run on the consumer-facing `class` escape hatch,
      // not on a component's own internal CVA output).
      active: {
        true: 'ring-(--focus-ring-width) ring-offset-(--focus-ring-offset)',
        false: '',
      },
      today: {
        true: 'font-semibold ring-1 ring-inset ring-brand-400 dark:ring-brand-300',
        false: '',
      },
      // Hover deliberately left out of all four of these (handled centrally
      // in `compoundVariants` below): a cell with any kind of fill needs its
      // *own* fill color re-asserted on hover (otherwise the plain unfilled
      // cell's default gray hover — the only one a plain per-axis `false`
      // branch could express — visually wins while the pointer rests on it,
      // since both are real, simultaneously-present classes and nothing
      // dedupes them here, see the `active` ring-color comment above).
      selected: {
        true: 'bg-brand-600 text-white',
        false: '',
      },
      inRange: {
        true: 'rounded-none bg-brand-50 dark:bg-brand-500/10',
        false: '',
      },
      rangeStart: {
        true: 'rounded-r-none bg-brand-600 text-white dark:bg-brand-500',
        false: '',
      },
      rangeEnd: {
        true: 'rounded-l-none bg-brand-600 text-white dark:bg-brand-500',
        false: '',
      },
      outsideMonth: {
        true: 'text-surface-400 dark:text-surface-500',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-(--opacity-disabled)',
        false: '',
      },
    },
    compoundVariants: [
      // Ring *color* for the `active` (activedescendant) indicator, split by
      // whether the cell also has a solid brand fill: plain brand ring on an
      // unfilled cell, white/inverted ring (with a matching offset color)
      // for contrast when it overlaps a filled background. Each `active`
      // cell matches exactly one of these four.
      { active: true, selected: false, rangeStart: false, rangeEnd: false, class: 'ring-brand-500' },
      { active: true, selected: true, class: 'ring-white ring-offset-brand-600 dark:ring-offset-brand-500' },
      { active: true, rangeStart: true, class: 'ring-white ring-offset-brand-600 dark:ring-offset-brand-500' },
      { active: true, rangeEnd: true, class: 'ring-white ring-offset-brand-600 dark:ring-offset-brand-500' },
      // Hover background, centralized (see the comment on `selected` above):
      // a completely unfilled cell gets the plain gray hover; anything with
      // a fill re-asserts its own fill color on hover instead of letting the
      // gray default win.
      { selected: false, rangeStart: false, rangeEnd: false, inRange: false, class: 'hover:bg-surface-100 dark:hover:bg-surface-700' },
      { selected: true, class: 'hover:bg-brand-600 dark:hover:bg-brand-500' },
      { rangeStart: true, class: 'hover:bg-brand-600 dark:hover:bg-brand-500' },
      { rangeEnd: true, class: 'hover:bg-brand-600 dark:hover:bg-brand-500' },
      { inRange: true, class: 'hover:bg-brand-50 dark:hover:bg-brand-500/10' },
    ],
    defaultVariants: {
      active: false,
      today: false,
      selected: false,
      inRange: false,
      rangeStart: false,
      rangeEnd: false,
      outsideMonth: false,
      disabled: false,
    },
  },
);

export type DayCellVariantProps = VariantProps<typeof dayCellVariants>;

/** One month cell in the drilldown mode's month grid (`view === 'month'`). Same activedescendant rationale as `dayCellVariants`. */
export const monthCellVariants = cva(
  ['flex h-12 items-center justify-center rounded-md text-sm text-surface-900 dark:text-surface-50', 'cursor-pointer select-none transition-colors duration-(--transition-duration-base)'],
  {
    variants: {
      active: {
        true: 'ring-(--focus-ring-width) ring-offset-(--focus-ring-offset) ring-brand-500',
        false: '',
      },
      current: {
        true: 'font-semibold ring-1 ring-inset ring-brand-400 dark:ring-brand-300',
        false: '',
      },
      selected: {
        true: 'bg-brand-600 text-white hover:bg-brand-600 dark:bg-brand-500',
        false: 'hover:bg-surface-100 dark:hover:bg-surface-700',
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-(--opacity-disabled)',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      current: false,
      selected: false,
      disabled: false,
    },
  },
);

export type MonthCellVariantProps = VariantProps<typeof monthCellVariants>;

/**
 * Extra `padding-inline-end` reserved for the trailing clear-button +
 * calendar-toggle slot — wider than Autocomplete's equivalent constant
 * since this component always has a second (calendar) icon, not just a
 * conditional clear button. See `autocomplete.component.ts` for the
 * rationale on using an inline style instead of a `pr-*` Tailwind class.
 */
export const DATE_PICKER_TRAILING_PADDING_REM: Record<InputTextSize, string> = {
  sm: '3.25rem',
  default: '3.75rem',
  lg: '4.25rem',
};
