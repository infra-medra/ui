# Form Text Inputs

**Capability:** `form-text-inputs`
**ID prefix:** `TXT`
**Paths:** `projects/medra/ui/src/lib/password/**`, `projects/medra/ui/src/lib/input-otp/**`, `projects/medra/ui/src/lib/input-chips/**`, `projects/medra/ui/src/lib/input-group/**`, `projects/medra/ui/src/lib/icon-field/**`, `projects/medra/ui/src/lib/float-label/**`, `projects/medra/ui/src/lib/ifta-label/**`, `projects/medra/ui/src/lib/key-filter/**`

## Purpose

Provides text-entry form controls (text, multi-line, password, number, one-time code and tag inputs) plus helpers that decorate or restrict them. All value-holding controls work with Angular forms.

## Requirements

<!-- retired: TXT-001, TXT-001.S1, TXT-001.S2, TXT-002, TXT-002.S1, TXT-003, TXT-003.S1, TXT-007, TXT-007.S1, TXT-007.S2, TXT-008, TXT-008.S1, TXT-008.S2, TXT-009, TXT-009.S1 -->

### REQ TXT-004: Password masking and toggle

`med-password` SHALL render a masked input (`type="password"`) with autocomplete `new-password`, and when `toggleMask` is set SHALL show a button that switches between masked and plain text, labeled by `showLabel` or `hideLabel`, and returns focus to the input.

#### Scenario TXT-004.S1: Reveal

- **Given** a `med-password` with `toggleMask`
- **When** the user activates the toggle button
- **Then** the input type becomes text and the button label becomes "Hide password"

### REQ TXT-005: Password clear button

`med-password` SHALL, when `showClear` is set, show a clear button (labeled by `clearLabel`) only while the field is non-empty and enabled; activating it SHALL empty the value and focus the input.

#### Scenario TXT-005.S1: Clear

- **Given** a `med-password` with `showClear` and value `"secret"`
- **When** the user activates the clear button
- **Then** the form value becomes `""` and the clear button disappears

### REQ TXT-006: Password strength feedback

When `feedback` is set, `med-password` SHALL, while focused, show a non-modal status panel linked by `aria-describedby` that displays a prompt when empty and otherwise a Weak, Medium or Strong label with a three-segment meter, and SHALL close the panel on blur. A value is Strong when it matches `strongRegex` (default: lowercase, uppercase, digit, symbol and at least 8 characters), Medium when it matches `mediumRegex` (default: lowercase, uppercase, digit and at least 6 characters), and Weak otherwise.

#### Scenario TXT-006.S1: Strength levels

- **Given** a focused `med-password` with `feedback`
- **When** the user types `"Abc123"`
- **Then** the panel shows "Medium"

#### Scenario TXT-006.S2: Closes on blur

- **Given** the feedback panel is open
- **When** the input loses focus
- **Then** the panel is closed

### REQ TXT-010: One-time-code input entry

`med-input-otp` SHALL render `length` (default 6) single-character boxes in a labeled group, SHALL accept only digits unless `integerOnly` is false, SHALL move focus to the next box after a character is entered, SHALL display bullets when `mask` is set, and SHALL emit the concatenated string as its value.

#### Scenario TXT-010.S1: Auto advance

- **Given** a `med-input-otp` with focus in the first box
- **When** the user types `"1"`
- **Then** focus moves to the second box and the value is `"1"`

#### Scenario TXT-010.S2: Non-digit rejected

- **Given** `integerOnly` is on
- **When** the user types `"a"`
- **Then** the box stays empty

### REQ TXT-011: One-time-code navigation and paste

`med-input-otp` SHALL, on Backspace in an empty box, clear and focus the previous box; SHALL move between boxes with ArrowLeft and ArrowRight; and SHALL, on paste, fill boxes from the current one onward (filtering non-digits when `integerOnly`), without overflowing `length`.

#### Scenario TXT-011.S1: Paste

- **Given** an empty `med-input-otp` of length 6
- **When** the user pastes `"123456"` into the first box
- **Then** the value is `"123456"`

### REQ TXT-012: Chips input adding tags

`med-input-chips` SHALL add the trimmed draft text as a tag on Enter, SHALL ignore empty drafts, SHALL ignore duplicates unless `allowDuplicates` is set, SHALL stop adding at `max`, SHALL also add on Tab when `addOnTab` is set, and SHALL split typed text into several tags using `separator` (string or regular expression). Its value is the array of tags.

