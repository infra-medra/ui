## Component: Overlay

### Description
`OverlayService` is the **shared internal primitive** underlying every other overlay component in this batch (Dialog, ConfirmDialog, ConfirmPopup, Drawer, Popover, Tooltip, Toast) — it is not exposed as a template element and is not called directly anywhere in the showcase app (no `OverlayService` import found in `projects/showcase/src/app/app.ts`). It wraps Angular CDK's `Overlay` with MedraUi's visual/behavioral defaults — panel classes, backdrop, close on Escape/backdrop/outside click, focus trap, focus restoration — so individual overlay components don't each reimplement this mechanics (`projects/medra/ui/src/lib/overlay/overlay.service.ts:116-127`). Document it as the mechanism other feedback/overlay docs in this batch point back to, not as a component consumers use directly.

### Variants
Not a visual component — no variants. It exposes four opening methods, split along two axes (component vs. template content; viewport-global vs. trigger-connected position):

| Method | When to use |
|---|---|
| `openGlobal(component, options)` | Centered/corner-positioned overlay hosting a dynamic component (Dialog, Toast's container) (`overlay.service.ts:129-137`) |
| `openGlobalTemplate(templateRef, viewContainerRef, options)` | Same, but for a consumer's inline `<ng-template>` content (Drawer) (`overlay.service.ts:145-154`) |
| `openConnected(origin, component, options)` | Overlay anchored to a trigger element, hosting a dynamic component (ConfirmPopup, Tooltip) (`overlay.service.ts:207-230`) |
| `openConnectedTemplate(origin, templateRef, viewContainerRef, options)` | Same, anchored, for inline template content (Popover) (`overlay.service.ts:238-250`) |

### Props (Angular Inputs/Outputs)
Not a component — configured per-call via `OverlayOpenOptions` (and `ConnectedOverlayOpenOptions` for the connected variants):

| Option | Type | Default | Description |
|---|---|---|---|
| `panelClass` | `string \| string[]` | `DEFAULT_PANEL_CLASS` (`rounded-lg bg-surface-0 dark:bg-surface-800 shadow-overlay-lg`) | (`overlay.service.ts:47`, `:105`) |
| `hasBackdrop` | `boolean` | `true` for `openGlobal*`, `false` for `openConnected*` | (`overlay.service.ts:50`) |
| `backdropClass` | `string \| string[]` | `DEFAULT_BACKDROP_CLASS` (`bg-surface-950/50 backdrop-blur-sm`) | (`overlay.service.ts:51`, `:106`) |
| `closeOnBackdropClick` | `boolean` | `true` | Only relevant when `hasBackdrop` (`overlay.service.ts:52-53`) |
| `closeOnOutsideClick` | `boolean` | `!hasBackdrop` | Only relevant when no backdrop (`overlay.service.ts:54-55`) |
| `closeOnEscape` | `boolean` | `true` | (`overlay.service.ts:56-57`) |
| `trapFocus` | `boolean` | same as `hasBackdrop` | (`overlay.service.ts:58-59`) |
| `restoreFocus` | `boolean` | `true` | Refocuses whatever was focused before opening, once closed (`overlay.service.ts:60-69`) |
| `position` | `GlobalOverlayPosition` | `'center'` | `openGlobal*` only; ignored if `edge` is set (`overlay.service.ts:70-71`) |
| `edge` | `'left' \| 'right' \| 'top' \| 'bottom'` | `undefined` | `openGlobal*` only; stretches the panel edge-to-edge (Drawer), takes precedence over `position` (`overlay.service.ts:72-73`) |
| `injector` | `Injector` | `undefined` | Custom DI context for the attached component (`overlay.service.ts:74`) |
| `beforeClose` | `() => Promise<void> \| void` | `undefined` | Delays dispose/focus-restore/`closed$` until it resolves — lets an exit transition play (Drawer's only current consumer) (`overlay.service.ts:75-84`) |
| `positions` | `ConnectedPosition[]` | `DEFAULT_CONNECTED_POSITIONS` | `openConnected*` only (`overlay.service.ts:87`, `:109-114`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | N/A — a service, not a rendered element | — |
| Open | Backdrop (`hasBackdrop`) blocks page scroll via `scrollStrategies.block()`; connected overlays use `reposition()` on scroll; a global, non-modal overlay (Toast) uses `noop()` so it never locks scroll (`overlay.service.ts:277-292`, comment explaining why Toast specifically needs `noop()`) | — |
| Closing | `close()` guards against double-close (`closed`/`closing` flags), runs `beforeClose()` if provided, then disposes and restores focus (`overlay.service.ts:311-333`) | — |
| Focus | Trapped via `FocusTrapFactory` when `trapFocus` resolves `true`; `focusInitialElementWhenReady()` on attach (`overlay.service.ts:306-307`) | — |
| Disabled / Loading / Error | N/A | — |

### Accessibility
- **Role/ARIA:** None set by `OverlayService` itself — it is unopinionated about ARIA role; each consumer (Dialog, Popover, ...) sets its own role on its own panel content.
- **Keyboard navigation:** Escape-to-close is exercised directly (`overlay.service.spec.ts` — `'closes on Escape and emits the result on closed$'`, plus a backdrop-click-close test and an outside-pointer-events exclusion regression suite). Focus trap (`FocusTrapFactory`, `overlay.service.ts:306-307`) and focus restoration on close (`previouslyFocused?.focus()`, `overlay.service.ts:304,321-322`) are both implemented here and inherited by every consumer, but **neither is exercised by any test in this file** — a full-file read of `overlay.service.spec.ts` turns up no assertion that Tab/Shift+Tab cycles inside an open overlay, and no assertion that `document.activeElement` returns to the pre-open element after `close()`. A repo-wide search (`grep -rn "focus|Tab|activeElement"` across every `.spec.ts` in this feedback batch) finds zero matches, meaning this gap isn't closed by any downstream consumer's spec either (Dialog, ConfirmDialog, ConfirmPopup, Drawer all delegate this behavior to `OverlayService` and don't re-test it themselves).
- **Screen reader:** No `aria-live` wiring — left entirely to consumers (Toast/Message set their own).

**A11y verdict:** Covered — **resolved 2026-08-19.** Added a dedicated `describe('focus management ...')` block in `overlay.service.spec.ts` (8 tests) covering: a backdrop overlay creates a focus trap on the overlay element and calls `focusInitialElementWhenReady()`; closing destroys the trap; a non-backdrop overlay creates no trap by default; `trapFocus: true`/`false` override that default in either direction; and — tested behaviorally, not just via wiring spies, since this part is synchronous — closing restores focus to whatever was focused before open, and `restoreFocus: false` leaves focus wherever it already moved to instead. This one suite retroactively covers Dialog, ConfirmDialog, ConfirmPopup, Drawer, and Popover, which all inherit this mechanism identically rather than reimplementing it.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Build new overlay-based components on `OverlayService` rather than calling CDK's `Overlay` directly, to inherit the shared close/focus-trap/restore-focus defaults | Styling `panelClass` with `width`/`max-width`/`height`/`max-height` utilities — CDK injects its own unlayered `.cdk-overlay-pane` CSS that silently wins over any layered Tailwind utility targeting that selector (documented at length in `dialog-shell.component.ts:18-35`, reused by `drawer.styles.ts:6-11`) |
| Set `restoreFocus: false` for overlays that open as a side effect of hover/focus (Tooltip) rather than a real focus move | Leaving `restoreFocus` at its default `true` for a hover-triggered overlay — it can steal focus away from wherever the user has since legitimately moved to (reasoning documented at `overlay.service.ts:60-69` and applied in `tooltip.directive.ts:156-166`) |
| If you touch `focusTrap`/`previouslyFocused` in `openWithStrategy` (`overlay.service.ts:304-322`), add a real Tab-cycling and focus-restoration test at the same time | Assuming existing green tests protect this code path — `overlay.service.spec.ts` currently has none for it (see Accessibility above); a regression here would ship silently |

### Code example (Angular)
`OverlayService` has no direct showcase usage — it is only ever called from within other services/components. Representative internal usage (Dialog's):
```ts
// projects/medra/ui/src/lib/dialog/dialog.service.ts:67-76
handle = this.overlayService.openGlobal<DialogShellComponent, TResult>(DialogShellComponent, {
  injector: shellInjector,
  panelClass: [],
});
```
```ts
// projects/medra/ui/src/lib/popover/popover.component.ts:84-87 (connected + template variant)
const handle = this.overlayService.openConnectedTemplate<void>(origin, this.panelTemplate(), this.viewContainerRef, {
  panelClass: POPOVER_PANEL_CLASS,
  positions: this.positions() ?? undefined,
});
```

### Source
- `projects/medra/ui/src/lib/overlay/overlay.service.ts`
