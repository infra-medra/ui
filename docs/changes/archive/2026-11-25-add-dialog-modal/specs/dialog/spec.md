# Delta: Dialog

**Capability:** `dialog`

## ADDED Requirements

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
