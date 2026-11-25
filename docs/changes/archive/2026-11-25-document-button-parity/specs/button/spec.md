# Delta: Button

**Capability:** `button`
**ID prefix:** BTD

## Purpose

Defines the documentation requirements for the Button component page (`/docs/components/button`).

## ADDED Requirements

### REQ BTD-001: Button documentation page
The `/docs/components/button` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 15 supported sections in order: `Basic`, `Icons`, `Loading`, `Link`, `Severity`, `Rounded`, `Text`, `Raised Text`, `Outlined`, `Icon Only`, `Badge`, `Sizes`, `Fluid`, `Disabled`, and `Template`.

#### Scenario BTD-001.S1: All 15 Button documentation sections render and work in a real browser
- **Given** the `/docs/components/button` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 15 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Loading` toggle, `Link` anchor, `Disabled` button) behave as expected
