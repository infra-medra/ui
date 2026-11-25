# InputNumber

**Capability:** `input-number`
**ID prefix:** `INN`
**Paths:** `projects/medra/ui/src/lib/input-number/**`

## Purpose

Defines the behavior of `med-input-number`: a locale-aware numeric input with formatting, step buttons and bounds that works with Angular forms, and the requirements for its documentation page (`/docs/components/input-number`).

## Requirements

### REQ INN-001: InputNumber documentation page
The `/docs/components/input-number` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 17 supported sections in order: `Basic`, `Numerals`, `Locale`, `Currency`, `Prefix & Suffix`, `Buttons`, `Clear Icon`, `Float Label`, `Ifta Label`, `Sizes`, `Fluid`, `Filled`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario INN-001.S1: All 17 InputNumber documentation sections render and work in a real browser
- **Given** the `/docs/components/input-number` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 17 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Currency`, `Buttons`, `Clear Icon`, `Signal Forms`, `Template Driven`, `Reactive Forms`) update their bound values

### REQ INN-002: Signal Forms min and max compatibility
`InputNumberComponent` SHALL accept `number | null | undefined` for its `min` and `max` inputs, normalizing `undefined` to `null` so Angular Signal Forms `[formField]` bindings compile and operate without setting `aria-valuemin`/`aria-valuemax` or clamping values to `NaN`.

#### Scenario INN-002.S1: Undefined min and max work with Signal Forms and direct bindings
- **Given** an `InputNumberComponent` with `min` and `max` set to `undefined` or bound via Signal Forms `[formField]`
- **When** the user types or steps values
- **Then** `aria-valuemin` and `aria-valuemax` are omitted when bounds are `undefined`, values are not clamped to `NaN`, and `[formField]` syncs the numeric value bidirectionally

### REQ INN-003: Number input parsing and formatting

`med-input-number` SHALL display its value formatted for `locale` (default `en-US`) in `decimal` or `currency` mode with `currency`, `currencyDisplay`, `minFractionDigits`, `maxFractionDigits`, `useGrouping`, `prefix` and `suffix`, SHALL show the raw text while the user is typing, SHALL reformat on blur or Enter, and SHALL only emit values that parse as numbers within `min` and `max`.

#### Scenario INN-003.S1: Currency formatting

- **Given** a `med-input-number` in currency mode with USD and value `1234.5`
- **When** it renders
- **Then** the input shows `$1,234.50`

#### Scenario INN-003.S2: Out-of-range text

- **Given** `max="10"`
- **When** the user types `"15"`
- **Then** no new value is emitted to the form

### REQ INN-004: Number input keyboard and step buttons

`med-input-number` SHALL expose a `spinbutton` with value, min, max and text ARIA attributes, SHALL step by `step` on ArrowUp and ArrowDown and by ten steps on PageUp and PageDown, SHALL jump to `min` on Home and `max` on End when those are set, and SHALL clamp stepped values. When `showButtons` is set it SHALL render increment and decrement buttons in a `stacked`, `horizontal` or `vertical` layout, disabled at their limit.

#### Scenario INN-004.S1: Arrow step

- **Given** a `med-input-number` with value 5 and `step="2"`
- **When** the user presses ArrowUp
- **Then** the value becomes 7

#### Scenario INN-004.S2: Button at limit

- **Given** `showButtons`, `max="10"` and value 10
- **When** it renders
- **Then** the increment button is disabled

### REQ INN-005: Number input clear and states

`med-input-number` SHALL, when `showClear` is set, show a clear button while a value exists and the control is enabled; activating it SHALL set the value to null. It SHALL support `size`, `variant`, `fluid`, `invalid` and `disabled`.

#### Scenario INN-005.S1: Clear

- **Given** a `med-input-number` with `showClear` and value 3
- **When** the user activates the clear button
- **Then** the form value is `null`
