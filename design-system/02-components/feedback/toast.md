## Component: Toast

### Description
Toast is an **imperative service** (`ToastService`), the ephemeral counterpart to Message — "Message/Toast" share the same severity card styling, just a different lifecycle/host (`projects/medra/ui/src/lib/message/message.component.ts:7-11`). Calling `show()`/`info()`/`success()`/`warn()`/`error()` lazily creates a single, persistent `ToastContainerComponent` (via `OverlayService.openGlobal`, position `'top-right'`, never disposed for the app's lifetime) that stacks active messages, each rendered as a `med-message` (`projects/medra/ui/src/lib/toast/toast.service.ts:13-32`, `:54-66`). Reuses `OverlayService` with no backdrop/focus-trap/outside-click-close — a toast stack must not block or get dismissed by interaction with the rest of the page (comment at `toast.service.spec.ts` context / `toast.service.ts:6-12`).

### Variants
| Variant (`severity`) | When to use |
|---|---|
| `info` (default) | Neutral notification |
| `success` | Confirms a completed action |
| `warn` | Cautionary notice |
| `danger` | Error notification (`toastService.error()` maps to this) |

Severity drives both the icon (`MESSAGE_SEVERITY_ICON`) and the card color via `messageCardVariants` (`message.styles.ts:6-19`, `:27-39`), since Toast renders through `MessageComponent`.

### Props (Angular Inputs/Outputs)
Invoked via `ToastService.show(options: ToastOptions)` (or the `info`/`success`/`warn`/`error` shorthands):

| Property | Type | Default | Description |
|---|---|---|---|
| `severity` | `'info' \| 'success' \| 'warn' \| 'danger'` | `'info'` | (`toast.types.ts:4`) |
| `summary` | `string` | `undefined` | Bold heading line, rendered only if provided (`toast-container.component.ts:34-36`) |
| `detail` | `string` | `undefined` | Body line (`toast.types.ts:6`) |
| `life` | `number` | `3000` | Auto-dismiss delay in ms; `0` means sticky (no auto-dismiss) (`toast.types.ts:8`, `toast-container.component.ts:51-54`) |
| `closable` | `boolean` | `true` | Shows the close button (`toast.types.ts:10`) |
| `closeLabel` | `string` | `'Close'` | (`toast.types.ts:12`) |

`ToastService.dismiss(id)` closes a specific toast early.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Not rendered until first `show()`/`info()`/etc. call | — |
| Shown | Stacked `med-message` cards, `pointer-events-auto shadow-overlay-sm`, inside a `pointer-events-none` container so empty stack space doesn't block clicks (`toast-container.component.ts:20-33`) | Appears at `top-right`; auto-dismisses after `life` ms unless `life: 0` |
| Sticky | Same visual | `life: 0` — no timer set, closes only via the close button or an explicit `dismiss(id)` call (`toast-container.component.ts:51-54`) |
| Closing | N/A — removed immediately from the list on dismiss | `dismiss()` clears the timer and filters the message out (`toast-container.component.ts:57-64`) |
| Disabled | N/A | — |
| Loading | Not implemented | — |
| Error | `danger` severity variant — see Variants | — |

### Accessibility
- **Role/ARIA — container values now directly asserted (resolved 2026-08-19):** The container itself is `role="region"` `aria-live="polite"` (`toast-container.component.ts:20-24`), now directly tested by `toast.service.spec.ts` — `'the container is a role="region" aria-live="polite" landmark'` (previously only the behavior those attributes enable was tested, not the attribute values).
- **Per-toast severity escalation — resolved 2026-08-19:** Each individual `med-message` inside the container independently carries its own `role`/`aria-live`, computed from `severity()` in `MessageComponent` itself (`message.component.ts:23-28,62-63`) rather than fixed: `danger` (error) toasts now escalate to `role="alert"` `aria-live="assertive"`, every other severity stays `role="status"` `aria-live="polite"`. This lives on `MessageComponent`'s own host — a live region's politeness is resolved by the nearest ancestor that declares one, so escalating from a wrapper in the toast container wouldn't reach the actual content; it has to be the innermost element. Directly tested by `toast.service.spec.ts` — `'an info/success toast stays role="status" aria-live="polite" on its own message'`, `'error() escalates the per-toast message to role="alert" aria-live="assertive"'` (and mirrored generically in `message.component.spec.ts`). The container/message nesting (`region` > `status`/`alert`, mixed politeness) remains, but is now a deliberate, tested structure rather than an unaddressed question.
- **Escape does not close a toast** — `ToastService` explicitly passes `closeOnEscape: false` when creating the container (`toast.service.ts:59`), unlike every other overlay in this batch, and this is directly tested (`toast.service.spec.ts` — `'does not close on Escape (only individual messages dismiss)'`).
- **Keyboard navigation:** No focus trap (non-modal) and no Escape-to-close, both directly tested (`'has no backdrop and is not modal (a page click elsewhere must not dismiss it)'`, `'does not close on Escape'`); the close button (if `closable`) is a normal tab-reachable button, and per-toast close is tested (`'clicking a message close button removes only that message'`).
- **Screen reader:** `aria-live="polite"` on the container announces new toasts landing in general; each toast's own `med-message` now escalates further for `danger` severity (see above), so an error toast gets a distinct, more urgent announcement than an info/success/warn one.

**A11y verdict:** Covered — the non-modal, non-Escape-closing, auto-dismiss/sticky, and per-toast-dismiss behaviors are all thoroughly tested; the container's `role`/`aria-live` values are now directly asserted (resolved 2026-08-19); and **error-severity toasts now escalate to `role="alert"`/`aria-live="assertive"` on their own message (resolved 2026-08-19)**, with dedicated tests for both the default (`polite`) and escalated (`assertive`) cases.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use the `info`/`success`/`warn`/`error` shorthand methods for the common case | Calling `show()` with a raw `severity` string when a shorthand exists — no functional difference, just consistency |
| Set `life: 0` for a toast the user must actively dismiss | Relying on Escape to dismiss a toast — it's explicitly disabled (`toast.service.ts:59`) |
| Rely on `error()`/`severity: 'danger'` toasts being announced more urgently than info/success/warn ones — it's automatic (`message.component.ts:62-63`) | Assuming every toast severity is announced identically — `danger` now escalates to `role="alert"` `aria-live="assertive"`, the rest stay `role="status"` `aria-live="polite"` |

### Code example (Angular)
```ts
// projects/showcase/src/app/app.ts:774-781
protected showToast(severity: 'info' | 'success' | 'warn' | 'danger'): void {
  const bySeverity = {
    info: () => this.toastService.info('Here is some information.', { summary: 'FYI' }),
    success: () => this.toastService.success('Your changes were saved.', { summary: 'Success' }),
    warn: () => this.toastService.warn('Your session expires soon.', { summary: 'Careful' }),
    danger: () => this.toastService.error('Could not save your changes.', { summary: 'Error', closeLabel: 'Fechar' }),
  };
  bySeverity[severity]();
}
```
```html
<!-- projects/showcase/src/app/app.html:653-661 -->
<button medButton type="button" severity="info" (click)="showToast('info')">Info toast</button>
<button medButton type="button" severity="success" (click)="showToast('success')">Success toast</button>
<button medButton type="button" severity="warn" (click)="showToast('warn')">Warn toast</button>
<button medButton type="button" severity="danger" (click)="showToast('danger')">Error toast</button>
```

### Source
- `projects/medra/ui/src/lib/toast/toast.service.ts`
- `projects/medra/ui/src/lib/toast/toast.types.ts`
- `projects/medra/ui/src/lib/toast/toast-container.component.ts`
- `projects/medra/ui/src/lib/message/message.component.ts` (rendering primitive reused per-toast)
