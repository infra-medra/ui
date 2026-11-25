# Dialog

**Capability:** `dialog`
**ID prefix:** `DLD`

## Purpose

Defines the documentation requirements for the Dialog component page (`/docs/components/dialog`).

## Requirements

### REQ DLD-001: Dialog documentation page
The `/docs/components/dialog` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 9 supported sections in order: `Basic`, `Template`, `Position`, `Maximizable`, `Draggable`, `Resizable`, `Long Content`, `Headless`, and `Responsive & Dismissal`.

#### Scenario DLD-001.S1: All 9 Dialog documentation sections render and work in a real browser
- **Given** the `/docs/components/dialog` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 9 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and opening/closing dialogs (`Basic`, `Template`, `Maximizable`, `Headless`) renders `role="dialog"` overlays and dismisses cleanly

### REQ DLD-002: Non-modal dialog support
`DialogComponent` SHALL expose `modal = input(true, { transform: booleanAttribute })`, and `DialogOptions` (`DialogService.open()`) SHALL accept `modal?: boolean` (default `true`). When `modal` is `false`, `OverlayService` SHALL open the dialog with `hasBackdrop: false` (no backdrop element, no focus trap, and `closeOnOutsideClick` governed by `dismissableMask`), and the dialog element SHALL omit `aria-modal`.

#### Scenario DLD-002.S1: Non-modal dialog renders without backdrop and omits aria-modal
- **Given** a `DialogComponent` with `[modal]="false"` or a `DialogService.open()` call with `modal: false`
- **When** the dialog opens in the DOM and a real browser
- **Then** no `.cdk-overlay-backdrop` is rendered, `aria-modal` is omitted from `role="dialog"`, and elements outside the dialog remain clickable

### REQ DLD-003: Without Modal documentation example
The `/docs/components/dialog` page SHALL include a `Without Modal` (`#example-without-modal`) section in `EXAMPLES` with English prose, a live `[modal]="false"` demo, non-empty code block, and Playwright real-browser verification.

#### Scenario DLD-003.S1: Without Modal section renders and works on docs page
- **Given** the `/docs/components/dialog` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** the `Without Modal` (`#example-without-modal`) link, prose, demo, and code block render visibly, and opening the non-modal dialog renders `role="dialog"` without `.cdk-overlay-backdrop` or `aria-modal`
