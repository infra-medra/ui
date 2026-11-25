# Delta: InputText

**Capability:** `input-text`
**ID prefix:** ITX

## Purpose

Defines the documentation requirements for the InputText component page (`/docs/components/input-text`).

## ADDED Requirements

### REQ ITX-001: InputText documentation page
The `/docs/components/input-text` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 13 supported sections in order: `Basic`, `Clear Icon`, `Filled`, `Float Label`, `Ifta Label`, `Sizes`, `Fluid`, `Help Text`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario ITX-001.S1: All 13 InputText documentation sections render and work in a real browser
- **Given** the `/docs/components/input-text` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 13 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Clear Icon`, `Signal Forms`, `Template Driven`, `Reactive Forms`) update their bound values
