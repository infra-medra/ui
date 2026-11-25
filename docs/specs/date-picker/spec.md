# Date Picker

**Capability:** `date-picker`
**ID prefix:** `DTP`
**Paths:** `projects/medra/ui/src/lib/date-picker/**`

## Purpose

Lets users enter or pick dates, ranges and multiple dates through a typeable input and a calendar panel. Covers formatting, locale, navigation styles, bounds, multi-month display, time, keyboard and form integration.

## Requirements

### REQ DTP-001: Single date selection

A `med-date-picker` in `selectionMode` `single` (default) SHALL show the committed date formatted by `dateFormat` in a typeable input, SHALL open its calendar panel with ArrowDown on the input or with the toggle button (label from `toggleLabel`), SHALL NOT open the panel on a plain click of the input, and SHALL commit the picked day and close the panel.

#### Scenario DTP-001.S1: Pick a day

- **Given** an open single-mode panel
- **When** the user clicks a day
- **Then** the value is committed, the input shows it and the panel closes

#### Scenario DTP-001.S2: Click on input

- **Given** a single-mode picker
- **When** the user clicks the input text
- **Then** the panel stays closed so the caret can be placed

#### Scenario DTP-001.S3: Empty value

- **Given** the form writes null
- **When** the picker renders
- **Then** the input is empty and not the text "null"

### REQ DTP-002: Date format and parsing

The picker SHALL format and parse dates with the numeric tokens `d`, `dd`, `m`, `mm`, `yy`, `yyyy` (default `mm/dd/yyyy`) with literal separators kept verbatim, SHALL pad only for the doubled tokens, SHALL read two-digit years below 50 as 20xx and 50 and above as 19xx, and SHALL reject impossible dates such as Feb 30 and Feb 29 on a non-leap year.

#### Scenario DTP-002.S1: Zero padding

- **Given** the format `mm/dd/yyyy`
- **When** March 5, 2024 is shown
- **Then** the text is 03/05/2024

#### Scenario DTP-002.S2: Rollover

- **Given** typed text 02/30/2024
- **When** it is parsed
- **Then** it is rejected as invalid

#### Scenario DTP-002.S3: Two-digit year

- **Given** the format `dd/mm/yy`
- **When** the text ends in 49 and in 50
- **Then** they parse as 2049 and 1950

### REQ DTP-003: Editable input commits

In single mode the input SHALL commit a valid typed date live to the form control, SHALL NOT commit unparseable text, a date outside `minDate`/`maxDate`, or a date that is disabled, SHALL revert the displayed text to the last committed value on blur in those cases, and SHALL reformat the text on Enter.

#### Scenario DTP-003.S1: Live commit

- **Given** an empty single-mode picker
- **When** the user types a valid date
- **Then** the form control receives the date without blur

#### Scenario DTP-003.S2: Invalid text

- **Given** the last committed value is a date
- **When** the user types garbage and leaves the field
- **Then** nothing is committed and the old text is restored

#### Scenario DTP-003.S3: Out of bounds

- **Given** `maxDate` is set
- **When** the user types a later date
- **Then** it is not committed

### REQ DTP-004: Placeholder

The picker SHALL derive its placeholder from `dateFormat` (for example `mm/dd/yyyy`, two-sided in range mode, `mm/yyyy` in month view) and SHALL use the `placeholder` input instead when provided.

#### Scenario DTP-004.S1: Derived

- **Given** no placeholder input
- **When** the picker renders empty
- **Then** the placeholder follows the format

#### Scenario DTP-004.S2: Override

- **Given** `placeholder` is set
- **When** the picker renders empty
- **Then** that text is shown

### REQ DTP-005: Range selection

With `selectionMode` `range`, the picker SHALL show a read-only input where a click opens the panel, SHALL take two clicks to pick start and end (swapping them when the second is earlier, one-day range allowed), SHALL display both dates joined by `rangeSeparator` (default " - ") and close once both are chosen, and SHALL show 2 months by default.

#### Scenario DTP-005.S1: Reversed clicks

- **Given** range mode
- **When** the user clicks the 20th and then the 10th
- **Then** the range runs from the 10th to the 20th and the panel closes

#### Scenario DTP-005.S2: Separator

- **Given** a custom `rangeSeparator`
- **When** a range is committed
- **Then** the text joins the two dates with it

