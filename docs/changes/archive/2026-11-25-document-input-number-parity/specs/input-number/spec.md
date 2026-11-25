# Delta: InputNumber

**Capability:** `input-number`
**ID prefix:** INN

## Purpose

Defines the documentation requirements for the InputNumber component page (`/docs/components/input-number`).

## ADDED Requirements

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
