## Component: InputChips

### Description
`InputChipsComponent` (`med-input-chips`) is a text field that turns each committed entry into a `ChipComponent` instead of holding a single string — value is `readonly string[]`. Unlike MultiSelect (pick many from a known set), this is "type your own list" — string only, for v1 (`projects/medra/ui/src/lib/input-chips/input-chips.component.ts:8-13`). Implements `ControlValueAccessor`. Only `Enter` commits the current text as a new chip; `Backspace` on an empty field removes the last chip — no comma/semicolon splitting of pasted text (`input-chips.component.ts:15-21`).

### Variants
| Variant | When to use |
|---|---|
| `size="sm" \| "default" \| "lg"` | Field-size scale (own `InputChipsSize` type, mirrors `InputTextSize`) |
| `allowDuplicates` | When `true`, repeated exact entries are accepted (default `false` rejects them) |
| `max` | Caps the number of chips; once reached, `Enter` is a no-op |
| `invalid` | Error state |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `''` | Shown only when the value is empty — `input-chips.component.ts:69`, `56` |
| `size` | `InputChipsSize` | `'default'` | `input-chips.component.ts:70` |
| `disabled` | `boolean` | `false` | `input-chips.component.ts:71` |
| `invalid` | `boolean` | `false` | `input-chips.component.ts:72` |
| `ariaLabel` | `string \| null` | `null` | `input-chips.component.ts:73` |
| `allowDuplicates` | `boolean` | `false` | `input-chips.component.ts:75` |
| `max` | `number \| null` | `null` | `input-chips.component.ts:77` |
| `class` | `string` | `''` | `input-chips.component.ts:78` |

Value (via `ControlValueAccessor`) is `readonly string[]`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Bordered wrapper `<div>` (not the focusable element — a real `<input>` inside it takes focus) — `input-chips.component.ts:28-33` (styles doc) | — |
| Hover | `hover:border-surface-400` (`projects/medra/ui/src/lib/input-chips/input-chips.styles.ts:23`) | |
| Focus | `focus-within:border-brand-500 focus-within:ring-(--focus-ring-width)` on the wrapper, since the real `<input>` is unstyled inside it — `input-chips.styles.ts:24` | |
| Active | Chips rendered via `<med-chip removable>`, each with its own `removeLabel` (`'Remove ' + tag`) — `input-chips.component.ts:50` | |
| Disabled | `pointer-events-none bg-surface-50 opacity-(--opacity-disabled)` on the wrapper — `input-chips.styles.ts:46` | Inner `<input [disabled]>` (real `:disabled`); `removeAt`/`commitDraft` no-op — `input-chips.component.ts:112-126` |
| Loading | Not implemented | |
| Error | `border-danger-500 focus-within:border-danger-500` (`input-chips.styles.ts:38`) | `aria-invalid="true"` on the inner input — `input-chips.component.ts:59` |