### REQ DTP-006: Multiple dates selection

With `selectionMode` `multiple`, the picker SHALL keep the panel open as days are picked, SHALL add an unselected day and remove an already selected one, SHALL mark every chosen date as selected, and SHALL display the dates joined by `multipleSeparator` (default ", ").

#### Scenario DTP-006.S1: Toggle days

- **Given** multiple mode
- **When** the user clicks a day twice
- **Then** it is added and then removed and the panel stays open

#### Scenario DTP-006.S2: Clear

- **Given** several dates are chosen and `showClear` is on
- **When** the user clicks clear
- **Then** the array is empty

### REQ DTP-007: Calendar navigation

With `navigation` `calendar` (default) the panel SHALL open on a day grid of six weeks with weekday headers ordered from `firstDayOfWeek`, previous and next chevrons SHALL move by one month and SHALL be disabled when the adjacent month lies wholly outside the allowed range, and the header SHALL let the user step to month and year levels.

#### Scenario DTP-007.S1: First day

- **Given** `firstDayOfWeek` is 1
- **When** the grid renders
- **Then** the weekday header starts with Monday

#### Scenario DTP-007.S2: Chevron limit

- **Given** `minDate` is in the current month
- **When** the user views that month
- **Then** the previous-month chevron is disabled

### REQ DTP-008: Drilldown navigation

With `navigation` `drilldown` the panel SHALL open on a filterable year list, picking a year SHALL lead to a month grid and a month to the day grid, clicking the header SHALL go back exactly one level, and the day view SHALL always show a single month with no month paging.

#### Scenario DTP-008.S1: Drill down

- **Given** drilldown mode
- **When** the user picks a year then a month
- **Then** the day grid for that month is shown

#### Scenario DTP-008.S2: Year filter

- **Given** the year list is shown
- **When** the user types digits
- **Then** only matching years remain, or the `emptyLabel` text shows when none match

#### Scenario DTP-008.S3: Back

- **Given** the day grid is shown
- **When** the user clicks the header
- **Then** the month level is shown

### REQ DTP-009: Month-only view

With `view` `month` the input SHALL be read-only and show the value as a localized month and year, a click SHALL open the panel, and picking a month SHALL commit its first day and close the panel without showing a day grid, paging by year in calendar navigation.

#### Scenario DTP-009.S1: Pick month

- **Given** month view
- **When** the user picks a month
- **Then** the first day of that month is committed and the panel closes

### REQ DTP-010: Locale

The `locale` input (default `en-US`) SHALL control month and weekday names shown in the panel and the localized text in month view.

#### Scenario DTP-010.S1: Locale names

- **Given** `locale` is `pt-BR`
- **When** the panel opens
- **Then** month and weekday names appear in Portuguese

### REQ DTP-011: Disabled dates and days

The panel SHALL mark days outside `minDate`/`maxDate`, listed in `disabledDates`, or falling on a weekday in `disabledDays` (0 is Sunday) as aria-disabled, SHALL ignore clicks and Enter on them, and keyboard arrow movement SHALL skip over disabled days.

#### Scenario DTP-011.S1: Weekend

- **Given** `disabledDays` is [0, 6]
- **When** the user presses ArrowRight from a Friday
- **Then** focus lands on Monday

#### Scenario DTP-011.S2: Specific date

- **Given** a date is in `disabledDates`
- **When** the user clicks it
- **Then** nothing is selected

### REQ DTP-012: Multi-month view

`numberOfMonths` SHALL render that many months side by side with consecutive labels (default 2 for range, 1 otherwise), the next chevron SHALL slide the window by one month, a range across both grids SHALL preview and complete, and days from neighbouring months SHALL appear blank rather than clickable. The value SHALL be ignored in drilldown navigation.

#### Scenario DTP-012.S1: Side by side

- **Given** `numberOfMonths` is 2
- **When** the panel opens
- **Then** two month grids with consecutive labels are shown

#### Scenario DTP-012.S2: Slide

- **Given** two months are shown
- **When** the user presses next
- **Then** the window moves forward by one month

### REQ DTP-013: Calendar keyboard

