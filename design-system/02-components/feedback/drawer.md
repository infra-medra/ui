## Component: Drawer

### Description
Drawer is a **template component** (`med-drawer`), declared once inline where it's used, with its content authored directly in the surrounding template rather than a separate dynamic component class — unlike Dialog/Toast's imperative services (`projects/medra/ui/src/lib/drawer/drawer.component.ts:34-50`). Its own template is entirely an `<ng-template>` (`host: { class: 'hidden' }`, nothing renders at `<med-drawer>`'s own declaration site) — projected content only actually mounts once `visible` becomes `true` and the template is attached to the overlay via `OverlayService.openGlobalTemplate()`. `position` drives which viewport edge the panel is stretched against (`OverlayService`'s `edge` option). Use it for a slide-in panel — navigation, filters, a cart — anchored to one edge of the viewport.

### Variants
| Variant (`position`) | When to use |
|---|---|
| `left` (default) | Fixed width (`w-[85vw] sm:w-96`), full viewport height (`drawer.styles.ts:41`) |
| `right` | Same shape, opposite edge (`drawer.styles.ts:42`) |
| `top` | Full width, `max-h-[85vh]` (never forced to full height, same reasoning as Dialog) (`drawer.styles.ts:43`) |
| `bottom` | Same shape, opposite edge (`drawer.styles.ts:44`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Which edge the panel slides from (`drawer.component.ts:107`) |
| `modal` | `boolean` | `true` | Maps to `hasBackdrop`; non-modal drawer has no backdrop, doesn't trap focus, closes on outside click instead of backdrop click (`drawer.component.ts:108`, `:58-62`) |
| `visible` | `boolean` (model / two-way) | `false` | Open/closed state, `[(visible)]` bindable (`drawer.component.ts:109`) |
| `header` | `string \| null` | `null` | Title text; shows the header row if set or if `closable` (`drawer.component.ts:110`) |
| `closable` | `boolean` | `true` | Shows the header close button (`drawer.component.ts:111`) |
| `closeLabel` | `string` | `'Close'` | `aria-label` on the close button (`drawer.component.ts:113`) |
| `class` | `string` | `''` | Extra classes merged onto the panel (`drawer.component.ts:114`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Nothing rendered at `<med-drawer>`'s own location (`host: { class: 'hidden' }`) | — |
| Open | Panel slides in from `position`'s edge over `duration-(--transition-duration-base)` (`drawer.styles.ts:37`) | Backdrop click (if `modal`) / outside click (if not) / Escape / close button all close it |
| Closing | Transform swapped back to the exit class; overlay dispose held for `EXIT_TRANSITION_MS` (200ms, hardcoded to match `--transition-duration-base: 0.2s`) so the slide-out plays before removal (`drawer.component.ts:24-32`, `:166-169`) | `beforeClose` hook delays `OverlayService`'s dispose |
| Focus | Trapped inside when `modal` (default) | `trapFocus` defaults to `hasBackdrop` in `OverlayService` (`overlay.service.ts:305`) |
| Disabled | N/A | — |
| Loading | Not implemented | — |
| Error | N/A | — |

### Accessibility
- **Role/ARIA:** `role="dialog"` set unconditionally on the panel regardless of `modal`; `aria-modal` is `'true'` only when `modal()` is true, else `null`; `aria-labelledby` bound to the header id when `header` is set (`drawer.component.ts:84`) — directly tested by `drawer.component.spec.ts` — `'renders the header and links it via aria-labelledby when set'` and `'omits aria-labelledby and the header row entirely without a header'`. Note: `role="dialog"` is applied even for a non-modal drawer (`modal="false"`) — only `aria-modal` reflects modality, the role itself does not vary; `modal=false` (no backdrop) is directly tested (`'modal=false has no backdrop'`), but the resulting `aria-modal` value for that case is not separately asserted `[not covered by tests]`.
- **Keyboard navigation:** Escape-close is directly tested (`drawer.component.spec.ts` — `'closes on Escape'`), as is backdrop-click-close (`'modal (default) has a backdrop, and clicking it closes the drawer'`). Focus trap while `modal` and focus-restoration-to-trigger on close are both inherited from `OverlayService` defaults but **not exercised by any test** — no Tab-cycling assertion and no `document.activeElement` check post-close anywhere in `drawer.component.spec.ts` `[not covered by tests]`, the same gap documented in `overlay.md`.
- **Screen reader:** No `aria-live` region — relies on `role="dialog"`/focus move like Dialog.

**A11y verdict:** Covered — role/aria-modal/aria-labelledby wiring and Escape/backdrop-close are thoroughly tested (drawer.component.spec.ts has 15+ tests including the exit-transition timing); focus trap and focus-return-to-trigger are now covered at the shared `OverlayService` layer (resolved 2026-08-19), same as Dialog.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `[(visible)]` for two-way binding rather than manually calling open/close methods — there are none exposed on the component instance | Expecting an imperative `open()`/`close()` API like Popover/Menu — Drawer is driven purely by the `visible` model |
| Set `modal="false"` for a drawer that shouldn't block the rest of the page | Assuming a non-modal drawer still gets `role="dialog"` semantics suppressed — the role stays, only `aria-modal` changes |
| Trust that focus-trap/focus-restore are regression-proofed — covered at the shared `OverlayService` layer (resolved 2026-08-19), not re-tested per consumer | Assume `drawer.component.spec.ts`'s 15+ passing tests alone prove keyboard focus behavior — none of them touch Tab order or post-close `activeElement`; that lives one layer down |

### Code example (Angular)
```html
<!-- projects/showcase/src/app/app.html:774-808 -->
<button medButton type="button" variant="outlined" (click)="drawerLeftOpen = true">Left</button>

<med-drawer [(visible)]="drawerLeftOpen" position="left" header="Navigation">
  <nav class="flex flex-col gap-1">
    <button medButton type="button" variant="text" class="justify-start">Dashboard</button>
    <button medButton type="button" variant="text" class="justify-start">Projects</button>
    <button medButton type="button" variant="text" class="justify-start">Settings</button>
  </nav>
</med-drawer>

<med-drawer [(visible)]="drawerNonModalOpen" position="right" [modal]="false" header="Non-modal">
  <p>No backdrop, doesn't trap focus — closes on Escape or a click outside the panel.</p>
</med-drawer>
```

### Source
- `projects/medra/ui/src/lib/drawer/drawer.component.ts`
- `projects/medra/ui/src/lib/drawer/drawer.styles.ts`
- `projects/medra/ui/src/lib/overlay/overlay.service.ts` (underlying primitive)
