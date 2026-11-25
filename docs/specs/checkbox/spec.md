# Checkbox

**Capability:** `checkbox`
**ID prefix:** `CKB`
**Paths:** `projects/medra/ui/src/lib/checkbox/**`

## Purpose

Defines the behavior of `med-checkbox`: a binary or array-valued checkbox that works with Angular forms, and the requirements for its documentation page (`/docs/components/checkbox`).

## Requirements

### REQ CKB-001: Checkbox documentation page
The `/docs/components/checkbox` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 11 supported sections in order: `Basic`, `Group`, `Indeterminate`, `Dynamic`, `Sizes`, `Filled`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario CKB-001.S1: All 11 Checkbox documentation sections render and work in a real browser
- **Given** the `/docs/components/checkbox` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 11 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Basic`, `Dynamic`, `Signal Forms`, `Template Driven`, `Reactive Forms`) update their bound values

### REQ CKB-002: Checkbox binary mode

`med-checkbox` SHALL, in binary mode (the default when no `value` is set, or when `binary` is true), write `trueValue` (default `true`) when checked and `falseValue` (default `false`) when unchecked, and SHALL show a check mark when checked.

#### Scenario CKB-002.S1: Toggle

- **Given** an unchecked `med-checkbox`
- **When** the user clicks it
- **Then** it is checked and the form value is `true`

### REQ CKB-003: Checkbox group mode

`med-checkbox` SHALL, when `value` is set (or `binary` is false), treat the form value as an array and add or remove its `value` from that array when checked or unchecked.

#### Scenario CKB-003.S1: Array membership

- **Given** two `med-checkbox` with values `"a"` and `"b"` sharing one form control holding `["a"]`
- **When** the user checks the second
- **Then** the form value is `["a", "b"]`

### REQ CKB-004: Checkbox states

`med-checkbox` SHALL show a minus mark when `indeterminate`, SHALL set `aria-invalid` when `invalid`, SHALL NOT change value when `readonly` (exposing `aria-readonly`), SHALL be non-interactive when disabled, and SHALL support `size` and `variant` (`outlined`, `filled`).

#### Scenario CKB-004.S1: Readonly

- **Given** a checked `med-checkbox` with `readonly`
- **When** the user clicks it
- **Then** it stays checked and the form value does not change
