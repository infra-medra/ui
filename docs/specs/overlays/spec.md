# Overlays

**Capability:** `overlays`
**ID prefix:** `OVL`
**Paths:** `projects/medra/ui/src/lib/overlay/**`, `projects/medra/ui/src/lib/dialog/**`, `projects/medra/ui/src/lib/confirm-dialog/**`, `projects/medra/ui/src/lib/confirm-popup/**`, `projects/medra/ui/src/lib/drawer/**`, `projects/medra/ui/src/lib/popover/**`, `projects/medra/ui/src/lib/tooltip/**`, `projects/medra/ui/src/lib/toast/**`, `projects/medra/ui/src/lib/focus-trap/**`, `projects/medra/ui/src/lib/block-ui/**`

## Purpose

Lets applications show content above the page: modal dialogs, confirmations, side drawers, anchored popovers, tooltips, toasts and blocking masks. All of them share one overlay service that decides backdrop, dismissal, scrolling and focus behavior.

## Requirements

### REQ OVL-001: Overlay backdrop, dismissal and result

The overlay service SHALL open global overlays (centered or corner-anchored) with a backdrop by default and connected overlays (anchored to an element or a viewport point) without a backdrop by default. It SHALL close an overlay on Escape and on backdrop click (global) or outside click (no backdrop) unless disabled, and SHALL emit the close result once on `closed$` and then complete it.

#### Scenario OVL-001.S1: Escape closes with a result

- **Given** an open overlay with default options
- **When** the user presses Escape
- **Then** the overlay closes
- **And** `closed$` emits the result (or undefined) and completes

#### Scenario OVL-001.S2: Backdrop click closes a global overlay

- **Given** an open global overlay with a backdrop
- **When** the user clicks the backdrop
- **Then** the overlay closes

#### Scenario OVL-001.S3: Outside click ignores the trigger

- **Given** an open connected overlay without a backdrop
- **When** the user clicks the trigger element that anchors it
- **Then** the overlay does not close because of that click
- **But** a click elsewhere outside the panel and the trigger closes it

### REQ OVL-002: Overlay positioning

The overlay service SHALL center global overlays by default, SHALL anchor them to a named corner or edge position when requested, and SHALL stretch an edge-anchored overlay along the full viewport side. When both an edge and a position are given, the edge SHALL win. It SHALL allow an open global overlay to be repositioned without detaching its content.

#### Scenario OVL-002.S1: Default centering

- **Given** a global overlay opened without a position
- **When** it is shown
- **Then** it is centered on both axes

#### Scenario OVL-002.S2: Edge takes precedence

- **Given** a global overlay opened with both `position` and an edge of `left`
- **When** it is shown
- **Then** it is anchored to the left edge and spans the full viewport height

### REQ OVL-003: Scroll behavior of overlays

Overlays with a backdrop SHALL block page scrolling while open. Global overlays without a backdrop (such as toasts) SHALL NOT block page scrolling, and connected overlays SHALL reposition on scroll instead of blocking it.

#### Scenario OVL-003.S1: Toast does not block scrolling

- **Given** a toast is displayed
- **When** the user scrolls the page
- **Then** the page scrolls normally

### REQ OVL-004: Overlay focus management

Overlays with a backdrop SHALL trap keyboard focus and move focus inside on open by default; overlays without a backdrop SHALL NOT trap focus by default, and the trap SHALL be overridable either way. On close, focus SHALL return to the previously focused element unless focus restoration is disabled.

#### Scenario OVL-004.S1: Focus restored

- **Given** a button has focus and opens a dialog
- **When** the dialog closes
- **Then** focus returns to the button

#### Scenario OVL-004.S2: Restoration disabled

- **Given** an overlay opened with focus restoration turned off
- **When** it closes
- **Then** focus is not moved back to the previous element

### REQ OVL-005: Delayed close for exit transitions

When an overlay supplies a before-close hook returning a promise, the overlay service SHALL postpone disposal and the `closed$` emission until the promise resolves. A repeated close request while that hook is pending SHALL be ignored.

#### Scenario OVL-005.S1: Close waits for the transition

- **Given** an overlay with a before-close hook returning a pending promise
- **When** close is requested
- **Then** the overlay remains attached until the promise resolves
- **And** a second close request in the meantime has no effect

### REQ OVL-006: Dialog structure and accessibility

The dialog (`med-dialog` and the dialog service) SHALL render a header, the content, and a close button labelled "Close" by default (customizable via `closeLabel`). It SHALL expose `role="dialog"` and `aria-modal` with `aria-labelledby` pointing at the header. When there is no header and it is not closable, no header bar SHALL be rendered. When the dialog has no header but is closable, only a floating corner close button SHALL be shown; a header, maximizable or draggable dialog SHALL still render the full header bar. Content components SHALL receive `DIALOG_DATA` and a `DialogRef` whose `close(result)` closes the dialog and emits the result.

