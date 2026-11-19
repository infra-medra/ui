## Component: Password

### Description
`Password` (`med-password`) is a real `<input type="password">` (swapped to `type="text"` only while the mask-reveal button is toggled on), keeping native masking behavior rather than reimplementing it — same reasoning InputText applies to staying native. Two optional features layer on top: `toggleMask` adds a show/hide eye-icon button, and `feedback` opens a small non-interactive overlay panel on focus showing a 3-segment strength meter classified via configurable `mediumRegex`/`strongRegex` against the live value. The feedback panel never steals DOM focus from the input (`trapFocus: false`, `restoreFocus: false`), so it closes on the input's own blur. Implements `ControlValueAccessor`. `projects/medra/ui/src/lib/password/password.component.ts:13-24`

### Variants
| Variant | When to use |
|---|---|
| Plain (no `toggleMask`, no `feedback`) | Minimal masked password field. |
| `toggleMask` | Adds a show/hide button so users can verify what they typed. `projects/medra/ui/src/lib/password/password.component.ts:56-66` |
| `feedback` | Adds a live strength-meter overlay panel on focus. `projects/medra/ui/src/lib/password/password.component.ts:116-138` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `toggleMask` | `boolean` | `false` | Shows the reveal/hide button. `projects/medra/ui/src/lib/password/password.component.ts:74` |
| `feedback` | `boolean` | `false` | Enables the strength-meter overlay panel on focus. `projects/medra/ui/src/lib/password/password.component.ts:75` |
| `mediumRegex` | `RegExp` | `DEFAULT_MEDIUM_REGEX` | Pattern for "medium" strength classification. `projects/medra/ui/src/lib/password/password.component.ts:76` |
| `strongRegex` | `RegExp` | `DEFAULT_STRONG_REGEX` | Pattern for "strong" strength classification. `projects/medra/ui/src/lib/password/password.component.ts:77` |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Shared field-token size scale (reuses `inputTextVariants`). `projects/medra/ui/src/lib/password/password.component.ts:78` |
| `invalid` | `boolean` | `false` | Error styling + `aria-invalid`. `projects/medra/ui/src/lib/password/password.component.ts:79` |
| `disabled` | `boolean` | `false` | Disables the input and toggle button. `projects/medra/ui/src/lib/password/password.component.ts:80` |
| `placeholder` | `string` | `''` | Placeholder text. `projects/medra/ui/src/lib/password/password.component.ts:81` |
| `inputId` | `string \| null` | `null` | `id` for the inner `<input>`. `projects/medra/ui/src/lib/password/password.component.ts:82` |
| `showLabel` / `hideLabel` | `string` | `'Show password'` / `'Hide password'` | `aria-label` for the toggle button in each state (English default). `projects/medra/ui/src/lib/password/password.component.ts:84-85` |
| `promptLabel` | `string` | `'Please enter a password'` | Feedback panel text when strength is `none`. `projects/medra/ui/src/lib/password/password.component.ts:86` |
| `weakLabel` / `mediumLabel` / `strongLabel` | `string` | `'Weak'` / `'Medium'` / `'Strong'` | Feedback panel strength labels. `projects/medra/ui/src/lib/password/password.component.ts:87-89` |
| `class` | `string` | `''` | Extra classes merged onto the inner `<input>`. `projects/medra/ui/src/lib/password/password.component.ts:90` |

No `@Output()`s; value flows through `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Standard field chrome (shared `inputTextVariants`), masked by default | — |
| Hover | Border darkens (inherited); toggle button text darkens `hover:text-surface-600`/dark `hover:text-surface-300` | `projects/medra/ui/src/lib/password/password.component.ts:59` |
| Focus | Border `border-brand-500` + ring; if `feedback` is set, opens the strength panel and sets `aria-describedby` to the panel id | `projects/medra/ui/src/lib/password/password.component.ts:46,116-138` |
| Active | Not implemented | — |
| Disabled | `opacity-(--opacity-disabled)`, `cursor-not-allowed`; toggle button also disabled | `disabled` input or Reactive Forms `setDisabledState()`; focus handler no-ops when disabled. `projects/medra/ui/src/lib/password/password.component.ts:96,117` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500` styling | `aria-invalid="true"` set when `invalid()` is true. `projects/medra/ui/src/lib/password/password.component.ts:45,79` |