#### Scenario TXT-012.S1: Enter adds tag

- **Given** a `med-input-chips` with an empty list
- **When** the user types `"angular"` and presses Enter
- **Then** the value is `["angular"]` and the draft is cleared

#### Scenario TXT-012.S2: Duplicate ignored

- **Given** the list contains `"angular"`
- **When** the user types `"angular"` and presses Enter
- **Then** the list is unchanged

### REQ TXT-013: Chips input removing and keyboard navigation

`med-input-chips` SHALL render each tag as a removable chip, SHALL remove the last tag on Backspace when the draft is empty, SHALL move focus to the last chip on ArrowLeft when the draft is empty, SHALL move between chips with ArrowLeft and ArrowRight, and SHALL remove the focused chip on Delete and then focus a neighboring chip or the input. It SHALL announce additions and removals in a polite live region.

#### Scenario TXT-013.S1: Backspace removes

- **Given** the tags `["a", "b"]` and an empty draft
- **When** the user presses Backspace in the input
- **Then** the value is `["a"]`

### REQ TXT-014: Chips input disabled and invalid

`med-input-chips` SHALL NOT add or remove tags while disabled, and SHALL expose `aria-invalid="true"` when `invalid` is set. It SHALL show `placeholder` only while there are no tags.

#### Scenario TXT-014.S1: Disabled

- **Given** a disabled `med-input-chips`
- **When** the user attempts to remove a chip
- **Then** the value is unchanged

### REQ TXT-015: Input group

`med-input-group` SHALL lay out projected children (inputs, buttons, `medInputGroupAddon` elements) in a single row with collapsed shared borders and SHALL raise the focused child above its neighbors. `medInputGroupAddon` SHALL render a bordered, filled affix with `size` (`sm`, `default`, `lg`) matching the field spacing, and both SHALL accept a `class` override.

#### Scenario TXT-015.S1: Addons around an input

- **Given** a `med-input-group` containing an addon, an input and a second addon
- **When** it renders
- **Then** all three children appear in one row

### REQ TXT-016: Icon field

`med-icon-field` SHALL position a projected `medIconFieldIcon` over its input on the left by default or on the right with `position="right"`, and the icon SHALL NOT intercept pointer events unless the consumer overrides it.

#### Scenario TXT-016.S1: Right icon

- **Given** `<med-icon medIconFieldIcon position="right">` inside `med-icon-field`
- **When** it renders
- **Then** the icon is anchored to the right edge and does not capture clicks

### REQ TXT-017: Float label

`med-float-label` SHALL display a projected `medFloatLabelText` label that rests over the field while it is empty and unfocused and floats up when the field is focused or has content. Its `variant` SHALL be `over` (default, above the field), `on` (straddling the top border) or `in` (inside the field, with extra top padding).

#### Scenario TXT-017.S1: Variant propagated

- **Given** `<med-float-label variant="in">` with a label and an input
- **When** it renders
- **Then** the label uses the `in` floating position and the input gets extra top padding

### REQ TXT-018: IFTA label

`med-ifta-label` SHALL render a bordered container holding a projected `medIftaLabelText` label above the projected field, with a focus-within highlight, and SHALL accept a `class` override.

#### Scenario TXT-018.S1: Label above field

- **Given** a `med-ifta-label` with a label and an input
- **When** it renders
- **Then** the label is shown above the input inside one bordered box

### REQ TXT-019: Key filter

The `[medKeyFilter]` directive SHALL block typed characters not matching the selected preset (`pint`, `int`, `pnum`, `num`, `hex`, `email`, `alpha`, `alphanum`; default `alphanum`) or a supplied regular expression, SHALL block a paste whose text contains any non-matching character or exceeds 4096 characters, SHALL NOT block key combinations with Ctrl, Meta or Alt or non-character keys, and SHALL NOT block anything when `validateOnly` is set. It SHALL expose `validate(value)`.

#### Scenario TXT-019.S1: Typing blocked

- **Given** `medKeyFilter="pint"` on an input
- **When** the user presses the key `"a"`
- **Then** the key event is prevented

#### Scenario TXT-019.S2: Paste blocked

- **Given** `medKeyFilter="pint"`
- **When** the user pastes `"12a"`
- **Then** the paste is prevented
