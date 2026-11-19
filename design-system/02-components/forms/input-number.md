## Component: InputNumber

### Description
`InputNumber` (`med-input-number`) is a numeric text field implemented as a real `<input role="spinbutton">`, following the WAI-ARIA APG "Spin Button" pattern. Keyboard interaction (ArrowUp/Down step by `step`, PageUp/Down step by `step * 10`, Home/End jump to `min`/`max`) is native to the input; the optional `showButtons` pointer affordances call the exact same `stepBy()` path rather than a second source of truth. Typed text is tracked separately from the committed value, so mid-edit strings like `"-"` or `"12."` aren't silently coerced; a value only commits once it parses to a real number within `[min, max]`. `mode`/`currency`/`locale`/fraction-digit inputs pass through to `Intl.NumberFormat` for locale-aware formatting (decimal or currency). It implements `ControlValueAccessor`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:9-30`

### Variants
| Variant | When to use |
|---|---|
| `buttonLayout="stacked"` (default) | Increment/decrement buttons overlay the field's right edge as a half-height chevron column. `projects/medra/ui/src/lib/input-number/input-number.styles.ts:24` |
| `buttonLayout="horizontal"` | Full-height +/- buttons flush against the field's left/right edges, only shown when `showButtons` is set. `projects/medra/ui/src/lib/input-number/input-number.styles.ts:25` |
| `mode="decimal"` (default) vs `mode="currency"` | Switches the `Intl.NumberFormat` mode; currency mode also reads `currency`/`currencyDisplay`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:105-107` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `min` | `number \| null` | `null` | Lower bound; also drives `aria-valuemin`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:102` |
| `max` | `number \| null` | `null` | Upper bound; also drives `aria-valuemax`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:103` |
| `step` | `number` | `1` | Step increment for ArrowUp/Down and the step buttons. `projects/medra/ui/src/lib/input-number/input-number.component.ts:104` |
| `mode` | `InputNumberMode` | `'decimal'` | `Intl.NumberFormat` style. `projects/medra/ui/src/lib/input-number/input-number.component.ts:105` |
| `currency` | `string` | `'USD'` | ISO currency code used when `mode="currency"`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:106` |
| `currencyDisplay` | `InputNumberCurrencyDisplay` | `'symbol'` | How the currency is rendered (symbol/code/name). `projects/medra/ui/src/lib/input-number/input-number.component.ts:107` |
| `locale` | `string` | `'en-US'` | Locale passed to `Intl.NumberFormat`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:108` |
| `minFractionDigits` / `maxFractionDigits` | `number \| null` | `null` | Fraction-digit bounds passed to the formatter. `projects/medra/ui/src/lib/input-number/input-number.component.ts:109-110` |
| `useGrouping` | `boolean` | `true` | Thousands grouping separators. `projects/medra/ui/src/lib/input-number/input-number.component.ts:111` |
| `showButtons` | `boolean` | `false` | Shows stepper buttons. `projects/medra/ui/src/lib/input-number/input-number.component.ts:112` |
| `buttonLayout` | `'stacked' \| 'horizontal'` | `'stacked'` | Button layout, see Variants. `projects/medra/ui/src/lib/input-number/input-number.component.ts:113` |
| `prefix` / `suffix` | `string` | `''` | Text prepended/appended around the formatted number. `projects/medra/ui/src/lib/input-number/input-number.component.ts:114-115` |
| `size` | `InputTextSize` (`'sm' \| 'default' \| 'lg'`) | `'default'` | Shared field-token size scale (reuses `inputTextVariants`). `projects/medra/ui/src/lib/input-number/input-number.component.ts:116` |
| `invalid` | `boolean` | `false` | Error styling + `aria-invalid`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:117` |
| `disabled` | `boolean` | `false` | Disables input and stepper buttons. `projects/medra/ui/src/lib/input-number/input-number.component.ts:118` |
| `placeholder` | `string` | `''` | Placeholder text. `projects/medra/ui/src/lib/input-number/input-number.component.ts:119` |
| `inputId` | `string \| null` | `null` | `id` attribute for the inner `<input>`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:120` |
| `incrementLabel` / `decrementLabel` | `string` | `'Increment'` / `'Decrement'` | `aria-label`s for the stepper buttons (English defaults, no i18n yet per code comment). `projects/medra/ui/src/lib/input-number/input-number.component.ts:122-123` |
| `class` | `string` | `''` | Extra classes merged onto the inner `<input>`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:124` |

No `@Output()`s; value changes flow through `ControlValueAccessor`'s `onChange`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Standard field chrome (shared `inputTextVariants`) | — |
| Hover | Border darkens (inherited from `inputTextVariants`); stepper buttons get `hover:bg-surface-100`/dark `hover:bg-surface-700` | `projects/medra/ui/src/lib/input-number/input-number.styles.ts:17` |
| Focus | Border `border-brand-500` + focus ring; stepper buttons get their own focus ring on `:focus` | `projects/medra/ui/src/lib/input-number/input-number.styles.ts:18` |
| Active | Not implemented | — |
| Disabled | Opacity reduced, `cursor-not-allowed`; stepper buttons also individually disabled when `isDisabled()` | `disabled` input OR forms-driven `setDisabledState()`; buttons additionally auto-disable at `atMin()`/`atMax()`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:130,310-312` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500` styling | `aria-invalid="true"` on the input when `invalid()` is true. `projects/medra/ui/src/lib/input-number/input-number.component.ts:66,117` |

