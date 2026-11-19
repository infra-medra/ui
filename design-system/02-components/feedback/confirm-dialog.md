## Component: ConfirmDialog

### Description
ConfirmDialog is an **imperative service** (`ConfirmDialogService`), built entirely on top of `DialogService` rather than a second overlay implementation — `confirm()` supplies a built-in content component (`ConfirmDialogContentComponent`: icon + message + Accept/Reject buttons) so callers don't hand-roll their own confirmation dialog content (`projects/medra/ui/src/lib/confirm-dialog/confirm-dialog.service.ts:8-19`). Use it for a blocking "are you sure?" that should take over the whole page (contrast with ConfirmPopup, which is anchored/non-modal).

### Variants
| Variant (`severity`) | When to use |
|---|---|
| `info` (default) | Neutral confirmation; accept button gets `primary` severity unless overridden |
| `success` | Positive confirmation |
| `warn` | Cautionary confirmation |
| `danger` | Destructive action; accept button defaults to `danger` severity too (`confirm-dialog.service.ts:26`) |

`severity` also drives the icon via the shared `MESSAGE_SEVERITY_ICON` map (same one Message/Toast/ConfirmPopup use), unless `icon` overrides it (`confirm-dialog.service.ts:34`).

### Props (Angular Inputs/Outputs)
Invoked via `ConfirmDialogService.confirm(options: ConfirmDialogOptions)`:

| Property | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | required | Body text (`confirm-dialog.types.ts:5`) |
| `header` | `string` | `undefined` | Passed through to the underlying Dialog's header (`confirm-dialog.types.ts:6`) |
| `severity` | `'info' \| 'success' \| 'warn' \| 'danger'` | `'info'` | Drives icon + default accept color (`confirm-dialog.types.ts:7`) |
| `icon` | `string` | severity-derived | Overrides the icon name (`confirm-dialog.types.ts:9`) |
| `acceptLabel` | `string` | `'Yes'` | (`confirm-dialog.types.ts:11`) |
| `rejectLabel` | `string` | `'No'` | (`confirm-dialog.types.ts:13`) |
| `acceptSeverity` | `ButtonSeverity` | `severity === 'danger' ? 'danger' : 'primary'` | (`confirm-dialog.types.ts:15`) |
| `rejectSeverity` | `ButtonSeverity` | `'secondary'` | (`confirm-dialog.types.ts:17`) |
| `closable` | `boolean` | `true` | Shows the header close button (`confirm-dialog.types.ts:19`) |
| `closeLabel` | `string` | `'Close'` | (`confirm-dialog.types.ts:21`) |

`confirm()` returns a `DialogRef<boolean>`; `closed$` resolves `true` (Accept), `false` (Reject), or `undefined` (dismissed via Esc/backdrop/header close) (`confirm-dialog.service.ts:16-18`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Not rendered | — |
| Open | Same modal panel as Dialog, with icon + message + two right-aligned buttons (`confirm-dialog-content.component.ts:23-36`) | Inherits Dialog's Escape/backdrop-close/focus-trap behavior |
| Disabled | N/A | — |
| Loading | Not implemented | — |
| Error | N/A — `danger` severity is a visual variant, not an error/validation state | — |

### Accessibility
- **Role/ARIA:** Inherits `role="dialog"` / `aria-modal="true"` from the underlying `DialogShellComponent` (see `dialog.md`) — nothing additional set by `ConfirmDialogContentComponent` itself. Header/message rendering directly tested (`confirm-dialog.service.spec.ts` — `'renders the header and message'`).
- **Keyboard navigation:** Escape-close is directly tested (`confirm-dialog.service.spec.ts` — `'resolves closed$ with undefined when dismissed via Escape'`). Focus trap and focus-restore-on-close are inherited from `OverlayService`/Dialog, and are **directly tested at that shared layer (resolved 2026-08-19)** rather than per-consumer (see `overlay.md`).
- **Initial focus on Accept vs. Reject — resolved 2026-08-19:** `ConfirmDialogContentComponent` now explicitly focuses the Reject button in `ngAfterViewInit()` (`confirm-dialog-content.component.ts:52-58`), the same pattern `ConfirmPopupContentComponent` already used. **Product decision:** for consistency across the whole confirm-family (ConfirmDialog and ConfirmPopup should behave identically for the same interaction), ConfirmDialog now adopts ConfirmPopup's existing "dismissal is the safe default" reasoning — an accidental Enter-press lands on Reject rather than on an accept button that's frequently `severity: 'danger'`. Directly tested by `confirm-dialog.service.spec.ts` — `'focuses the reject button on open (dismissal is the safe default, consistent with ConfirmPopup)'`. Note: `DialogShellComponent`'s own focus trap (`OverlayService.openWithStrategy` → `FocusTrapFactory.focusInitialElementWhenReady()`) also independently lands on the first tabbable element once the view stabilizes — since Reject is first in DOM order, that trap behavior agrees with the explicit `focus()` call rather than fighting it, but the explicit call is what makes the choice deliberate and tested instead of an accident of markup order.
- **Screen reader:** No `aria-live` region — relies on modal `role="dialog"` + focus move, same as Dialog.

**A11y verdict:** Covered — accept/reject wiring, severity-driven button color, and Escape-dismiss are all directly tested; focus trap/focus-restore are covered at the shared `OverlayService` layer (resolved 2026-08-19); and **initial focus now deliberately lands on Reject (resolved 2026-08-19)**, matching ConfirmPopup for consistency across the confirm-family, with a dedicated test.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `severity: 'danger'` for destructive confirmations to get a red accept button automatically | Manually setting `acceptSeverity: 'danger'` and `severity: 'info'` when the action really is destructive — the icon would mismatch the button color |
| Subscribe to `closed$` and branch on `true`/`false`/`undefined` explicitly | Treating any falsy/undefined `closed$` value as "rejected" — `undefined` means dismissed, not rejected |
| Rely on Reject having initial focus on open — it's deliberate and tested (`confirm-dialog-content.component.ts:52-58`) | Assuming ConfirmDialog and ConfirmPopup could differ in which button gets initial focus — they're now kept consistent on purpose |

### Code example (Angular)
```ts
// projects/showcase/src/app/app.ts:740-750
protected openConfirmDialogDelete(): void {
  const ref = this.confirmDialogService.confirm({
    header: 'Delete invoice-042.pdf?',
    message: "This can't be undone.",
    severity: 'danger',
    acceptLabel: 'Delete',
  });
  ref.closed$.subscribe((confirmed) => {
    this.confirmDialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'accepted delete' : 'rejected');
  });
}
```
```html
<!-- projects/showcase/src/app/app.html:606-618 -->
<button medButton type="button" severity="danger" variant="outlined" (click)="openConfirmDialogDelete()">
  <med-icon name="trash" />
  Delete (danger severity)&hellip;
</button>
<p>Result: {{ confirmDialogResult() }}</p>
```

### Source
- `projects/medra/ui/src/lib/confirm-dialog/confirm-dialog.service.ts`
- `projects/medra/ui/src/lib/confirm-dialog/confirm-dialog.types.ts`
- `projects/medra/ui/src/lib/confirm-dialog/confirm-dialog-content.component.ts`
- `projects/medra/ui/src/lib/dialog/dialog.service.ts` (underlying primitive)