In the day grid, arrow keys SHALL move the focused day by day or week, Home and End SHALL go to the start and end of the week, PageUp and PageDown SHALL move one month (clamping the day of month) and Shift+PageUp/PageDown one year, Enter or Space SHALL select, Escape SHALL close without changing the value, and in drilldown navigation the page keys SHALL do nothing.

#### Scenario DTP-013.S1: Clamp

- **Given** focus on Jan 31
- **When** the user presses PageDown
- **Then** focus moves to Feb 28 in a non-leap year

#### Scenario DTP-013.S2: Escape

- **Given** the panel is open
- **When** the user presses Escape
- **Then** it closes and the value is unchanged

### REQ DTP-014: Date and time

With `showTime` in single mode the input SHALL be read-only with a click opening the panel, the displayed text SHALL include a 24-hour or 12-hour (`hourFormat`, with AM/PM) time suffix, picking a day SHALL keep the panel open, `stepMinute` SHALL control the minute step, editing hour or minute SHALL update the value, and the Done button SHALL commit and close. Range mode SHALL ignore `showTime`.

#### Scenario DTP-014.S1: Keep open

- **Given** `showTime` is on
- **When** the user picks a day
- **Then** the panel stays open

#### Scenario DTP-014.S2: Done

- **Given** a day and time are chosen
- **When** the user presses Done
- **Then** the value is committed and the panel closes

### REQ DTP-015: Clear and disabled

The picker SHALL show the clear button only with `showClear` and a value, clear the value and text and refocus the input, set `aria-invalid` semantics through `invalid`, and when disabled (input or Reactive Forms) SHALL render a disabled input and ignore ArrowDown.

#### Scenario DTP-015.S1: Clear

- **Given** `showClear` is on with a value
- **When** the user clicks clear
- **Then** the value and text are empty and the input has focus

#### Scenario DTP-015.S2: Disabled

- **Given** the control is disabled
- **When** the user presses ArrowDown
- **Then** the panel does not open

### REQ DTP-016: DatePicker documentation page

`/docs/components/date-picker` SHALL present the `EXAMPLES` "On this page" index matching the documented sections in page order, and SHALL provide English prose, a live interactive demo, and a source code block for every implemented `DatePickerComponent` feature: Basic, Format, Locale, Min / Max & Disabled Dates, Multiple, Range, Time, Month Picker, Multiple Months, Drilldown Navigation, Clear Icon, Sizes, Disabled, Invalid, Float Label, Ifta Label, Signal Forms, Template Driven, and Reactive Forms.

#### Scenario DTP-016.S1: Documentation sections, live demos, and On this page navigation

- **Given** the `/docs/components/date-picker` documentation page
- **When** the page renders in a browser
- **Then** the "On this page" navigation lists every `EXAMPLES` anchor in order and each section renders English prose, a live `<med-date-picker>` demo, and a code block
- **And** interactive demos (Range, Clear Icon, Signal Forms, Template Driven, Reactive Forms) update their bound values without console or hydration errors

### REQ DTP-017: Inline calendar rendering
`DatePickerComponent` SHALL support an `inline` boolean input (default `false`). When `inline` is `true`, the component SHALL render `DatePickerPanelComponent` directly inside the host instead of rendering the text `<input>` and overlay trigger, SHALL NOT open an overlay on click, and SHALL NOT steal document focus on initial render. Selecting dates in inline mode SHALL update the bound CVA value immediately, and `disabled` SHALL prevent selection and apply disabled styling.

#### Scenario DTP-017.S1: Inline picker renders panel without input and updates value
- **Given** a `DatePickerComponent` with `inline` set to `true`
- **When** it renders in the DOM and the user clicks a day cell
- **Then** no combobox `<input>` or overlay trigger button is rendered, the calendar grid is visible inline without opening an overlay, and the bound value updates without closing the panel

#### Scenario DTP-017.S2: Inline picker does not steal focus on mount
- **Given** a `DatePickerComponent` with `inline` set to `true`
- **When** it initializes on a page
- **Then** `document.activeElement` is not moved into the inline calendar panel automatically

### REQ DTP-018: Panel button bar
`DatePickerComponent` and `DatePickerPanelComponent` SHALL support a `showButtonBar` boolean input (default `false`) and an overridable `todayLabel` string input (default `'Today'`), reusing `clearLabel` (default `'Clear'`). When `showButtonBar` is `true`, the panel SHALL render a footer bar containing the Today and Clear buttons.

