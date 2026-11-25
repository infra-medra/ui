# InputText

**Capability:** `input-text`
**ID prefix:** `ITX`
**Paths:** `projects/medra/ui/src/lib/input-text/**`

## Purpose

Defines the behavior of the `medInputText` directive that styles a native text input, and the requirements for its documentation page (`/docs/components/input-text`).

## Requirements

### REQ ITX-001: InputText documentation page
The `/docs/components/input-text` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 13 supported sections in order: `Basic`, `Clear Icon`, `Filled`, `Float Label`, `Ifta Label`, `Sizes`, `Fluid`, `Help Text`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario ITX-001.S1: All 13 InputText documentation sections render and work in a real browser
- **Given** the `/docs/components/input-text` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 13 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Clear Icon`, `Signal Forms`, `Template Driven`, `Reactive Forms`) update their bound values

### REQ ITX-002: Text input directive

The `input[medInputText]` directive SHALL style a native input, SHALL support `size` (`sm`, `default`, `lg`), `variant` (`outlined`, `filled`), `fluid` and `invalid`, and SHALL work as a forms control (value read and written, touched on blur, disabled state).

#### Scenario ITX-002.S1: Invalid state

- **Given** an input with `medInputText` and `invalid`
- **When** it renders
- **Then** it has `aria-invalid="true"` and the danger styling

#### Scenario ITX-002.S2: Forms value

- **Given** an input with `medInputText` bound to a form control with value `"abc"`
- **When** the user types `"abcd"`
- **Then** the control value becomes `"abcd"`

### REQ ITX-003: Text input fluid and class override

The `medInputText` directive SHALL be full width when `fluid` is set or when it is inside a fluid context, and SHALL let a consumer `class` win over its default classes.

#### Scenario ITX-003.S1: Fluid

- **Given** an input with `medInputText` and `fluid`
- **When** it renders
- **Then** it is full width