### Accessibility
- **Role/ARIA:** Inner `<input>` has `role="spinbutton"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (raw numeric value), `aria-valuetext` (formatted display string), and `aria-invalid`. Stepper buttons carry `aria-label` from `incrementLabel`/`decrementLabel`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:60-66,81,94`. `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext` are verified together by `input-number.component.spec.ts` — `'sets aria-valuenow/aria-valuemin/aria-valuemax/aria-valuetext'`. **`aria-invalid` — resolved 2026-08-19:** the binding already existed in source; now directly asserted by `input-number.component.spec.ts` — `'sets aria-invalid when invalid is true, and omits it otherwise (Wave 2 test-coverage fix — the binding already existed, untested)'`.
- **Keyboard navigation:** ArrowUp/ArrowDown step by `step` (`input-number.component.spec.ts` — `'ArrowUp/ArrowDown step by `step`'`); PageUp/PageDown step by `step * 10` (`'PageUp/PageDown step by `step * 10`'`); Home/End jump to `min`/`max`, only when those bounds are set (`'Home/End jump to min/max'`); stepping never exceeds `min`/`max` via keyboard (`'does not step past `min`/`max`'`); keyboard stepping is fully inert while disabled (`'does not respond to keyboard stepping while disabled'`). All handled in `onKeydown()`. `projects/medra/ui/src/lib/input-number/input-number.component.ts:198-239`
- **`aria-describedby` — investigated 2026-08-19, by design (deferred), not a bug:** no form primitive in this library implements a general consumer-supplied hint/error-id convention yet (see `input-text.md`'s Accessibility section for the full investigation, which applies library-wide, not just to InputNumber); adding one unilaterally in this pass would mean inventing an architectural pattern out of scope here.
- **Screen reader:** `aria-valuetext` exposes the human-formatted value (with currency/prefix/suffix) rather than the raw number, so screen readers announce e.g. "$19.90" instead of "19.9" — confirmed indirectly by `input-number.component.spec.ts` — `'formats as currency when mode="currency"'` and `'applies prefix and suffix'` (both assert the *displayed* value carries the formatting; `aria-valuetext` is bound to the same `formattedValue()` signal).
- **Form integration (`ControlValueAccessor`):** `writeValue(null)` clears the field to an empty string rather than showing a stray `"null"` — `input-number.component.spec.ts` — `'writeValue(null) shows an empty input, not a stray "null"'`. A typed value that parses **out of `[min, max]` bounds does not commit** (`onChange` is not called) but the raw typed text stays visible until blur, when it reverts to the last committed value — `'does not commit a typed value that parses out of bounds'` and `'reformats from the last committed value on blur, reverting stray text'`. `setDisabledState(true)` disables the native input and blocks keyboard stepping — `'setDisabledState disables the native input'`, `'does not respond to keyboard stepping while disabled'`. Full `FormControl` round-trip (external `setValue`, typed input pushing back) is tested — `'reflects the FormControl value and pushes updates back through it'`.

**A11y verdict:** Covered — **the `aria-invalid` test gap is resolved 2026-08-19** (the binding already existed; now directly asserted). `aria-describedby` remains **By design (deferred)** — a library-wide gap, not specific to InputNumber, pending a shared hint/error-id convention this library hasn't adopted yet.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `min`/`max` when using Home/End keyboard shortcuts or `atMin`/`atMax` button auto-disabling — both are no-ops without bounds. | Don't expect Home/End to jump to bounds if `min`/`max` are left `null`; they're skipped. `projects/medra/ui/src/lib/input-number/input-number.component.ts:219-233` |
| Use `mode="currency"` with `currency` for money fields rather than manually building `prefix`/`suffix` strings. | Don't fight the component by both setting `mode="currency"` and a custom `prefix`. |
| Use `buttonLayout="horizontal"` only together with `showButtons` — layout has no effect otherwise. | Don't assume `buttonLayout` alone renders buttons; `showButtons` must also be true. |
| Expect an out-of-bounds typed value (e.g. typing `42` with `max=10`) to stay visible but not propagate to the model until it's corrected or the field is blurred — `input-number.component.spec.ts` — `'does not commit a typed value that parses out of bounds'`. | Don't assume every keystroke reaches `ngModel`/`FormControl` — only keystrokes that parse to an in-range number call `onChange`; out-of-range or unparseable text is silently held back, then reverted on blur. |
| Pair `invalid` with a manually-linked `aria-describedby` error message if you need accessible error announcements — the component sets `aria-invalid` but has no tested `aria-describedby` wiring. | Don't assume `invalid` alone is sufficient for screen-reader users to learn *why* a field is invalid. |

### Code example (Angular)
```html
<med-input-number [(ngModel)]="inputNumberDemoValue" name="demo-input-number" />
<med-input-number [min]="0" [max]="10" showButtons [(ngModel)]="inputNumberButtonsDemoValue" name="demo-input-number-buttons" />
<med-input-number [step]="0.5" [min]="0" [max]="10" showButtons buttonLayout="horizontal" [(ngModel)]="inputNumberHorizontalDemoValue" name="demo-input-number-horizontal" />
<med-input-number mode="currency" currency="USD" showButtons [(ngModel)]="inputNumberCurrencyDemoValue" name="demo-input-number-currency" />
```

### Source
- `projects/medra/ui/src/lib/input-number/input-number.component.ts`
- `projects/medra/ui/src/lib/input-number/input-number.styles.ts`
- `projects/medra/ui/src/lib/input-number/number-format.ts`
- Usage: `projects/showcase/src/app/app.html:225-231`
