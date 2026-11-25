# RadioButton

**Capability:** `radio-button`
**ID prefix:** `RDB`
**Paths:** `projects/medra/ui/src/lib/radio-button/**`

## Purpose

Defines the behavior of `med-radio-button`: a single choice within a named group that works with Angular forms, and the requirements for its documentation page (`/docs/components/radio-button`).

## Requirements

### REQ RDB-001: RadioButton documentation page
The `/docs/components/radio-button` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 10 supported sections in order: `Group`, `Dynamic`, `Card`, `Sizes`, `Filled`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario RDB-001.S1: All 10 RadioButton documentation sections render and work in a real browser
- **Given** the `/docs/components/radio-button` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 10 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and selecting options in `Group`, `Dynamic`, `Card`, `Signal Forms`, `Template Driven`, and `Reactive Forms` updates the bound value output

### REQ RDB-002: Radio button

`med-radio-button` SHALL require `name` and `value`, SHALL be checked when the form value equals its `value`, SHALL write its `value` to the form when selected, and SHALL support `size`, `variant`, `invalid` and `disabled`.

#### Scenario RDB-002.S1: Selection

- **Given** two `med-radio-button` with the same `name` and values `"a"` and `"b"` and the form value `"a"`
- **When** the user selects the second
- **Then** the form value is `"b"` and the first is no longer checked