#### Scenario DTP-018.S1: Today button selects today and Clear button resets value
- **Given** a `DatePickerComponent` with `showButtonBar` set to `true`
- **When** the user opens the panel and clicks the Today button, and subsequently opens the panel and clicks the Clear button
- **Then** clicking Today commits today's date (when selectable) and closes the overlay (unless `inline` or `showTime` is `true`), and clicking Clear resets the bound value to `null` (or empty selection in multiple/range modes)

### REQ DTP-019: Year-only picker view
`DatePickerComponent` SHALL extend its `view` input to `'date' | 'month' | 'year'` (default `'date'`), and `DatePickerPanelComponent` SHALL accept `pickerView` `'date' | 'month' | 'year'`, plus `previousDecadeLabel` (default `'Previous decade'`) and `nextDecadeLabel` (default `'Next decade'`). When `view` is `'year'`, the panel SHALL open on the year grid, terminate at year selection (committing `new Date(year, 0, 1)`), display the selected year (`yyyy`) in the input, and allow paging across decades in `navigation="calendar"` mode.

#### Scenario DTP-019.S1: Year view selects a year and pages decades
- **Given** a `DatePickerComponent` with `view` set to `'year'`
- **When** the user opens the panel, pages to another decade, and selects a year cell
- **Then** the bound value becomes January 1st of the chosen year and the input displays the 4-digit year

### REQ DTP-020: Time-only picker mode
`DatePickerComponent` and `DatePickerPanelComponent` SHALL support a `timeOnly` boolean input (default `false`). When `timeOnly` is `true`, the panel SHALL render only the time controls (hour, minute, AM/PM toggle when `hourFormat="12"`, and Done button in overlay mode) without calendar grids, the input SHALL be `readOnly` and display only the formatted time, and adjusting the hour/minute/period SHALL commit a `Date` with the selected time.

#### Scenario DTP-020.S1: Time-only mode renders only time controls and formats time
- **Given** a `DatePickerComponent` with `timeOnly` set to `true`
- **When** the user opens the panel and adjusts the hour or minute
- **Then** no day/month/year grid is rendered, the committed `Date` reflects the chosen time, and the input displays only the formatted time string

### REQ DTP-021: Custom date cell template
`DatePickerComponent` SHALL accept an optional `#date` content-projected `TemplateRef<DatePickerDateTemplateContext>` and forward it to `DatePickerPanelComponent`. When provided, each day cell SHALL render the consumer template with context `{ $implicit: Date, date: number, month: number, year: number, today: boolean, selected: boolean, disabled: boolean, selectable: boolean, outsideMonth: boolean }`.

#### Scenario DTP-021.S1: Custom #date template renders inside day cells
- **Given** a `DatePickerComponent` with an `<ng-template #date let-ctx>` child
- **When** the calendar panel renders day cells
- **Then** the custom template content appears inside each day cell with accurate context fields while preserving cell click selection

### REQ DTP-022: Filled variant and fluid layout
`DatePickerComponent` SHALL support `variant` (`FieldVariant`, default `'outlined'`) and `fluid` (boolean, default `false`) inputs matching `SelectComponent` and `InputText`. `variant="filled"` SHALL apply filled input styling via `inputTextVariants`, and `fluid` SHALL apply the `med-date-picker-fluid` marker class and full-width host styling.

#### Scenario DTP-022.S1: Filled variant and fluid layout apply expected styling
- **Given** a `DatePickerComponent` with `variant="filled"` and `fluid` set to `true`
- **When** rendered in a real browser
- **Then** the input receives the filled surface background styling and the host/input spans 100% of its container width with the `med-date-picker-fluid` class

### REQ DTP-023: DatePicker parity documentation examples
The `/docs/components/date-picker` page SHALL include interactive documentation examples, prose `.txt` files, and Playwright e2e coverage for `Inline`, `Button Bar`, `Year Picker`, `Time Only`, `Date Template`, `Fluid`, and `Filled`.

#### Scenario DTP-023.S1: New DatePicker parity sections render and work on docs page
- **Given** the `/docs/components/date-picker` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all new parity example sections (`Inline`, `Button Bar`, `Year Picker`, `Time Only`, `Date Template`, `Fluid`, `Filled`) render visibly with non-empty code blocks and interactive behavior
