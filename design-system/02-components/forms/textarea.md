## Component: Textarea

### Description
`Textarea` is an attribute directive (`medTextarea`) applied to a native `<textarea>` element. It reuses the exact same CVA variant function as InputText (`inputTextVariants`) so the field chrome (border/padding/focus/invalid/disabled) is visually identical to `InputText` — only the element and its native multi-line behavior differ. It adds `resize-y` so the textarea is vertically resizable by the user. It implements `ControlValueAccessor` for Reactive/template-driven forms.

### Variants
| Variant | When to use |
|---|---|
| No visual "variant" axis (severity/style) — only `size` and `invalid` state toggles exist, shared with InputText. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Reuses `InputTextSize`; controls padding/font-size via shared field tokens. `projects/medra/ui/src/lib/textarea/textarea.directive.ts:33` |
| `invalid` | `boolean` (`booleanAttribute` transform) | `false` | Applies invalid/error styling and sets `aria-invalid`. `projects/medra/ui/src/lib/textarea/textarea.directive.ts:34` |
| `class` | `string` (aliased to native `class`) | `''` | Extra classes merged with the variant classes. `projects/medra/ui/src/lib/textarea/textarea.directive.ts:35` |

No `@Output()`s declared; relies on native `input`/`blur` DOM events to drive `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Border `border-surface-300` / dark `border-surface-600`, `bg-surface-0`, resizable (`resize-y`) | — |
| Hover | Border darkens to `border-surface-400` / dark `border-surface-500` (from shared `inputTextVariants`) | `projects/medra/ui/src/lib/input-text/input-text.styles.ts:21` |
| Focus | Border becomes `border-brand-500`, focus ring via `--focus-ring-width` | `projects/medra/ui/src/lib/input-text/input-text.styles.ts:22` |
| Active | Not implemented | — |
| Disabled | `opacity-(--opacity-disabled)`, `bg-surface-50`/dark `bg-surface-800`, `cursor-not-allowed` | Native `disabled` attribute; `setDisabledState()` sets the native IDL `disabled` property. `projects/medra/ui/src/lib/textarea/textarea.directive.ts:60` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500`, `focus:ring-danger-500`, dark `border-danger-400` | `aria-invalid="true"` set when `invalid()` is true. `projects/medra/ui/src/lib/textarea/textarea.directive.ts:18` |

### Accessibility
- **Role/ARIA:** `aria-invalid` set to `"true"` when `invalid` is true, otherwise `null`. No other ARIA attributes set by the directive. `projects/medra/ui/src/lib/textarea/textarea.directive.ts:18`; verified by `textarea.directive.spec.ts` — `'sets aria-invalid when invalid'`.
- **Keyboard navigation — verified 2026-08-19:** no keydown handling in the directive; typing is entirely native `<textarea>` behavior, including newlines. Confirmed directly: `textarea.directive.spec.ts` — `'a real keyboard keystroke (keydown + input, not just a synthetic "input" dispatch) reaches registerOnChange, proving typing itself needs no directive-level keyboard handling — the native textarea element already owns it'` dispatches a real `keydown`/`input`/`keyup` sequence and asserts it still reaches `registerOnChange` correctly.
- **`aria-describedby` — investigated 2026-08-19, by design (deferred), not a bug:** same profile as InputText, which this directive shares its field CVA and host bindings with — see `input-text.md`'s Accessibility section for the full investigation. No form primitive in this library implements a general consumer-supplied hint/error-id convention yet; adding one unilaterally here would mean inventing an architectural pattern this pass shouldn't own.
- **Screen reader:** No `aria-label` wiring found in the directive itself.
- **Form integration (`ControlValueAccessor`):** `writeValue` normalizes `null`/`undefined` to an empty string (same `value ?? ''` pattern as InputText), and a `FormControl` initialized with `null` renders empty and updates on typing including multi-line input — `textarea.directive.spec.ts` — `'a FormControl initialized with null renders empty and updates on typing'` (uses `'multi\nline'` as the typed value). `setDisabledState(true)` sets the native `disabled` IDL property — `textarea.directive.spec.ts` — `'setDisabledState disables the native textarea'`.

**A11y verdict:** Covered — **the keyboard gap is resolved 2026-08-19** (typing was always native, now directly verified via a real `keydown`/`input`/`keyup` sequence). `aria-describedby` remains **By design (deferred)**, not "Partial" — identical, library-wide reasoning as InputText, not specific to Textarea.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Apply `medTextarea` on a native `<textarea>` to keep native multi-line editing, resize handle, and `rows`/`cols` behavior. | Don't expect a distinct visual language from InputText — the two share the same CVA and are styled identically apart from `resize-y`. |
| Use the shared `size` values to stay visually consistent with InputText fields in the same form. | Don't hardcode a fixed height that fights the built-in `resize-y` behavior. |
| Trust `writeValue` to normalize `null`/`undefined` `FormControl` values to an empty string, including for multi-line content (`textarea.directive.spec.ts` — `'a FormControl initialized with null renders empty and updates on typing'`). | Don't add manual `?? ''` guards around a bound `FormControl`/`ngModel` value — the directive already handles nullish values, newlines included. |
| Link your own error message manually (own `id` + `aria-describedby`) — `Textarea` doesn't wire this automatically, by design (see Accessibility above). | Assume `invalid` alone gives assistive tech an associated error description — it only sets `aria-invalid`/danger styling. |

### Code example (Angular)
```html
<textarea medTextarea rows="3" placeholder="Tell us more..." [(ngModel)]="textareaDemoValue" name="demo-textarea" class="w-full"></textarea>
```

### Source
- `projects/medra/ui/src/lib/textarea/textarea.directive.ts`
- Shared variant function: `projects/medra/ui/src/lib/input-text/input-text.styles.ts`
- Usage: `projects/showcase/src/app/app.html:255`
