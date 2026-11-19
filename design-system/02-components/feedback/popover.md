## Component: Popover

### Description
Popover is a **template component** (`med-popover`), declared once and toggled imperatively — same declared-once shape as Menu, but for arbitrary consumer-authored content instead of a fixed `items` data list (`projects/medra/ui/src/lib/popover/popover.component.ts:16-26`). Like Drawer, its own template is entirely an `<ng-template>` (`host: { class: 'hidden' }`) attached to the overlay via `OverlayService.openConnectedTemplate()` only once opened. Non-modal (no backdrop), same as Menu/Select/Tooltip: closes on Escape or a click outside the panel. **Scope cut for v1**: no built-in header or close button — content decides its own chrome (`popover.component.ts:42-46`).

### Variants
Popover has no severity/style variant — it renders whatever content is projected into it. The only structural option is `positions`, a raw CDK `ConnectedPosition[]` override (`popover.component.ts:63`), falling back to `OverlayService`'s default below-trigger-with-above-fallback positions if not set.

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `positions` | `ConnectedPosition[] \| null` | `null` (uses `OverlayService` default) | Custom CDK connected-position list (`popover.component.ts:63`) |
| `ariaLabel` | `string \| null` | `null` | Labels the panel for assistive tech (`aria-label` on the overlay pane) — unlabeled unless set (`popover.component.ts:65`) |

Popover exposes no `@Input`/`@Output` for open/close — it's driven by calling methods on the component instance via a template reference variable:

| Method | Description |
|---|---|
| `toggle(origin: HTMLElement)` | Opens if closed, closes if open (`popover.component.ts:71-77`) |
| `open(origin: HTMLElement)` | Opens anchored to `origin`; no-ops if already open (`popover.component.ts:79-95`) |
| `close()` | Closes the panel (`popover.component.ts:97-99`) |
| `isOpen` (getter) | Whether the panel is currently open (`popover.component.ts:67-69`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Nothing rendered at `<med-popover>`'s own location | — |
| Open | `rounded-lg border bg-surface-0 p-4 shadow-overlay-lg` panel connected to the trigger (`popover.component.ts:13`) | Escape or outside click closes it; no backdrop |
| Focus | The overlay pane itself is focused on open (`tabIndex = -1`; `.focus()` called directly) | `popover.component.ts:93-99` — real focus moves onto the pane so Tab reaches projected focusable content from there; the pane now also gets `role="dialog"` and, if `ariaLabel` is set, `aria-label` |
| Disabled | N/A | — |
| Loading | Not implemented | — |
| Error | N/A | — |

### Accessibility
- **Role/ARIA — resolved 2026-08-19:** The overlay pane now gets `role="dialog"` set imperatively alongside its `tabIndex`/`.focus()` call (`popover.component.ts:93-99`) — a general-purpose non-modal panel, not an alert/confirm prompt, so plain `dialog` fits better than `alertdialog` here (contrast `ConfirmPopupContentComponent`'s `alertdialog`). This differs from before, when Popover deliberately forced no role at all. Directly tested by `popover.component.spec.ts` — `'gives the pane role="dialog"'`.
- **Labeling — resolved 2026-08-19:** A new `ariaLabel` input (`popover.component.ts:65`, following the same `input<string | null>(null)` convention as e.g. `DockComponent`'s `ariaLabel`) sets `aria-label` on the pane when provided. Popover's content is arbitrary (unlike `ConfirmPopupContentComponent`, which can point `aria-describedby` at its own fixed message), so there's no built-in heading/message this component could label itself from — labeling stays the consumer's job, but is now wired through rather than unsupported. Directly tested by `popover.component.spec.ts` — `'has no aria-label on the pane by default'`, `'sets aria-label on the pane when ariaLabel is provided'`.
- **Keyboard navigation:** Escape-close is directly tested (`popover.component.spec.ts` — `'closes on Escape'`). Focus moving onto the pane itself on open is also directly tested — `popover.component.spec.ts` — `'moves real focus onto the pane on open'` asserts `document.activeElement === document.querySelector('.cdk-overlay-pane')`; `'projected content stays interactive'` further confirms Tab can reach real focusable content inside. No focus trap (non-modal — `trapFocus` defaults to `hasBackdrop`, which is `false`) — consistent with the non-modal design and not asserted either way. Focus-restoration-to-trigger on close (`OverlayService`'s `restoreFocus: true` default, not overridden here) is **directly tested at the shared `OverlayService` layer (resolved 2026-08-19)** rather than per-consumer — see `overlay.md`.
- **Screen reader:** `role="dialog"` plus an optional `aria-label` now give a screen reader an explicit signal that a labeled panel opened, instead of just the focus move onto an unlabeled pane.

**A11y verdict:** Covered — initial focus-onto-pane is directly and explicitly tested (the best-covered case in this batch for that specific behavior), focus-restoration-on-close is covered at the shared `OverlayService` layer (resolved 2026-08-19), and **the panel now carries its own `role="dialog"` plus an optional consumer-supplied `aria-label` (resolved 2026-08-19)**, both with dedicated tests.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Pass the trigger element to `toggle()`/`open()` from your own click handler (`$event.currentTarget` or a template ref) | Expecting Popover to manage its own trigger button — it only manages the panel |
| Give projected content its own close affordance if needed (calling `pop.close()`) | Assuming a built-in close button — Popover ships none by design |
| Set `ariaLabel` for any non-trivial popover so assistive tech announces its purpose | Assuming the panel is unlabeled by design forever — `ariaLabel` exists now; leaving it unset for a real feature panel is a missed opportunity, not a hard limitation |
| Manually verify focus returns to the trigger element after closing (e.g. via Escape) if that matters for your flow | Assuming `popover.component.spec.ts` covers focus-restoration-on-close — it only verifies the focus move *into* the pane on open, not where focus lands after `close()` |

### Code example (Angular)
```html
<!-- projects/showcase/src/app/app.html:811-834 -->
<button #infoTrigger medButton type="button" variant="outlined" (click)="infoPopover.toggle(infoTrigger)">Show info</button>
<med-popover #infoPopover>
  <div class="flex w-64 flex-col gap-2">
    <h3 class="font-semibold">Storage usage</h3>
    <p class="text-sm text-surface-600 dark:text-surface-300">3.2 GB of 5 GB used.</p>
    <med-progress-bar [value]="64" />
  </div>
</med-popover>

<button #quickAddTrigger medButton type="button" variant="outlined" (click)="quickAddPopover.toggle(quickAddTrigger)">Quick add</button>
<med-popover #quickAddPopover>
  <form class="flex w-72 flex-col gap-3" (submit)="$event.preventDefault(); quickAddPopover.close()">
    <input medInputText type="text" placeholder="Task name" />
    <div class="flex justify-end gap-2">
      <button medButton type="button" variant="text" severity="secondary" (click)="quickAddPopover.close()">Cancel</button>
      <button medButton type="submit">Add</button>
    </div>
  </form>
</med-popover>
```

### Source
- `projects/medra/ui/src/lib/popover/popover.component.ts`
- `projects/medra/ui/src/lib/overlay/overlay.service.ts` (underlying primitive)
