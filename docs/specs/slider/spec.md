# Slider

**Capability:** `slider`
**ID prefix:** `SLD`
**Paths:** `projects/medra/ui/src/lib/slider/**`

## Purpose

Defines the behavior of `med-slider`: a single-value or two-thumb range slider driven by pointer and keyboard that works with Angular forms, and the requirements for its documentation page (`/docs/components/slider`).

## Requirements

### REQ SLD-001: Slider documentation page

The `/docs/components/slider` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, live demos, and non-empty code blocks for all 14 supported sections in order: `Basic`, `Step`, `Range`, `Range Constraints`, `Vertical`, `Sizes`, `Disabled`, `Invalid`, `Controlled`, `Custom`, `Filter`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario SLD-001.S1: All 14 Slider documentation sections render and work in a real browser

- **Given** the `/docs/components/slider` documentation page
- **When** it is loaded in a real browser
- **Then** there are zero console errors or hydration warnings, and all 14 "On this page" `#example-*` links, prose blocks, live demos, and non-empty code blocks render in order
- **And** pressing ArrowRight on the thumb of the `Basic`, `Signal Forms`, `Template Driven`, and `Reactive Forms` demos updates their displayed bound value, and the `Controlled` demo's buttons move its thumb

### REQ SLD-002: Slider single value

`med-slider` SHALL expose a `role="slider"` thumb with min, max, value and orientation ARIA attributes, SHALL snap values to `step` within `min` and `max` (defaults 0, 100, 1), SHALL update on pointer down and drag on the track, and SHALL respond to ArrowRight/ArrowUp (plus one step), ArrowLeft/ArrowDown (minus one step), PageUp and PageDown (ten steps), Home and End.

#### Scenario SLD-002.S1: Arrow key

- **Given** a `med-slider` with value 50
- **When** the user presses ArrowRight on the thumb
- **Then** the value is 51

### REQ SLD-003: Slider range mode

With `range`, `med-slider` SHALL expose two slider thumbs labeled by `startLabel` and `endLabel` with a `{start, end}` value, SHALL keep the thumbs apart by at least `minStepsBetweenHandles` steps, SHALL move the nearer thumb when the track is pressed, and SHALL leave a thumb inert when `disabledMinHandle` or `disabledMaxHandle` applies to it.

#### Scenario SLD-003.S1: Thumbs cannot cross

- **Given** a range slider with value `{start: 20, end: 40}`
- **When** the user presses End on the start thumb
- **Then** the start becomes 40, not beyond the end

### REQ SLD-004: Slider states

`med-slider` SHALL set `aria-disabled` and ignore input when disabled, SHALL set `aria-invalid` on thumbs when `invalid`, and SHALL support `size` and `orientation`.

#### Scenario SLD-004.S1: Disabled

- **Given** a disabled `med-slider`
- **When** the user presses a key on the thumb
- **Then** the value does not change

### REQ SLD-005: Vertical orientation

With `orientation="vertical"`, `med-slider` SHALL lay its track out vertically, with `min` at the bottom and `max` at the top, and SHALL position each thumb and the filled portion of the track along that axis. Its track SHALL default to a fixed height that the consumer `class` can override. A pointer press or drag on a vertical track SHALL map the pointer's vertical position to a value, and keyboard handling SHALL stay unchanged (ArrowUp and ArrowRight increase the value). Horizontal sliders SHALL render exactly as before.

#### Scenario SLD-005.S1: Thumb and fill follow the vertical axis

- **Given** a `med-slider` with `orientation="vertical"` and value 30
- **When** it renders
- **Then** the thumb sits 30% up from the bottom of the track and the fill covers the bottom 30% of the track

#### Scenario SLD-005.S2: Pointer maps the vertical position

- **Given** a vertical `med-slider` with `min` 0 and `max` 100
- **When** the user presses the track 25% down from its top
- **Then** the value becomes 75

#### Scenario SLD-005.S3: Vertical layout in a real browser

- **Given** the `Vertical` example on `/docs/components/slider`
- **When** it renders in a real browser and the user drags its thumb upward
- **Then** the track is taller than it is wide, and the value increases