#### Scenario OVL-006.S1: Accessible dialog

- **Given** a dialog opened with a header
- **When** it is rendered
- **Then** the shell has `role="dialog"` and `aria-modal`
- **And** `aria-labelledby` references the header

#### Scenario OVL-006.S2: Close hidden

- **Given** a dialog with `closable` set to false
- **When** it is rendered
- **Then** no close button is shown

#### Scenario OVL-006.S3: Result from content

- **Given** a dialog whose content component injects `DialogRef`
- **When** the content calls `close(result)`
- **Then** the dialog closes and the result is emitted to the opener

### REQ OVL-007: Dialog dismissal and declarative use

The dialog SHALL close on Escape and on backdrop click by default, and SHALL ignore each when `closeOnEscape` or `dismissableMask` is false. `med-dialog` SHALL open and close through the two-way `visible` binding, SHALL project `#header` and `#footer` templates, and SHALL emit `shown`/`hidden` (and `onShow`/`onHide`) events. The dialog service's `opened$` SHALL emit once after the caller can subscribe and then complete.

#### Scenario OVL-007.S1: Mask dismissal disabled

- **Given** a dialog with `dismissableMask` false
- **When** the user clicks the backdrop
- **Then** the dialog stays open

#### Scenario OVL-007.S2: Declarative visible binding

- **Given** `<med-dialog [(visible)]="open">` with open set to true
- **When** the user closes the dialog
- **Then** `open` becomes false

### REQ OVL-008: Dialog position, drag, resize and maximize

The dialog SHALL be centered by default and SHALL anchor to a corner when `position` says so. It SHALL move by dragging the header only when `draggable` is set (never when pressing the close button), accumulating offsets across drags. It SHALL show a resize handle only when `resizable` is set, resizing from the corner without shrinking below a minimum size. It SHALL show a maximize button only when `maximizable` is set, toggling between "Maximize" and "Restore" labels and filling the viewport while maximized; while maximized the resize handle SHALL be hidden and any drag offset SHALL be suppressed but restored on restore. A `maximize` event SHALL report the maximized state.

#### Scenario OVL-008.S1: Not draggable by default

- **Given** a dialog without `draggable`
- **When** the user drags the header
- **Then** the dialog does not move

#### Scenario OVL-008.S2: Maximize and restore

- **Given** a maximizable dialog
- **When** the user activates the maximize button, then activates it again
- **Then** the dialog first fills the viewport and then returns to its previous size and position

### REQ OVL-009: Dialog responsive breakpoints

When `breakpoints` is provided, the dialog SHALL apply a width rule per breakpoint scoped to that dialog instance only and not while maximized. Without `breakpoints` no such rule SHALL be injected.

#### Scenario OVL-009.S1: Breakpoint rule

- **Given** a dialog with a breakpoint map
- **When** it is rendered
- **Then** one media rule per breakpoint applies to that dialog only

### REQ OVL-010: Confirm dialog

The confirm dialog service (`confirm(options)`) SHALL show a header, message and severity icon with accept and reject buttons labelled "Yes" and "No" by default (customizable). `closed$` SHALL resolve true on accept, false on reject and undefined when dismissed (for example by Escape). The accept button SHALL be `danger` severity when the dialog severity is danger and `primary` otherwise unless `acceptSeverity` overrides it. `acceptVisible`/`rejectVisible` SHALL hide the respective button. Position and draggable options SHALL be forwarded to the dialog.

#### Scenario OVL-010.S1: Accept and reject

- **Given** an open confirm dialog
- **When** the user presses the accept button
- **Then** `closed$` emits true
- **And** pressing reject instead emits false

#### Scenario OVL-010.S2: Dismissal

- **Given** an open confirm dialog
- **When** the user presses Escape
- **Then** `closed$` emits undefined

### REQ OVL-011: Confirm dialog focus and custom templates

The confirm dialog SHALL focus the reject button on open by default; `defaultFocus` MAY select `accept`, `close` (header close button) or `none`, and when the requested button is hidden focus SHALL fall to the visible one. A `messageTemplate` SHALL replace the plain message while keeping icon and buttons; a `headlessTemplate` SHALL replace everything including icon and buttons, SHALL take precedence over `messageTemplate`, and SHALL provide accept and reject callbacks resolving true and false. A declarative `med-confirm-dialog` SHALL respond only to calls whose key exactly matches its `key`.

