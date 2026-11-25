# Delta: Tabs

**Capability:** `tabs`
**ID prefix:** TBD

## Purpose

Defines the documentation requirements for the Tabs component page (`/docs/components/tabs`).

## ADDED Requirements

### REQ TBD-001: Tabs documentation page
The `/docs/components/tabs` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 6 supported sections in order: `Basic`, `Dynamic`, `Controlled`, `Scrollable`, `Lazy`, and `Disabled`.

#### Scenario TBD-001.S1: All 6 Tabs documentation sections render and work in a real browser
- **Given** the `/docs/components/tabs` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 6 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and switching tabs in `Basic`, `Controlled`, `Lazy`, and `Disabled` updates the active tab and visible `role="tabpanel"`
