## Component: InputOtp

### Description
`InputOtp` (`med-input-otp`) renders `length` single-character boxes that together stand in for one control, exposing a plain joined `string` value via `ControlValueAccessor` — the segmented UI is purely a rendering detail. Typing a valid character auto-advances focus to the next box; `Backspace` on an empty box clears and moves back into the previous box. Pasting a full code into any box distributes characters across the remaining boxes. Each box also carries `autocomplete="one-time-code"` to support OS/browser SMS autofill. `integerOnly` (default `true`) rejects non-digit characters at entry; `mask` (default `false`) swaps the displayed character for a dot, per-box. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:6-26`

### Variants
| Variant | When to use |
|---|---|
| `mask` off (default) | Digits shown in plain text — typical OTP entry. |
| `mask` on | Displayed characters replaced with `•` — for a code entered in a shared/visible context. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:52` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `length` | `number` | `6` | Number of character boxes. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:64` |
| `mask` | `boolean` | `false` | Displays `•` instead of the typed character. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:65` |
| `integerOnly` | `boolean` | `true` | Rejects non-digit characters (typed and pasted). `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:66` |
| `disabled` | `boolean` | `false` | Disables all boxes. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:67` |
| `invalid` | `boolean` | `false` | Error styling + `aria-invalid` on every box. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:68` |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Box size (`size-9`/`size-11`/`size-14`). `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:69` |
| `ariaLabel` | `string` | `'One-time code'` | `aria-label` on the boxes' wrapping `role="group"`. English-only default per code comment. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:72` |
| `digitLabel` | `string` | `'Digit'` | Per-box `aria-label` prefix (e.g. "Digit 1"). `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:73` |

No `@Output()`s; value flows through `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Bordered square box, centered bold text | — |
| Hover | Border darkens to `border-surface-400`/dark `border-surface-500` | `projects/medra/ui/src/lib/input-otp/input-otp.styles.ts:11` |
| Focus | Border `border-brand-500` + focus ring | `projects/medra/ui/src/lib/input-otp/input-otp.styles.ts:12` |
| Active | Not implemented | — |
| Disabled | `opacity-(--opacity-disabled)`, `bg-surface-50`/dark `bg-surface-800`, `cursor-not-allowed` on every box | `disabled` input or Reactive Forms `setDisabledState()`; keydown/paste handlers also early-return when disabled. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:84,104,122` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500` on every box | `aria-invalid="true"` set on every box when `invalid()` is true. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:50` |

### Accessibility
- **Role/ARIA:** Boxes are wrapped in `<div role="group" [attr.aria-label]="ariaLabel()">`; each box has its own `aria-label` (`digitLabel() + ' ' + (i + 1)`, e.g. "Digit 1") and `aria-invalid`. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:41,49-50`. `aria-invalid` on every box is verified by `input-otp.component.spec.ts` — `'sets aria-invalid on every box when invalid is true'`.
- **Keyboard navigation:** ArrowLeft/ArrowRight move focus between boxes without altering the value — `input-otp.component.spec.ts` — `'ArrowLeft/ArrowRight move focus without changing the value'` (also asserts `onChange` is never called by pure navigation). Backspace on an empty box clears and refocuses the *previous* box — `'Backspace on an empty box clears and focuses the previous box'`. Typing a valid character auto-advances focus to the next box and commits the joined value — `'typing a digit auto-advances focus to the next box and commits the joined value'`. A rejected (non-digit, when `integerOnly`) character does **not** advance focus — `'rejects non-digit characters when integerOnly (the default)'` explicitly asserts `document.activeElement` stays put. `projects/medra/ui/src/lib/input-otp/input-otp.component.ts:103-118`
- **Screen reader:** Group `aria-label` plus per-box numbered `aria-label`s let a screen reader announce each box individually (e.g. "Digit 3"). Each box also has `autocomplete="one-time-code"` to support platform SMS-code autofill. No `aria-describedby` for external error text found. `[not covered by tests]`
- **Paste handling:** Pasting a full code distributes characters across boxes starting from the pasted-into box and moves focus to the last filled box — `input-otp.component.spec.ts` — `'pasting a full code distributes it across the boxes and focuses the last filled one'`. Pasting mid-sequence (e.g. into box 2) fills only from that box onward, leaving earlier boxes untouched — `'pasting starting mid-way only fills from that box onward, leaving earlier boxes untouched'`. Non-digit characters are stripped from pasted text under `integerOnly` — `'pasting strips non-digit characters when integerOnly'`.
- **Form integration (`ControlValueAccessor`):** `writeValue(null/undefined)` normalizes to all-empty boxes without throwing — `'writeValue(null/undefined) normalizes to all-empty, never throwing'`. `mask` replaces the *displayed* character with `•` while the committed model value stays the real digit — `'mask replaces the displayed character with a dot, but the committed value stays the real digit'`. `setDisabledState`/`disabled` both disable every box and (per the `onKeydown`/`onPaste` early-returns) block keyboard and paste interaction while disabled — `'disabled: boxes are disabled and typing does nothing'`, `'disables via setDisabledState (Reactive Forms disable())'`.

**A11y verdict:** Covered — role/group semantics, per-box `aria-label`s, `aria-invalid`, and the full keyboard/paste/focus-management matrix (including the disabled- and rejected-character edge cases) all have direct spec assertions; the only gap is `aria-describedby` for an external error message, which is unwired and untested.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Rely on `[(ngModel)]`/reactive forms binding to a plain string — don't try to read individual box values directly. | Don't assume the boxes are individually addressable form controls; the whole group is one `ControlValueAccessor`. |
| Use `mask` for codes entered in shared/visible settings. | Don't disable `integerOnly` unless the OTP genuinely contains non-digit characters — pasted text is filtered through it too. |
| Trust `mask` to keep the real digit in the bound model even though the box displays `•` (`input-otp.component.spec.ts` — `'mask replaces the displayed character with a dot, but the committed value stays the real digit'`). | Don't assume pasting into a middle box fills from the start — it fills from that box onward, leaving earlier boxes as-is (`'pasting starting mid-way only fills from that box onward, leaving earlier boxes untouched'`). |

### Code example (Angular)
```html
<med-input-otp [(ngModel)]="inputOtpDemoValue" name="demo-otp" />
<med-input-otp [length]="4" mask size="sm" [(ngModel)]="inputOtpMaskedDemoValue" name="demo-otp-masked" />
<med-input-otp invalid />
<med-input-otp disabled />
```

### Source
- `projects/medra/ui/src/lib/input-otp/input-otp.component.ts`
- `projects/medra/ui/src/lib/input-otp/input-otp.styles.ts`
- Usage: `projects/showcase/src/app/app.html:207-217`
