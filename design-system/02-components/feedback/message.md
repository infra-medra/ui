## Component: Message

### Description
Message (`med-message`) is an inline, static status message component — the non-ephemeral half of "Message/Toast" (`projects/medra/ui/src/lib/message/message.component.ts:7-11`). It is purely presentational: it doesn't track its own visibility — closing emits `(closed)` and the consumer decides whether to remove it from their template. Toast reuses the exact same severity card styling (`messageCardVariants`) by rendering `med-message` internally for each queued toast.

### Variants
| Variant (`severity`) | When to use |
|---|---|
| `info` (default) | Neutral informational message — `border-info-200 bg-info-50 text-info-800` (`message.styles.ts:30`) |
| `success` | Positive confirmation — `border-success-200 bg-success-50 ...` (`message.styles.ts:31`) |
| `warn` | Cautionary message — `border-warn-200 bg-warn-50 ...` (`message.styles.ts:32`) |
| `danger` | Error message — `border-danger-200 bg-danger-50 ...` (`message.styles.ts:33`) |

Each severity also picks a matching icon via `MESSAGE_SEVERITY_ICON` (`information-circle`/`check-circle`/`exclamation-triangle`/`x-circle`) (`message.styles.ts:6-11`).

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `severity` | `'info' \| 'success' \| 'warn' \| 'danger'` | `'info'` | (`message.component.ts:41`) |
| `closable` | `boolean` | `false` | Shows a close button (`message.component.ts:42`) |
| `closeLabel` | `string` | `'Close'` | `aria-label` on the close button (`message.component.ts:44`) |
| `class` | `string` | `''` | Extra classes merged onto the card (`message.component.ts:45`) |
| `closed` (output) | `EventEmitter<void>` | — | Emitted when the close button is clicked; the component does not hide itself (`message.component.ts:47`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Tinted card per severity, icon + projected content (`message.component.ts:19-38`) | — |
| Closable | Adds a close (`x-mark`) icon button, `size-6 p-1` (`message.component.ts:23-36`) | Clicking it emits `closed` — consumer must remove the element itself |
| Disabled | N/A — no disabled concept | — |
| Loading | Not implemented | — |
| Error | `danger` severity variant — see Variants | — |

### Accessibility
- **Role/ARIA — now directly asserted (resolved 2026-08-19):** Host carries `role`/`aria-live`, computed from `severity()` via `roleAttr`/`ariaLiveAttr` (`message.component.ts:23-28,62-63`) rather than the previously-static `role="status"`/`aria-live="polite"`: `info`/`success`/`warn` still resolve to `role="status"` `aria-live="polite"` (the same default as before), while `danger` now resolves to `role="alert"` `aria-live="assertive"`. This change was made as the real fix for Toast's error-severity escalation gap (Toast renders each stacked toast as a `med-message`, and a live region's politeness is resolved by the nearest ancestor that declares one — so the escalation has to live here, on the innermost element, not on a Toast-side wrapper); it's additive for Message's own default behavior, since `info`/`success`/`warn` are unchanged. Directly tested by `message.component.spec.ts` — `'severity=%s sets role="%s" and aria-live="%s" on the host'` (info/success/warn → status/polite) and `'severity=danger escalates the host to role="alert" and aria-live="assertive"'`.
- **Keyboard navigation:** No focus trap (not an overlay); the close button, if present, is a normal tab-reachable button with `[attr.aria-label]="closeLabel()"` — presence/absence and the default-vs-custom label are both directly tested (`message.component.spec.ts` — `'has no close button by default'`, `'shows a close button with the default "Close" label when closable'`, `'uses a custom closeLabel'`).
- **Screen reader:** `aria-live="polite"` (or `"assertive"` for `danger`) announces the message when it's first rendered/updated in the DOM. Note: when used inside Toast's container, this creates a live region nested inside another live region (`toast-container.component.ts:20-24` also sets `role="region" aria-live="polite"`) — see the Toast doc, which now documents this as a deliberate, tested structure.

**A11y verdict:** Covered — the component's behavior (severity styling, closable/close-emit contract, class merging) is well tested, and the `role`/`aria-live` host attributes are now both severity-aware (`danger` escalates to `alert`/`assertive`) and directly asserted by tests (resolved 2026-08-19).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Handle `(closed)` to actually remove the message from your template (e.g. `@if`) | Setting `closable` and assuming the message disappears on its own — it only emits an event |
| Pick `severity` to match the actual meaning of the message — `danger` now also escalates the host's `role`/`aria-live` to `alert`/`assertive` | Using `danger` severity for a non-error message just for visual emphasis — it now has an accessibility consequence (more urgent announcement), not just a color |

### Code example (Angular)
```html
<!-- projects/showcase/src/app/app.html:631-640 -->
@if (!messageClosed) {
  <med-message severity="warn" closable (closed)="messageClosed = true">
    Your subscription expires in 3 days.
  </med-message>
}
<med-message severity="success">Payment received, thank you!</med-message>
```

### Source
- `projects/medra/ui/src/lib/message/message.component.ts`
- `projects/medra/ui/src/lib/message/message.styles.ts`
