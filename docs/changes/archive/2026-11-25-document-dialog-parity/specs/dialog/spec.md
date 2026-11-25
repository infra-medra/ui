# Delta: Dialog

**Capability:** `dialog`
**ID prefix:** DLD

## Purpose

Defines the documentation requirements for the Dialog component page (`/docs/components/dialog`).

## ADDED Requirements

### REQ DLD-001: Dialog documentation page
The `/docs/components/dialog` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 9 supported sections in order: `Basic`, `Template`, `Position`, `Maximizable`, `Draggable`, `Resizable`, `Long Content`, `Headless`, and `Responsive & Dismissal`.

#### Scenario DLD-001.S1: All 9 Dialog documentation sections render and work in a real browser
- **Given** the `/docs/components/dialog` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 9 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and opening/closing dialogs (`Basic`, `Template`, `Maximizable`, `Headless`) renders `role="dialog"` overlays and dismisses cleanly
