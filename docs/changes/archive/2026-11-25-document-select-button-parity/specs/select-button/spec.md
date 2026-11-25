# Delta: SelectButton

**Capability:** `select-button`
**ID prefix:** SLB

## Purpose

Defines the documentation requirements for the SelectButton component page (`/docs/components/select-button`).

## ADDED Requirements

### REQ SLB-001: SelectButton documentation page
The `/docs/components/select-button` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 9 supported sections in order: `Basic`, `Multiple`, `Sizes`, `Disabled`, `Invalid`, `Allow Empty`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario SLB-001.S1: All 9 SelectButton documentation sections render and work in a real browser
- **Given** the `/docs/components/select-button` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 9 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and clicking options in `Basic`, `Multiple`, `Allow Empty`, `Signal Forms`, `Template Driven`, and `Reactive Forms` updates the bound value output
