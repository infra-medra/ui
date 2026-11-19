# Form Choice Inputs

**Capability:** `form-choice-inputs`
**ID prefix:** `CHO`
**Paths:** `projects/medra/ui/src/lib/checkbox/**`, `projects/medra/ui/src/lib/radio-button/**`, `projects/medra/ui/src/lib/toggle-switch/**`, `projects/medra/ui/src/lib/toggle-button/**`, `projects/medra/ui/src/lib/select-button/**`, `projects/medra/ui/src/lib/rating/**`, `projects/medra/ui/src/lib/slider/**`, `projects/medra/ui/src/lib/knob/**`, `projects/medra/ui/src/lib/color-picker/**`

## Purpose

Provides form controls for picking a value without typing: boolean toggles, single and multiple choice buttons, numeric pickers (rating, slider, knob) and a color picker. All of them work with Angular forms.

## Requirements

### REQ CHO-001: Checkbox binary mode

`med-checkbox` SHALL, in binary mode (the default when no `value` is set, or when `binary` is true), write `trueValue` (default `true`) when checked and `falseValue` (default `false`) when unchecked, and SHALL show a check mark when checked.

#### Scenario CHO-001.S1: Toggle

- **Given** an unchecked `med-checkbox`
- **When** the user clicks it
- **Then** it is checked and the form value is `true`

### REQ CHO-002: Checkbox group mode

`med-checkbox` SHALL, when `value` is set (or `binary` is false), treat the form value as an array and add or remove its `value` from that array when checked or unchecked.

#### Scenario CHO-002.S1: Array membership

- **Given** two `med-checkbox` with values `"a"` and `"b"` sharing one form control holding `["a"]`
- **When** the user checks the second
- **Then** the form value is `["a", "b"]`

### REQ CHO-003: Checkbox states

`med-checkbox` SHALL show a minus mark when `indeterminate`, SHALL set `aria-invalid` when `invalid`, SHALL NOT change value when `readonly` (exposing `aria-readonly`), SHALL be non-interactive when disabled, and SHALL support `size` and `variant` (`outlined`, `filled`).

#### Scenario CHO-003.S1: Readonly

- **Given** a checked `med-checkbox` with `readonly`
- **When** the user clicks it
- **Then** it stays checked and the form value does not change

### REQ CHO-004: Radio button

`med-radio-button` SHALL require `name` and `value`, SHALL be checked when the form value equals its `value`, SHALL write its `value` to the form when selected, and SHALL support `size`, `variant`, `invalid` and `disabled`.

#### Scenario CHO-004.S1: Selection

- **Given** two `med-radio-button` with the same `name` and values `"a"` and `"b"` and the form value `"a"`
- **When** the user selects the second
- **Then** the form value is `"b"` and the first is no longer checked

### REQ CHO-005: Toggle switch

`med-toggle-switch` SHALL expose a native checkbox with `role="switch"`, SHALL write `trueValue` or `falseValue` (default `true` and `false`) on change, SHALL ignore changes when `readonly` (exposing `aria-readonly`), and SHALL support `size`, `invalid` and `disabled`.

#### Scenario CHO-005.S1: Switch on

- **Given** an off `med-toggle-switch`
- **When** the user clicks it
- **Then** the form value is `true` and the switch role reports checked

### REQ CHO-006: Toggle button

`med-toggle-button` SHALL render a button with `aria-pressed`, showing `onLabel` and `onIcon` when on and `offLabel` and `offIcon` when off (defaults "Yes" and "No"), SHALL write a boolean to the form, SHALL NOT toggle when disabled or `readonly`, and SHALL NOT switch off when `allowEmpty` is false and it is on.

#### Scenario CHO-006.S1: Label swap

- **Given** a `med-toggle-button` with `onLabel="On"` and `offLabel="Off"` that is off
- **When** the user clicks it
- **Then** it shows "On", `aria-pressed` is true and the form value is `true`

### REQ CHO-007: Select button selection

`med-select-button` SHALL render one button per option from `options` (primitives, objects with `optionLabel`, `optionValue` and `optionDisabled` keys, or `{label, value, disabled}`), SHALL in single mode select one option and expose `role="radiogroup"` with `role="radio"` buttons, and SHALL in `multiple` mode toggle options into an array and expose `role="group"` with `aria-pressed` buttons.

#### Scenario CHO-007.S1: Single selection

- **Given** a single-mode `med-select-button` with options "A" and "B"
- **When** the user clicks "B"
- **Then** the form value is `"B"` and only "B" is checked

#### Scenario CHO-007.S2: Multiple selection

- **Given** a `multiple` `med-select-button`
- **When** the user clicks "A" then "B"
- **Then** the form value is `["A", "B"]`

### REQ CHO-008: Select button deselection and disabled options

`med-select-button` SHALL deselect an option when it is clicked again, unless `allowEmpty` is false (in which case the last selected option stays), and SHALL NOT select disabled options.

#### Scenario CHO-008.S1: Deselect

- **Given** a single-mode `med-select-button` with "A" selected
- **When** the user clicks "A"
- **Then** the form value is `null`

### REQ CHO-009: Select button keyboard

In single mode, `med-select-button` SHALL use a roving tab stop and SHALL, on ArrowRight/ArrowDown and ArrowLeft/ArrowUp, wrap to the next or previous enabled option, and on Home and End go to the first or last enabled option, selecting and focusing it.

#### Scenario CHO-009.S1: Arrow selects

- **Given** a single-mode `med-select-button` with "A" selected and focused
- **When** the user presses ArrowRight
- **Then** "B" is selected and focused

### REQ CHO-010: Rating selection

