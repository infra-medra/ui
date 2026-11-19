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
