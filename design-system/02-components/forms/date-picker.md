## Component: DatePicker

### Description
`DatePickerComponent` (`med-date-picker`) is a real `<input role="combobox">` (like Autocomplete, not Select's `<div>`) so a date can be typed directly, paired with a calendar overlay (`DatePickerPanelComponent`) for visual picking. Unlike Autocomplete, the calendar panel takes real DOM focus once open — it's a composite grid widget (WAI-ARIA APG "Date Picker Dialog"), not a simple reactive list (`projects/medra/ui/src/lib/date-picker/date-picker.component.ts:16-21`). Implements `ControlValueAccessor`. `selectionMode` picks the value shape at runtime (`'single'` → `Date | null`, `'range'` → `DateRange`), not a generic type parameter (`date-picker.component.ts:30-36`, `projects/medra/ui/src/lib/date-picker/date-picker.types.ts:9-16`).

Range mode's input is `readOnly` (still focusable/keyboard-openable, just not free-typeable) — parsing a two-endpoint range from text reliably was judged materially harder than the single-date case (`date-picker.component.ts:33-36`).

### Variants
| Variant | When to use |
|---|---|
| `selectionMode="single"` (default) | Pick one date, typeable |
| `selectionMode="range"` | Pick a start/end range, input becomes read-only |
| `navigation="calendar"` (default) | Standard month grid with prev/next navigation |
| `navigation="drilldown"` | Year → month → day drill-down navigation; always renders a single month regardless of `numberOfMonths` |
| `size="sm" \| "default" \| "lg"` | Shared `InputTextSize` field-size scale |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `selectionMode` | `DatePickerSelectionMode` | `'single'` | `date-picker.component.ts:107` |
| `navigation` | `'calendar' \| 'drilldown'` | `'calendar'` | `date-picker.component.ts:108` |
| `dateFormat` | `string` | `'mm/dd/yyyy'` | Governs typed/displayed value formatting only — `date-picker.component.ts:109` |
| `locale` | `string` | `'en-US'` | Drives `Intl`-based month/weekday names in the calendar chrome only — `date-picker.component.ts:110` |
| `firstDayOfWeek` | `number` | `0` | `date-picker.component.ts:111` |
| `rangeSeparator` | `string` | `' - '` | `date-picker.component.ts:112` |
| `minDate` / `maxDate` | `Date \| null` | `null` | `date-picker.component.ts:113-114` |
| `disabledDates` | `readonly Date[]` | `[]` | Specific unselectable dates — `date-picker.component.ts:116` |
| `disabledDays` | `readonly number[]` | `[]` | Weekday indices (0=Sun..6=Sat) unselectable, e.g. `[0,6]` for weekends — `date-picker.component.ts:118` |
| `size` | `InputTextSize` | `'default'` | `date-picker.component.ts:119` |
| `invalid` | `boolean` | `false` | `date-picker.component.ts:120` |
| `disabled` | `boolean` | `false` | `date-picker.component.ts:121` |
| `showClear` | `boolean` | `false` | `date-picker.component.ts:122` |
| `placeholder` | `string \| null` | `null` (falls back to a format-derived hint) | `date-picker.component.ts:124` |
| `numberOfMonths` | `number \| null` | `null` (2 for range, 1 for single; ignored in drilldown) | `date-picker.component.ts:135` |
| `class` | `string` | `''` | `date-picker.component.ts:137` |
| Various labels (`clearLabel`, `toggleLabel`, `previousMonthLabel`, `nextMonthLabel`, `startDateLabel`, `endDateLabel`, `yearFilterPlaceholder`, `emptyLabel`) | `string` | English defaults | `date-picker.component.ts:126-133` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | `inputTextVariants` default field styling | — |
| Hover | Shared `inputTextVariants` hover border | |
| Focus | Field focus ring; typed input parses live and commits once it resolves to a valid, in-bounds date (`date-picker.component.ts:197-206`) | ArrowDown opens the calendar; Enter (single mode) reformats from the last committed value; Escape closes — `date-picker.component.ts:208-231` |
| Active | Trigger shows `displayText()` (typed text while editing, else formatted committed value) — `date-picker.component.ts:186-195` | |
| Disabled | `[disabled]` on the native input | |
| Loading | Not implemented | |
| Error | `aria-invalid="true"`, danger border/ring (shared `inputTextVariants`) — `date-picker.component.ts:67` | |
| Open/Closed | `aria-expanded` reflects `isOpen()`, `aria-haspopup="grid"` — `date-picker.component.ts:64-65` | Calendar panel takes real DOM focus once open (composite grid widget, unlike Autocomplete) |

On blur (or Enter, single mode), the displayed text is reformatted from the last *committed* value, silently reverting any leftover unparseable/out-of-range text (`date-picker.component.ts:41-42`).

### Accessibility
- **Role/ARIA:** Input: `role="combobox"`, `aria-haspopup="grid"`, `aria-expanded`, `aria-controls`, `aria-invalid` (`date-picker.component.ts:61-67`). Panel: `role="grid"` for month day-grids, `role="gridcell"` per day with `aria-selected`/`aria-current`/`aria-disabled`, `role="listbox"`/`role="option"` for the drilldown year picker (`projects/medra/ui/src/lib/date-picker/date-picker-panel.component.ts:106-259`).
- **Keyboard navigation:** Extensively spec-verified at the panel level: `ArrowRight` moves the active-descendant by one day (`date-picker-panel.component.spec.ts:84-88`); `Home`/`End` jump to the start/end of the focused week (`:90-96`); `PageDown` steps one month, clamping day-of-month for shorter months (`:98-102`); `Shift+PageDown` steps one year (`:104-108`); `Enter` selects the focused day (`:120-126`) and is correctly a no-op on a disabled day (`:184-190 — 'Enter does nothing when the focused day is disabled via disabledDays'`); `ArrowRight` transparently skips over `disabledDates`/`disabledDays` entries, including consecutive disabled weekend days (`:172-182`); `PageUp`/`PageDown`/`Shift+Page*` are correctly no-ops in drilldown day view (`:110-118`). At the trigger level, `ArrowDown` opens the panel **and moves real DOM focus into it** — spec-verified: `date-picker.component.spec.ts:176-182 — 'ArrowDown opens the calendar panel and moves real focus into it'` (`document.activeElement` is asserted to equal the panel container), confirming the doc's claim that this is a real focus-taking composite widget, unlike Autocomplete. `Escape` closes the panel without altering the committed value, both at the trigger (`date-picker.component.spec.ts:184-195`) and panel level, where it's confirmed to emit `closeRequested` only, never a selection (`date-picker-panel.component.spec.ts:236-245 — 'Escape emits closeRequested only, never a selection'`).
- **Focus return on close:** the `showClear` clear button, after clearing the value and closing, moves focus back onto the trigger input — spec-verified: `date-picker.component.spec.ts:250-266 — 'clears the value, empties the text, and refocuses the input'` (asserts `document.activeElement === trigger`). No equivalent assertion exists for the Escape-close or day-selection-close paths — `[not covered by tests]` whether focus returns to the trigger after those specific close routes (plausible given real DOM focus was on the panel, but unverified).
- **Coverage gap — outside-click dismissal:** neither `date-picker.component.spec.ts` nor `date-picker-panel.component.spec.ts` simulates a click outside the trigger/panel; every close path exercised is Escape, a completed selection, or component destruction (`date-picker.component.spec.ts:333-341`). Outside-click dismissal is `[not covered by tests]`.
- **Disabled/range-mode input semantics:** a disabled DatePicker has a real `:disabled` input and ignores `ArrowDown` — `date-picker.component.spec.ts:276-285`. Range mode's input is confirmed `readOnly` (not `disabled`) and a plain click still opens the panel — `:294-307 — 'is readOnly, not disabled, and a plain click opens the panel'`; single mode's plain click deliberately does *not* open the panel, leaving the caret free for editing — `:310-315`.
- **Screen reader:** `aria-activedescendant` on the focused grid/listbox tracks the active cell/option (activedescendant pattern, not real per-cell focus) — `date-picker-panel.component.ts:58-59,146,235`, exercised throughout the keyboard-nav tests above via `aria-activedescendant` assertions. Prev/next-month buttons carry `aria-label` (`previousMonthLabel`/`nextMonthLabel`) and are correctly disabled once the adjacent month is wholly out of `[minDate, maxDate]` bounds — `date-picker-panel.component.spec.ts:142-151`.
- **A11y verdict:** Covered — grid keyboard navigation (arrow/Home/End/PageUp/PageDown incl. year-stepping and disabled-day skipping), Escape-without-mutation, real focus transfer into the panel on open, and focus return to the trigger via Clear are all directly spec-verified; the only gap is the absence of an outside-click-dismissal test and of an explicit focus-return assertion for the Escape/selection close paths specifically.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `dateFormat` and `locale` independently — they govern different things (typed value format vs. calendar chrome names) | Don't expect range mode to be free-typeable — the input is `readOnly` in `selectionMode="range"` (spec-confirmed: not `disabled`, still click-openable) |
| Use `disabledDates`/`disabledDays` to enforce business-rule exclusions (e.g. weekends) — arrow-key navigation transparently skips them | Don't assume a typed partial/invalid date is ever committed — only a fully valid, in-bounds date updates the value |
| Trust that `Escape` never mutates the committed value, at both the trigger and panel level (spec-verified) | Don't assume outside-click dismissal is regression-tested — only Escape, selection, and destroy are covered as close paths |
| Rely on `showClear`'s clear button returning focus to the input (spec-verified) | Don't assume the same focus-return guarantee holds after Escape or a day selection — those paths aren't separately asserted |

### Code example (Angular)
```html
<med-date-picker showClear [(ngModel)]="datePickerDemoValue" name="demo-date-picker" />

<med-date-picker selectionMode="range" showClear [(ngModel)]="datePickerRangeDemoValue" name="demo-date-picker-range" />
```
Source: `projects/showcase/src/app/app.html:531-535`

### Source
- `projects/medra/ui/src/lib/date-picker/date-picker.component.ts`
- `projects/medra/ui/src/lib/date-picker/date-picker-panel.component.ts`
- `projects/medra/ui/src/lib/date-picker/date-picker.styles.ts`
- `projects/medra/ui/src/lib/date-picker/date-picker.types.ts`
- `projects/medra/ui/src/lib/date-picker/date-format.ts`