#### Scenario OVL-011.S1: Safe default focus

- **Given** a confirm dialog opened with defaults
- **When** it appears
- **Then** the reject button has focus

#### Scenario OVL-011.S2: Key matching

- **Given** a `<med-confirm-dialog key="a">` and a confirm call with key `ab`
- **When** the call is made
- **Then** the declarative instance does not handle it

### REQ OVL-012: Confirm popup

The confirm popup service SHALL show a confirmation anchored to an origin element, with `role="alertdialog"` and `aria-describedby` referencing the message, a severity icon, and default "Yes"/"No" labels. It SHALL resolve true on accept, false on reject and undefined on Escape, with the same severity defaults, visibility flags and `defaultFocus` rules (default reject, with `accept` or `none`) as the confirm dialog. A `contentTemplate` SHALL replace icon and message; a `headlessTemplate` SHALL replace everything including buttons with accept/reject callbacks. A declarative `med-confirm-popup` SHALL handle only calls with an exactly matching key.

#### Scenario OVL-012.S1: Anchored and accessible

- **Given** a confirm popup opened from a button
- **When** it is shown
- **Then** it is positioned relative to that button and not centered
- **And** it has `role="alertdialog"` described by its message

#### Scenario OVL-012.S2: Headless accept

- **Given** a confirm popup with a headless template
- **When** the template calls its accept callback
- **Then** the popup resolves true

### REQ OVL-013: Drawer

`med-drawer` SHALL be closed and render no content until `visible` (two-way) is true, and SHALL slide in from the `position` edge (`left` default; `right`, `top`, `bottom`), or fade over the viewport when `fullScreen`. On close it SHALL stay in the DOM through the exit transition and then be removed, including when its host is destroyed while open. It SHALL be modal with a backdrop by default (backdrop click closes it) and have no backdrop when `modal` is false. It SHALL close on Escape unless `closeOnEscape` is false and SHALL block body scroll only when `blockScroll` is set, restoring the prior overflow value on close. It SHALL emit `shown` and `hidden`.

#### Scenario OVL-013.S1: Close button syncs visibility

- **Given** an open drawer bound with `[(visible)]`
- **When** the user presses its close button
- **Then** `visible` becomes false after the exit transition

#### Scenario OVL-013.S2: Non-modal drawer

- **Given** a drawer with `modal` false
- **When** it opens
- **Then** no backdrop is shown

#### Scenario OVL-013.S3: Scroll blocking

- **Given** a drawer with `blockScroll` set and body overflow previously customized
- **When** the drawer opens and then closes
- **Then** body scrolling is blocked while open and the previous overflow value is restored

### REQ OVL-014: Drawer header, footer and headless content

The drawer SHALL render its `header` text, linked via `aria-labelledby`, plus a close button unless `closable` is false (label from `closeLabel`, "Close" by default). Without a header and not closable it SHALL omit the header row and `aria-labelledby`. It SHALL support `#header` and `#footer` templates (footer row omitted when absent) and a `#headless` template that replaces header, body and footer.

#### Scenario OVL-014.S1: No header

- **Given** a drawer without header and with `closable` false
- **When** it is open
- **Then** no header row and no `aria-labelledby` are rendered

### REQ OVL-015: Popover

`med-popover` SHALL be closed initially and open via `toggle()` or `show(event, target)` (with an explicit target override), close via `close()`, and report `isOpen`. It SHALL be non-modal with no backdrop, move focus to its pane on open, expose `role="dialog"` with `aria-label` and `aria-labelledby` only when provided, keep projected content interactive, close on Escape, and close when its host is destroyed. An outside click SHALL close it unless `dismissable` is false, while Escape SHALL still close it. It SHALL emit `shown` and `hidden` and merge a consumer `class` onto the pane.

#### Scenario OVL-015.S1: Toggle

- **Given** a closed popover
- **When** `toggle()` is called twice
- **Then** it opens on the first call and closes on the second

#### Scenario OVL-015.S2: Non-dismissable

- **Given** an open popover with `dismissable` false
- **When** the user clicks outside it
- **Then** it stays open
- **But** pressing Escape closes it

### REQ OVL-016: Tooltip display triggers

The `medTooltip` directive SHALL show a tooltip on hover and on keyboard focus by default, hiding on mouse leave and blur; `tooltipEvent` of `hover` or `focus` SHALL restrict the trigger. It SHALL honor `showDelay` and `hideDelay` (default 150 ms), cancelling a pending show when the pointer leaves first. It SHALL NOT show when `tooltipDisabled` is true or content is empty. It SHALL close and leave no overlay when the host is destroyed.

