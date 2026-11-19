## Component: ConfirmPopup

### Description
ConfirmPopup is an **imperative service** (`ConfirmPopupService`) with the same icon + message + Accept/Reject shape as ConfirmDialog, but anchored to a trigger element via `OverlayService.openConnected()` (non-modal, no backdrop — like Popover/Menu) instead of `DialogService`'s modal, centered stack (`projects/medra/ui/src/lib/confirm-popup/confirm-popup.service.ts:19-32`). Use it for a lightweight "are you sure?" next to the control that triggered it (e.g. a row's delete icon button); use ConfirmDialog when the action warrants blocking the whole page.

### Variants
| Variant (`severity`) | When to use |
|---|---|
| `info` (default) | Neutral confirmation |
| `success` | Positive confirmation |
| `warn` | Cautionary confirmation |
| `danger` | Destructive action; accept button defaults to `danger` severity (`confirm-popup.service.ts:39`) |

### Props (Angular Inputs/Outputs)
Invoked via `ConfirmPopupService.confirm(origin: HTMLElement, options: ConfirmPopupOptions)` — `origin` is the triggering element, read from the caller's own click handler (same convention as Menu/Popover's `open()`):

| Property | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | required | (`confirm-popup.types.ts:5`) |
| `severity` | `'info' \| 'success' \| 'warn' \| 'danger'` | `'info'` | Drives icon + default accept color (`confirm-popup.types.ts:7`) |
| `icon` | `string` | severity-derived | (`confirm-popup.types.ts:9`) |
| `acceptLabel` | `string` | `'Yes'` | (`confirm-popup.types.ts:11`) |
| `rejectLabel` | `string` | `'No'` | (`confirm-popup.types.ts:13`) |
| `acceptSeverity` | `ButtonSeverity` | `severity === 'danger' ? 'danger' : 'primary'` | (`confirm-popup.types.ts:15`) |
| `rejectSeverity` | `ButtonSeverity` | `'secondary'` | (`confirm-popup.types.ts:17`) |

`confirm()` returns an `OverlayHandle<ConfirmPopupContentComponent, boolean>`; `closed$` resolves `true`/`false`/`undefined` (dismissed via Esc or outside click — there is no backdrop) (`confirm-popup.service.ts:41-57`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Not rendered | — |
| Open | `w-72` panel (`rounded-lg border bg-surface-0 p-4 shadow-overlay-lg`) anchored to `origin` (`confirm-popup.service.ts:7-17`) | Escape or a click outside the panel closes it (no backdrop, so no backdrop-click path — `overlay.service.ts:344-357`) |
| Focus | Reject button explicitly focused on open | `ConfirmPopupContentComponent.ngAfterViewInit()` calls `rejectButtonRef().nativeElement.focus()` (`confirm-popup-content.component.ts:47-49`) — "dismissal is the safe default," same reasoning native `confirm()` dialogs use, particularly relevant since `acceptSeverity` often ends up `danger` |
| Disabled | N/A | — |
| Loading | Not implemented | — |
| Error | N/A | — |

### Accessibility
- **Role/ARIA — resolved 2026-08-19:** `ConfirmPopupContentComponent`'s host now sets `role="alertdialog"` (the ARIA APG role for a modal-ish confirm/alert prompt, as opposed to plain `dialog`) plus `[attr.aria-describedby]` pointing at the message paragraph's `id` (`confirm-popup-content.component.ts:28-39,55`). There's no separate header/title element here (unlike `ConfirmDialogContentComponent`, which gets one from `DialogShellComponent`), so the message itself is what the role's accessible description resolves to. Directly tested by `confirm-popup.service.spec.ts` — `'has role="alertdialog" with aria-describedby pointing at the message'`.
- **Keyboard navigation:** Escape-close is directly tested (`confirm-popup.service.spec.ts` — `'resolves closed$ with undefined when dismissed via Escape'`). Reject getting initial focus on open is also directly tested — `confirm-popup.service.spec.ts` — `'focuses the reject button on open (dismissal is the safe default)'` asserts `document.activeElement === rejectButton()`. No focus trap (`trapFocus` defaults to `hasBackdrop`, which is `false` here) — untested but consistent with the non-modal design. `ConfirmPopupService.confirm()` passes `restoreFocus: true` explicitly (`confirm-popup.service.ts:43`), matching `OverlayService`'s own default; that restoration mechanism is **directly tested at the shared `OverlayService` layer (resolved 2026-08-19)** rather than re-verified per consumer — see `overlay.md`.
- **Screen reader:** No `aria-live` region — the `role="alertdialog"` plus the explicit Reject focus move on open are what surface the popup's arrival to assistive tech instead.

**A11y verdict:** Covered — initial-focus-on-Reject and Escape-dismiss are both directly and explicitly tested (best-covered case in this batch for that behavior), focus-restoration-to-origin is covered at the shared `OverlayService` layer (resolved 2026-08-19), and **the panel now carries its own `role="alertdialog"`/`aria-describedby` (resolved 2026-08-19)**, all with dedicated test coverage.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Pass the actual clicked element as `origin` (e.g. `event.currentTarget`) | Reusing a stale/unrelated element reference as `origin` — positioning is computed relative to it |
| Use ConfirmPopup for a single-row/single-control confirmation | Using ConfirmPopup for a page-wide destructive action that should block interaction — use ConfirmDialog instead |
| Rely on the panel's `role="alertdialog"` + `aria-describedby` to announce the prompt and its message to assistive tech | Assuming the popup's opening goes fully unannounced — the panel now carries its own ARIA role (`confirm-popup-content.component.ts:28-39,55`) |

### Code example (Angular)
```ts
// projects/showcase/src/app/app.ts:763-772
protected openConfirmPopupDelete(event: MouseEvent): void {
  const handle = this.confirmPopupService.confirm(event.currentTarget as HTMLElement, {
    message: 'Delete this row?',
    severity: 'danger',
    acceptLabel: 'Delete',
  });
  handle.closed$.subscribe((confirmed) => {
    this.confirmPopupResult.set(confirmed === undefined ? 'dismissed (Esc/outside click)' : confirmed ? 'accepted delete' : 'rejected');
  });
}
```
```html
<!-- projects/showcase/src/app/app.html:620-629 -->
<button medButton type="button" severity="danger" variant="outlined" (click)="openConfirmPopupDelete($event)">
  <med-icon name="trash" />
  Delete row&hellip;
</button>
<p>Result: {{ confirmPopupResult() }}</p>
```

### Source
- `projects/medra/ui/src/lib/confirm-popup/confirm-popup.service.ts`
- `projects/medra/ui/src/lib/confirm-popup/confirm-popup.types.ts`
- `projects/medra/ui/src/lib/confirm-popup/confirm-popup-content.component.ts`
- `projects/medra/ui/src/lib/overlay/overlay.service.ts` (underlying primitive)
