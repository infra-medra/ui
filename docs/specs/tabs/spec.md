# Tabs

**Capability:** `tabs`
**ID prefix:** `TBD`

## Purpose

Defines the documentation requirements for the Tabs component page (`/docs/components/tabs`).

## Requirements

### REQ TBD-001: Tabs documentation page
The `/docs/components/tabs` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 6 supported sections in order: `Basic`, `Dynamic`, `Controlled`, `Scrollable`, `Lazy`, and `Disabled`.

#### Scenario TBD-001.S1: All 6 Tabs documentation sections render and work in a real browser
- **Given** the `/docs/components/tabs` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 6 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and switching tabs in `Basic`, `Controlled`, `Lazy`, and `Disabled` updates the active tab and visible `role="tabpanel"`

### REQ TBD-002: Custom tab header template
`TabComponent` SHALL support an optional `<ng-template #header>` `contentChild` (`headerTemplate`) and default `header` to `''`. `TabsComponent` SHALL render `headerTemplate` inside the corresponding `role="tab"` button via `NgTemplateOutlet` when present (falling back to `header()`), and `TabComponent` SHALL exclude `headerTemplate` from lazy `contentTemplate` resolution so `<ng-template #header>` works alongside both eager `<ng-content />` and lazy `<ng-template>` panel content.

#### Scenario TBD-002.S1: Custom #header template renders inside tab button without breaking body content
- **Given** a `<med-tabs>` with `<med-tab>` children using `<ng-template #header>` (with both eager body content and a second lazy `<ng-template>` body)
- **When** rendered in the DOM and a real browser
- **Then** the custom `#header` markup renders inside each `role="tab"` button, eager and lazy panel contents render only in their `role="tabpanel"` when active, and clicking/keyboard-navigating between tabs switches `aria-selected` and visible panels

### REQ TBD-003: Tabs Template documentation example
The `/docs/components/tabs` page SHALL include a `Template` (`#example-template`) section in `EXAMPLES` with English prose, a live `<ng-template #header>` demo, non-empty code blocks, and Playwright real-browser verification.

#### Scenario TBD-003.S1: Template section renders and works on docs page
- **Given** the `/docs/components/tabs` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** the `Template` (`#example-template`) link, prose, custom-header tab demo, and code blocks render visibly and switching custom-header tabs updates the visible `role="tabpanel"`