`med-rating` SHALL render `stars` (default 5) radio buttons plus, when `cancel` is on (default), a clear button labeled by `clearLabel`, SHALL write the clicked star number (or null for clear), and SHALL, with `allowHalf`, write a half value when the left half of a star is clicked.

#### Scenario CHO-010.S1: Click a star

- **Given** an empty `med-rating`
- **When** the user clicks the third star
- **Then** the form value is `3`

#### Scenario CHO-010.S2: Clear

- **Given** a `med-rating` with value 3
- **When** the user activates the clear button
- **Then** the form value is `null`

### REQ CHO-011: Rating keyboard and read-only

`med-rating` SHALL use a roving tab stop and SHALL, on arrow keys, select and focus the neighboring star (wrapping, including the clear button), and on Home and End the first and last. When `readonly` it SHALL render non-interactive stars as `role="img"` with a default label "N out of M stars", showing half stars for fractional values. It SHALL NOT change value when disabled.

#### Scenario CHO-011.S1: Readonly label

- **Given** a `readonly` `med-rating` with value 3 and 5 stars
- **When** it renders
- **Then** it has `role="img"` and the label "3 out of 5 stars"

### REQ CHO-012: Slider single value

`med-slider` SHALL expose a `role="slider"` thumb with min, max, value and orientation ARIA attributes, SHALL snap values to `step` within `min` and `max` (defaults 0, 100, 1), SHALL update on pointer down and drag on the track, and SHALL respond to ArrowRight/ArrowUp (plus one step), ArrowLeft/ArrowDown (minus one step), PageUp and PageDown (ten steps), Home and End.

#### Scenario CHO-012.S1: Arrow key

- **Given** a `med-slider` with value 50
- **When** the user presses ArrowRight on the thumb
- **Then** the value is 51

### REQ CHO-013: Slider range mode

With `range`, `med-slider` SHALL expose two slider thumbs labeled by `startLabel` and `endLabel` with a `{start, end}` value, SHALL keep the thumbs apart by at least `minStepsBetweenHandles` steps, SHALL move the nearer thumb when the track is pressed, and SHALL leave a thumb inert when `disabledMinHandle` or `disabledMaxHandle` applies to it.

#### Scenario CHO-013.S1: Thumbs cannot cross

- **Given** a range slider with value `{start: 20, end: 40}`
- **When** the user presses End on the start thumb
- **Then** the start becomes 40, not beyond the end

### REQ CHO-014: Slider states

`med-slider` SHALL set `aria-disabled` and ignore input when disabled, SHALL set `aria-invalid` on thumbs when `invalid`, and SHALL support `size` and `orientation`.

#### Scenario CHO-014.S1: Disabled

- **Given** a disabled `med-slider`
- **When** the user presses a key on the thumb
- **Then** the value does not change

### REQ CHO-015: Knob

`med-knob` SHALL render a circular control with `role="slider"`, min, max and value ARIA attributes, SHALL show its value (customizable with `valueTemplate` as a string with `{value}` or a function) when `showValue` is on, SHALL set the value from the pointer angle while dragging, SHALL step with arrow keys (right/up plus, left/down minus) and jump with Home and End, and SHALL snap to `step` within `min` and `max`.

#### Scenario CHO-015.S1: Template

- **Given** a `med-knob` with value 40 and `valueTemplate="{value}%"`
- **When** it renders
- **Then** it displays "40%"

### REQ CHO-016: Knob states

`med-knob` SHALL ignore pointer and keyboard input and remove itself from the tab order when disabled or `readonly`, SHALL expose `aria-disabled`, `aria-readonly` and `aria-invalid` accordingly, and SHALL render its value in danger color when `invalid`.

#### Scenario CHO-016.S1: Readonly

- **Given** a `readonly` `med-knob`
- **When** the user presses ArrowRight
- **Then** the value does not change

### REQ CHO-017: Color picker trigger and formats

`med-color-picker` SHALL, by default, render a swatch button (default color `#000000`) labeled by `ariaLabel` plus the current color, with `aria-haspopup="dialog"` and `aria-expanded`, that opens a connected panel on click and closes on a second click. Its form value SHALL use `format` (`hex`, `rgb` as `rgb(r, g, b)`, or `hsb` as `hsb(h, s%, b%)`), and a written value not valid for that format SHALL show the default color.

#### Scenario CHO-017.S1: Open panel

- **Given** a `med-color-picker` with value `#ff0000`
- **When** the user clicks the swatch
- **Then** the panel opens and `aria-expanded` is true

#### Scenario CHO-017.S2: RGB output

- **Given** `format="rgb"`
- **When** the user picks a pure red
- **Then** the form value is `rgb(255, 0, 0)`

### REQ CHO-018: Color picker panel

The color picker panel SHALL offer a saturation and brightness area and a hue track, each a `role="slider"` operable with the pointer and arrow keys (the hue track also with Home and End), and a hex text input whose draft is committed on Enter only when it is a valid color. With `inline` the panel SHALL render in place of the swatch button.

#### Scenario CHO-018.S1: Hue key

- **Given** an open panel with hue 100
- **When** the user presses ArrowRight on the hue track
- **Then** the hue becomes 101

#### Scenario CHO-018.S2: Invalid hex ignored

- **Given** the user types `"zzz"` in the hex input
- **When** the user presses Enter
- **Then** the color does not change

### REQ CHO-019: Color picker states

`med-color-picker` SHALL NOT open and SHALL disable its swatch when disabled, SHALL expose `aria-invalid` and a danger ring when `invalid`, and SHALL support `size` (`sm`, `default`, `lg`).

#### Scenario CHO-019.S1: Disabled

- **Given** a disabled `med-color-picker`
- **When** the user clicks the swatch
- **Then** no panel opens
