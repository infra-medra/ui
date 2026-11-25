# Delta: DatePicker

**Capability:** `date-picker`

## ADDED Requirements

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