#### Scenario OVL-016.S1: Focus access

- **Given** an element with a tooltip
- **When** it receives keyboard focus and later loses it
- **Then** the tooltip appears and then disappears

#### Scenario OVL-016.S2: Disabled

- **Given** a tooltip with `tooltipDisabled` true
- **When** the user hovers the host
- **Then** no tooltip appears

### REQ OVL-017: Tooltip content, accessibility and auto-hide

The tooltip SHALL render string content as plain text (never HTML) and MAY render a template. It SHALL set `aria-describedby` on the host only while open. Escape SHALL close an open tooltip unless `hideOnEscape` is false. With `showOnEllipsis`, it SHALL show only when the host text is truncated. When `life` is set it SHALL auto-hide after that many milliseconds even while hovered; unset, it SHALL never auto-hide.

#### Scenario OVL-017.S1: Plain text only

- **Given** tooltip content containing HTML markup
- **When** it is shown
- **Then** the markup appears as literal text

#### Scenario OVL-017.S2: Ellipsis only

- **Given** `showOnEllipsis` and a host whose text is not truncated
- **When** the user hovers it
- **Then** no tooltip appears

### REQ OVL-018: Toast display and stacking

`ToastService` SHALL create the toast stack lazily on the first `show` and stack subsequent messages, returning an id per message. The stack SHALL have no backdrop, SHALL NOT close on Escape or outside click, and SHALL be a `role="region"` with `aria-live="polite"`. `info`, `success`, `warn` and `error` shortcuts SHALL set severity. Info and success messages SHALL be `role="status"` polite; error messages SHALL be `role="alert"` assertive.

#### Scenario OVL-018.S1: Error announcement

- **Given** the toast service
- **When** `error()` is called
- **Then** the message has `role="alert"` and `aria-live="assertive"`

#### Scenario OVL-018.S2: Outside click

- **Given** visible toasts
- **When** the user clicks elsewhere on the page
- **Then** the toasts remain

### REQ OVL-019: Toast lifetime, dismissal and position

A toast SHALL auto-dismiss after `life` and SHALL be sticky when `life` is 0. `dismiss(id)` SHALL remove one message and `clear(key?)` SHALL remove messages (optionally by key). Each message SHALL show a close button (custom `closeLabel`) unless `closable` is false, removing only that message. The stack position SHALL default to top-right, SHALL be chosen by the first call, and a later call with a different position SHALL move the existing stack without opening a second. `messageTemplate` SHALL replace the summary and detail inside the message chrome; `headlessTemplate` SHALL replace everything and provide a close callback for that message.

#### Scenario OVL-019.S1: Sticky

- **Given** a toast shown with `life` 0
- **When** time passes
- **Then** the toast remains until dismissed

#### Scenario OVL-019.S2: Reposition

- **Given** a stack at top-right
- **When** a new toast requests bottom-left
- **Then** the existing stack moves there and no second stack is created

### REQ OVL-020: Declarative toast

`med-toast` SHALL display only messages whose key matches its `key`, SHALL support sticky messages, SHALL optionally suppress duplicate messages when `preventDuplicates` is set, and SHALL take its `position` from its input.

#### Scenario OVL-020.S1: Key filter

- **Given** `<med-toast key="a">`
- **When** a message with key `b` is shown
- **Then** this instance does not display it

### REQ OVL-021: Focus trap directive

`[medFocusTrap]` SHALL contain Tab and Shift+Tab navigation inside its host while enabled, SHALL be toggleable through its input and the disable input, SHALL move focus inside on activation when `autoFocus` is true, and SHALL release the trap when destroyed. It SHALL NOT create a trap during server-side rendering.

#### Scenario OVL-021.S1: Tab wrap

- **Given** a container with a focus trap containing two buttons
- **When** the user tabs past the last button
- **Then** focus moves to the first button

### REQ OVL-022: Block UI

`med-block-ui` SHALL wrap projected content and show no mask when `blocked` is false. When blocked it SHALL show a mask with a default spinner (or a projected `ng-template`), label the mask with `blockedLabel` ("Loading" by default), and make the wrapped content inert. With `target` set, it SHALL render no wrapper of its own and place the mask inside the target element, making the target `position: relative` only if it was static and restoring that on unblock or destroy.

#### Scenario OVL-022.S1: Inert content

- **Given** a block-ui with content
- **When** `blocked` becomes true
- **Then** the content becomes inert and a labelled mask is shown

#### Scenario OVL-022.S2: Target restoration

- **Given** a block-ui targeting a statically positioned element and currently blocked
- **When** it becomes unblocked
- **Then** the target's original position style is restored
