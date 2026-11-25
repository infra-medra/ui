# Dialog

**Capability:** `dialog`
**ID prefix:** `DLD`
**Paths:** `projects/medra/ui/src/lib/dialog/**`

## Purpose

Defines the behavior of `med-dialog` and `DialogService`: modal and non-modal dialogs, declarative or opened from code, and the requirements for its documentation page (`/docs/components/dialog`).

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

### REQ DLD-004: Dialog structure and accessibility

The dialog (`med-dialog` and the dialog service) SHALL render a header, the content, and a close button labelled "Close" by default (customizable via `closeLabel`). It SHALL expose `role="dialog"` with `aria-labelledby` pointing at the header, plus `aria-modal` while `modal` is true (the default; see DLD-002). When there is no header and it is not closable, no header bar SHALL be rendered. When the dialog has no header but is closable, only a floating corner close button SHALL be shown; a header, maximizable or draggable dialog SHALL still render the full header bar. Content components SHALL receive `DIALOG_DATA` and a `DialogRef` whose `close(result)` closes the dialog and emits the result.

#### Scenario DLD-004.S1: Accessible dialog

- **Given** a dialog opened with a header
- **When** it is rendered
- **Then** the shell has `role="dialog"` and `aria-modal`
- **And** `aria-labelledby` references the header

#### Scenario DLD-004.S2: Close hidden

- **Given** a dialog with `closable` set to false
- **When** it is rendered
- **Then** no close button is shown

#### Scenario DLD-004.S3: Result from content

- **Given** a dialog whose content component injects `DialogRef`
- **When** the content calls `close(result)`
- **Then** the dialog closes and the result is emitted to the opener

### REQ DLD-005: Dialog dismissal and declarative use

The dialog SHALL close on Escape and on backdrop click by default, and SHALL ignore each when `closeOnEscape` or `dismissableMask` is false. `med-dialog` SHALL open and close through the two-way `visible` binding, SHALL project `#header` and `#footer` templates, and SHALL emit `shown`/`hidden` (and `onShow`/`onHide`) events. The dialog service's `opened$` SHALL emit once after the caller can subscribe and then complete.

#### Scenario DLD-005.S1: Mask dismissal disabled

- **Given** a dialog with `dismissableMask` false
- **When** the user clicks the backdrop
- **Then** the dialog stays open

#### Scenario DLD-005.S2: Declarative visible binding

- **Given** `<med-dialog [(visible)]="open">` with open set to true
- **When** the user closes the dialog
- **Then** `open` becomes false

### REQ DLD-006: Dialog position, drag, resize and maximize

The dialog SHALL be centered by default and SHALL anchor to a corner when `position` says so. It SHALL move by dragging the header only when `draggable` is set (never when pressing the close button), accumulating offsets across drags. It SHALL show a resize handle only when `resizable` is set, resizing from the corner without shrinking below a minimum size. It SHALL show a maximize button only when `maximizable` is set, toggling between "Maximize" and "Restore" labels and filling the viewport while maximized; while maximized the resize handle SHALL be hidden and any drag offset SHALL be suppressed but restored on restore. A `maximize` event SHALL report the maximized state.

#### Scenario DLD-006.S1: Not draggable by default

- **Given** a dialog without `draggable`
- **When** the user drags the header
- **Then** the dialog does not move

#### Scenario DLD-006.S2: Maximize and restore

- **Given** a maximizable dialog
- **When** the user activates the maximize button, then activates it again
- **Then** the dialog first fills the viewport and then returns to its previous size and position

### REQ DLD-007: Dialog responsive breakpoints

When `breakpoints` is provided, the dialog SHALL apply a width rule per breakpoint scoped to that dialog instance only and not while maximized. Without `breakpoints` no such rule SHALL be injected.

#### Scenario DLD-007.S1: Breakpoint rule

- **Given** a dialog with a breakpoint map
- **When** it is rendered
- **Then** one media rule per breakpoint applies to that dialog only