### Accessibility
- **Role/ARIA — resolved 2026-08-19:** Input has `aria-invalid` and, while the feedback panel is open, `aria-describedby` pointing at the panel's generated id. The feedback panel itself has `role="status"` (announces strength changes to assistive tech) and its own id. The toggle button has a dynamic `aria-label` (`showLabel`/`hideLabel` depending on masked state). `projects/medra/ui/src/lib/password/password.component.ts:45-46,61`, `projects/medra/ui/src/lib/password/password-feedback-panel.component.ts:18`. The toggle button's `aria-label` swap (`'Show password'` ↔ `'Hide password'`) is verified by `password.component.spec.ts` — `'toggleMask reveals/hides the value and swaps the input type'`. `aria-invalid` and `aria-describedby` themselves — both bindings already existed in source, only untested — are now directly asserted: `password.component.spec.ts` — `'sets aria-invalid when invalid is true, and omits it otherwise (Wave 2 test-coverage fix — the binding already existed, untested)'` and `'sets aria-describedby to the feedback panel id only while the panel is open, and clears it on blur (Wave 2 test-coverage fix — the binding already existed, untested)'` (the latter also confirms the id in `aria-describedby` matches the panel's actual rendered `id`, not just that some string is present).
- **Keyboard navigation — resolved 2026-08-19:** No custom keydown handling found beyond native input/button behavior (none needed — the toggle is a real `<button type="button">`, so Enter/Space activation is native for free). Previously only exercised via `.click()`; now directly proven via a dispatched keyboard event: `password.component.spec.ts` — `'the toggle button is a native <button type="button">, and a keyboard-triggered activation (Enter/Space, which a real browser turns into a click with no directive keydown handling to interfere) toggles the mask exactly like a mouse click'`. Toggling mask refocuses the input (`triggerRef().nativeElement.focus()`). `projects/medra/ui/src/lib/password/password.component.ts:145-148`
- **Screen reader:** Feedback panel uses `role="status"` so strength changes are announced live — verified by `password.component.spec.ts` — `'feedback opens a strength panel on focus and closes it on blur'` (asserts the panel's text content updates from the prompt label to `"Strong"` as the value changes) and `'does not open a feedback panel by default'` (confirms `feedback` is opt-in). The panel does **not** steal DOM focus on open — `'does not steal DOM focus when opening the feedback panel'` explicitly asserts `document.activeElement` stays on the input. The panel is explicitly non-interactive/non-focusable ("nothing inside is interactive or focusable" per code comment). `projects/medra/ui/src/lib/password/password-feedback-panel.component.ts:7-13`

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: `aria-invalid`/`aria-describedby` were always correctly wired in source and are now directly spec-asserted, and the toggle button's keyboard (not just click) activation is now directly proven via a dispatched `KeyboardEvent`. The feedback panel's `role="status"` behavior and non-focus-stealing design were already well tested.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `feedback` together with custom `mediumRegex`/`strongRegex` if the app has specific password-policy rules to reflect in the meter. | Don't treat the strength meter as a validator — it's purely informational (`role="status"`, non-interactive) and doesn't block form submission on its own. |
| Pair `toggleMask` for any password field where users are likely to mistype (mobile, first-time signup). | Don't assume the feedback panel traps focus — it deliberately doesn't, so don't expect Tab to reach it. |
| Trust `writeValue(null)` to render as an empty field, not the literal text `"null"` (`password.component.spec.ts` — `'writeValue(null) shows an empty input, not a stray "null"'`) and trust the toggle button's native Enter/Space activation — both are now directly spec-verified. | Don't add a redundant keydown handler to the toggle button — it's a native `<button>`, and keyboard activation is already free and spec-proven (`'the toggle button is a native <button type="button">...'`). |

### Code example (Angular)
```html
<med-password toggleMask feedback placeholder="With toggle + strength feedback" [(ngModel)]="passwordDemoValue" name="demo-password" />
<med-password toggleMask placeholder="Toggle only" [(ngModel)]="passwordToggleDemoValue" name="demo-password-toggle" />
<med-password placeholder="Plain" />
```

### Source
- `projects/medra/ui/src/lib/password/password.component.ts`
- `projects/medra/ui/src/lib/password/password.styles.ts`
- `projects/medra/ui/src/lib/password/password-feedback-panel.component.ts`
- `projects/medra/ui/src/lib/password/password-strength.ts`
- Usage: `projects/showcase/src/app/app.html:242-247`
