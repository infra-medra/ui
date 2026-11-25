# Delta: Checkbox

**Capability:** `checkbox`
**ID prefix:** CKB

## Purpose

Defines the documentation requirements for the Checkbox component page (`/docs/components/checkbox`).

## ADDED Requirements

### REQ CKB-001: Checkbox documentation page
The `/docs/components/checkbox` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 11 supported sections in order: `Basic`, `Group`, `Indeterminate`, `Dynamic`, `Sizes`, `Filled`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario CKB-001.S1: All 11 Checkbox documentation sections render and work in a real browser
- **Given** the `/docs/components/checkbox` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 11 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Basic`, `Dynamic`, `Signal Forms`, `Template Driven`, `Reactive Forms`) update their bound values