### Accessibility
- **Role/ARIA:** Inner `<input>` carries `aria-label` (from `ariaLabel`) and `aria-invalid` (`input-chips.component.ts:58-59`) — both spec-verified: `input-chips.component.spec.ts:186-198 — 'sets aria-invalid when invalid is true'` and `'sets aria-label from ariaLabel'`. No `role` on the wrapper. Each chip's remove button gets a per-chip `aria-label` (`'Remove ' + tag`) via `ChipComponent`'s own `removeLabel` input; removing an individual chip via its own button (independent of position) is spec-verified: `input-chips.component.spec.ts:106-116 — "clicking each chip's remove button removes just that one"`.
- **Keyboard navigation:** `Enter` commits the trimmed draft text as a chip and clears the input — `input-chips.component.spec.ts — 'pressing Enter commits...'` and `'trims whitespace and ignores an empty/whitespace-only entry'`. `Backspace` on an *empty* draft removes the last chip, but is correctly a no-op when the draft still has text — both paths spec-verified: `'Backspace on an empty input removes the last chip'` and `'Backspace with text still in the input does not remove a chip'`. Duplicate rejection (`allowDuplicates=false`, default) leaves `Enter` a no-op and the text uncommitted rather than silently dropping it; `allowDuplicates=true` permits the repeat. `max` caps chip count with `Enter` becoming a no-op past the cap. **Keyboard path to remove a non-last chip — resolved 2026-08-19:** each chip's own remove `<button>` (`ChipComponent`'s `removable` affordance) was already Tab-reachable one at a time, but now `ArrowLeft` from an empty input moves focus directly onto the last chip's own remove button, `ArrowLeft`/`ArrowRight` rove focus between chips (mirroring `DockComponent`'s roving-tabindex shape, reusing `ChipComponent.focusRemoveButton()` rather than inventing a parallel focus target), `ArrowRight` off the last chip returns to the input, and `Delete`/`Backspace` on a focused chip removes *that* chip — keeping focus on whichever chip slides into the vacated slot (or the input, if none remain) so repeated Delete/Backspace can walk through several chips without detouring through the input each time. Confirmed by `input-chips.component.spec.ts` under `describe('keyboard path to remove a non-last chip (Wave 2 fix)', ...)` — `'ArrowLeft from an empty input moves focus onto the last chip's remove button'`, `'ArrowLeft/ArrowRight rove focus between chips, and ArrowRight off the last chip returns to the input'`, `'Backspace on a focused, non-last chip removes just that one and keeps focus among the chips'`, `'Delete removes the last remaining chip and returns focus to the input'`, `'disabled: Backspace on a focused chip is a no-op'`. Implementation note: removing an array entry means the `@for`-rendered `viewChildren(ChipComponent)` query only reflects the shrunk list *after* Angular's next change-detection pass, not synchronously within the same keydown handler — `removeFocused()` forces that refresh with an explicit `ChangeDetectorRef.detectChanges()` before reading the post-removal `chipRefs()`, otherwise it would focus a stale, about-to-be-removed chip (`input-chips.component.ts:176-195`).
- **Disabled:** the native input carries real `:disabled`, and both `Enter`/`Backspace` become no-ops — `input-chips.component.spec.ts — 'disabled: the input is disabled and Enter/Backspace are no-ops'`, plus the CVA path `'disables via setDisabledState (Reactive Forms disable())'`; the new per-chip keyboard removal path is disabled-aware too — `'disabled: Backspace on a focused chip is a no-op'`.
- **Focus delegation:** clicking anywhere on the bordered wrapper (not just the inner `<input>`) moves real focus onto the input — `input-chips.component.spec.ts — 'clicking the wrapper focuses the input'` — which is what makes the `focus-within` styling on the wrapper meaningful in practice.
- **Screen reader — `aria-live` resolved 2026-08-19:** a visually-hidden `<span class="sr-only" aria-live="polite">` now announces each commit (`"Added {tag}. N tags total."`) and removal (`"Removed {tag}. N tags remaining."`), sourced from a `liveMessage` signal set inside `commitDraft()`/`remove()` (`input-chips.component.ts:100-101,201-209,232`). `ariaLabel` still labels the whole control. Confirmed by `input-chips.component.spec.ts` under `describe('aria-live announcements (Wave 2 fix)', ...)` — `'announces a commit'`, `'announces a removal'`.
- **A11y verdict:** Covered — **both gaps resolved 2026-08-19**: Enter/Backspace commit-and-remove semantics, duplicate/max guards, disabled no-ops, and per-chip removal were already solidly tested; the `aria-live` announcement and the non-last-chip keyboard removal path (both real implementation gaps, not just missing tests) are now implemented and spec-verified — see Keyboard navigation and Screen reader above.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `ariaLabel` — the control has no visible `<label>` association built in | Don't paste comma-separated text expecting multiple chips — only `Enter` commits, and only the current draft as one chip |
| Use `max` to cap tag count when the domain requires it | Don't expect `ArrowLeft`/`ArrowRight`/`Delete`/`Backspace` on a chip to work from anywhere except: `ArrowLeft` from an *empty* input to enter the chips, then roving between them — it won't trigger mid-draft-text or via Tab |
| Trust that Backspace only ever removes a chip when the draft is truly empty (spec-verified) | Don't assume a screen-reader announcement means the DOM change happened synchronously in the same tick — `liveMessage` updates alongside the array mutation, but visually it's still a value the `aria-live` region merely reflects |
| Trust keyboard-only users can now reach and remove any individual chip — Tab to it or `ArrowLeft` in from the input, then `Delete`/`Backspace` (**resolved 2026-08-19**) | |

### Code example (Angular)
```html
<med-input-chips placeholder="Add a tag..." ariaLabel="Tags" [(ngModel)]="inputChipsDemoValue" name="demo-input-chips" />

<med-input-chips [max]="3" size="sm" placeholder="Up to 3..." ariaLabel="Up to 3 tags" [(ngModel)]="inputChipsMaxDemoValue" name="demo-input-chips-max" />
```
Source: `projects/showcase/src/app/app.html:1044-1049`

### Source
- `projects/medra/ui/src/lib/input-chips/input-chips.component.ts`
- `projects/medra/ui/src/lib/input-chips/input-chips.styles.ts`
