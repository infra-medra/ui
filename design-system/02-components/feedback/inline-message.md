## Component: InlineMessage

### Description
`InlineMessageComponent` (`med-inline-message`) is a compact icon + short text pairing meant to sit directly next to a form field (e.g. a validation hint), unlike `MessageComponent`'s bordered/padded card — no background, no border, no close button; `inline-flex` instead of `block` (`projects/medra/ui/src/lib/inline-message/inline-message.component.ts:14-22`). Reuses `MESSAGE_SEVERITY_ICON` from `message.styles.ts` for the icon — the same severity → icon mapping Message/Toast already establish — rather than a second parallel map (`inline-message.component.ts:19,3`).

### Variants
| Variant | When to use |
|---|---|
| `severity="info"` | Neutral/informational hint |
| `severity="success"` | Confirms a valid/successful state |
| `severity="warn"` | Non-blocking warning |
| `severity="danger"` | Validation error |

(4 severities — a subset of Button's 8-value severity vocabulary, sharing only the 4 that map to `MessageSeverity`, `message.styles.ts:3`.)

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `severity` | `MessageSeverity` (`'info'\|'success'\|'warn'\|'danger'`) | `'info'` | `inline-message.component.ts:37` |
| `class` | `string` (aliased) | `''` | `inline-message.component.ts:38` |

Content is projected via `<ng-content />` (`inline-message.component.ts:32`) — no `message`/`text` input.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Icon + text colored per severity (e.g. `text-danger-600 dark:text-danger-400`) | — | `inline-message.component.ts:7-12` |
| Hover | N/A — non-interactive | — |
| Focus | N/A — non-interactive, not focusable | — |
| Active | N/A | — |
| Disabled | Not implemented — no `disabled` input | — |
| Loading | Not implemented | — |
| Error | Use `severity="danger"` — there's no separate "error state," severity itself carries that meaning | — |

### Accessibility
- **Role/ARIA:** Host has `role="status"` and `aria-live="polite"` unconditionally (`inline-message.component.ts:27`) — every InlineMessage announces itself to assistive tech when its content changes, appropriate for validation hints appearing/disappearing dynamically. **Directly tested**, resolving what Wave 1 left as an inference: `inline-message.component.spec.ts` — `'announces itself as a polite live region'` asserts both `host.getAttribute('role') === 'status'` and `host.getAttribute('aria-live') === 'polite'`.
- **Keyboard navigation:** N/A — not an interactive element.
- **Screen reader:** `aria-live="polite"` on the host means content changes are announced without stealing focus. The Wave 1 `[a confirmar]` note about the icon's `aria-hidden` is now resolved by reading `IconComponent` directly: `icon.component.ts:50` sets `[attr.aria-hidden]="ariaLabel() ? null : 'true'"` — decorative by default unless a consumer passes `ariaLabel`. `InlineMessageComponent`'s template (`inline-message.component.ts:31`) never passes `ariaLabel` to `<med-icon>`, so the severity icon is correctly `aria-hidden="true"` and not exposed redundantly alongside the text. This isn't asserted by `inline-message.component.spec.ts` itself, but is confirmed by source (`icon.component.ts:50`) rather than left as an open question.

**A11y verdict:** Covered — `role="status"`/`aria-live="polite"` are directly tested, and the decorative-icon question Wave 1 left open is now confirmed by source (`IconComponent` hides itself by default when no `ariaLabel` is passed, which is InlineMessage's case).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use next to the specific field it describes (validation hint pattern) | Don't use for page-level or toast-style notifications — that's `Message`/`Toast`'s job |
| Pick `severity` to carry the meaning — there's no separate visual "error" flag | — |

### Code example (Angular)
```html
<med-inline-message severity="danger">Email is required</med-inline-message>
<med-inline-message severity="warn">Password is weak</med-inline-message>
<med-inline-message severity="success">Username is available</med-inline-message>
```
Source: `projects/showcase/src/app/app.html:646-648`

### Source
- `projects/medra/ui/src/lib/inline-message/inline-message.component.ts`
- `projects/medra/ui/src/lib/message/message.styles.ts` (shared `MessageSeverity`/`MESSAGE_SEVERITY_ICON`)
