## Component: InputText

### Description
`InputText` is an attribute directive (`medInputText`) applied directly to a native `<input>` element rather than a wrapping component. It exists so that native input behavior (autocomplete, IME composition, native `type` variants, and the IDL `value`/`disabled` properties Reactive Forms expects) keeps working exactly as consumers expect, without being reimplemented. It implements `ControlValueAccessor` so it works with both template-driven (`ngModel`) and reactive forms. Use it for any single-line text input field (text, search, email, etc.).

### Variants
| Variant | When to use |
|---|---|
| No visual "variant" axis (severity/style) — only `size` and `invalid` state toggles exist. See Props/States below. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Controls padding/font-size via the shared field-token scale. `projects/medra/ui/src/lib/input-text/input-text.directive.ts:34` |
| `invalid` | `boolean` (`booleanAttribute` transform) | `false` | Applies invalid/error styling and sets `aria-invalid`. `projects/medra/ui/src/lib/input-text/input-text.directive.ts:35` |
| `class` | `string` (aliased to native `class`) | `''` | Extra classes merged with the variant classes. `projects/medra/ui/src/lib/input-text/input-text.directive.ts:36` |

No `@Output()`s are declared; the directive relies on the native `input`/`blur` DOM events internally to drive `ControlValueAccessor` (`onChange`/`onTouched`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Border `border-surface-300` / dark `border-surface-600`, `bg-surface-0` | — |
| Hover | Border darkens to `border-surface-400` / dark `border-surface-500` | `projects/medra/ui/src/lib/input-text/input-text.styles.ts:21` |
| Focus | Border becomes `border-brand-500`, focus ring via `--focus-ring-width` | `projects/medra/ui/src/lib/input-text/input-text.styles.ts:22` |
| Active | Not implemented | — |
| Disabled | `opacity-(--opacity-disabled)`, `bg-surface-50`/dark `bg-surface-800`, `cursor-not-allowed` | Native `disabled` attribute; `setDisabledState()` sets the native IDL `disabled` property. `projects/medra/ui/src/lib/input-text/input-text.styles.ts:23`, `projects/medra/ui/src/lib/input-text/input-text.directive.ts:61` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500`, `focus:ring-danger-500`, dark `border-danger-400` | `aria-invalid="true"` is set when `invalid()` is true. `projects/medra/ui/src/lib/input-text/input-text.styles.ts:33`, `projects/medra/ui/src/lib/input-text/input-text.directive.ts:19` |

### Accessibility
- **Role/ARIA:** `aria-invalid` is set to `"true"` when `invalid` is true, otherwise the attribute is removed (`null`), not just falsy — verified by `input-text.directive.spec.ts` — `'applies the default-size field classes'` (asserts `getAttribute('aria-invalid')` is `null` by default) and `'sets border/ring color and aria-invalid when invalid'` (asserts `"true"`). No other ARIA attributes are set by the directive itself. `projects/medra/ui/src/lib/input-text/input-text.directive.ts:19`
- **Keyboard navigation — verified 2026-08-19:** the directive adds no keydown handling of its own; typing is entirely native `<input>` behavior. Confirmed directly rather than assumed: `input-text.directive.spec.ts` — `'a real keyboard keystroke (keydown + input, not just a synthetic "input" dispatch) reaches registerOnChange, proving typing itself needs no directive-level keyboard handling — the native input element already owns it'` dispatches a real `keydown`/`input`/`keyup` sequence (not just the bare synthetic `input` event the other tests use) and asserts it still reaches `registerOnChange` correctly.
- **`aria-describedby` — investigated 2026-08-19, by design (deferred), not a bug:** neither `InputTextDirective` nor any sibling form primitive in this library (`Textarea`, `InputNumber`, `Checkbox`, `RadioButton`, etc.) implements a general "consumer-supplied hint/error id" convention — the one `aria-describedby` usage that exists anywhere in the lib (`PasswordComponent`) is narrowly self-contained (it points at a panel `Password` itself renders and owns both ends of), not a reusable pattern for external hint/error text. Adding one here would mean inventing a brand-new architectural convention (a hint/error-id API) unilaterally in an accessibility-gap-closing pass, which is explicitly out of scope — see `CLAUDE.md`'s "don't invent new patterns when one already exists" guidance. Until the library adopts a shared `FormField`-style wrapper (or similar) that owns hint/error text and generates ids, associating an external error message with an `InputText` remains the consumer's responsibility, the same as it already is for `<label for>` pairing (see the showcase float-label pattern below).
- **Screen reader:** No `aria-label` wiring found in the directive itself; the showcase demonstrates float-label and IFTA-label patterns pairing a `<label for>` with the input's `id`, e.g. `projects/showcase/src/app/app.html:176` (`id="fl-username"` paired with a label), but this is a consumer pattern, not something the directive provides.
- **Form integration (`ControlValueAccessor`):** `writeValue(null)` and `writeValue(undefined)` both render the native value as an empty string rather than the literal text `"null"`/`"undefined"` — `input-text.directive.spec.ts` — `'writeValue(null) and writeValue(undefined) render as an empty string, not the literal text'`. `setDisabledState(true)` sets the native `disabled` IDL property — `input-text.directive.spec.ts` — `'setDisabledState disables the native input'`. Typed input is propagated through `registerOnChange` on the native `input` event — `input-text.directive.spec.ts` — `'emits the typed value through registerOnChange on input events'`. A `FormControl` initialized with `null` renders empty and updates correctly on typing, guarding a real-world regression — `input-text.directive.spec.ts` — `'a FormControl initialized with null renders an empty field and updates on typing (real-world regression)'`.

**A11y verdict:** Covered — **the keyboard gap is resolved 2026-08-19** (typing was always native, now directly verified via a real `keydown`/`input`/`keyup` sequence rather than a bare synthetic `input` event). `aria-describedby` remains **By design (deferred)**, not "Partial": it's genuinely unimplemented across every text-like form primitive in this library, not specific to InputText, and needs a shared hint/error-id convention this library hasn't adopted yet — see the Accessibility section above.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Apply `medInputText` directly on a native `<input>` element so native `type`, `autocomplete`, and IME behavior keep working. | Don't wrap the input in a custom component expecting `InputText` to reimplement native input behavior — it deliberately doesn't. |
| Use `size="sm" \| "default" \| "lg"` to stay on the shared field token scale shared with other form components. | Don't hardcode custom padding/font-size via the `class` input if a built-in `size` value already covers the need. |
| Pair the `invalid` input with real form validation state to get the danger-colored border and `aria-invalid`. | Don't rely on `invalid` alone for accessible error messaging — no `aria-describedby` is wired automatically (by design, see Accessibility above), so an associated error message must be linked manually with your own `id`/`aria-describedby` pair. |
| Trust `writeValue` to normalize `null`/`undefined` `FormControl` values to an empty string automatically (`input-text.directive.spec.ts` — `'writeValue(null) and writeValue(undefined) render as an empty string, not the literal text'`). | Don't add manual `?? ''` guards around a bound `FormControl`/`ngModel` value before passing it to the input — the directive already handles nullish values safely. |

### Code example (Angular)
```html
<input medInputText type="text" placeholder="Default" [(ngModel)]="inputDemoValue" name="demo-input" />
<input medInputText type="text" size="sm" placeholder="Small" />
<input medInputText type="text" size="lg" placeholder="Large" />
<input medInputText type="text" invalid placeholder="Invalid" />
<input medInputText type="text" disabled placeholder="Disabled" value="Disabled" />
```

### Source
- `projects/medra/ui/src/lib/input-text/input-text.directive.ts`
- `projects/medra/ui/src/lib/input-text/input-text.styles.ts`
- Usage: `projects/showcase/src/app/app.html:128-132`
