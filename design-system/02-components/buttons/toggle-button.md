## Component: Toggle Button

### Description
A labeled two-state button implementing the WAI-ARIA "pressed button" pattern (`aria-pressed`), not the "switch" pattern ToggleSwitch uses — intended for a state that reads better as text (e.g. "Yes"/"No", "Public"/"Private") than a bare on/off pill (`projects/medra/ui/src/lib/toggle-button/toggle-button.component.ts:7-18`). It reuses Button's own `buttonVariants` CVA directly (`filled`+`primary` when pressed, `outlined`+`secondary` when not — `toggle-button.component.ts:72-78`) instead of a parallel color system. It's a real native `<button>`, so Enter/Space activation is free. Implements `ControlValueAccessor` for `ngModel`/reactive forms integration (`toggle-button.component.ts:50`, `:93-107`).

### Variants
No `variant` input — the visual variant is derived automatically from pressed state (`filled`+`primary` when on, `outlined`+`secondary` when off, `toggle-button.component.ts:75-76`). Only `size` is exposed as a `ButtonSize`.

| State-driven look | When it applies |
|---|---|
| Pressed (`checked === true`) | `filled` + `primary` severity |
| Unpressed (`checked === false`, default) | `outlined` + `secondary` severity |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `onLabel` | `string` | `'Yes'` | Label shown when pressed (`toggle-button.component.ts:52`) |
| `offLabel` | `string` | `'No'` | Label shown when not pressed (`toggle-button.component.ts:53`) |
| `onIcon` | `string \| null` | `null` | Icon shown when pressed (`toggle-button.component.ts:54`) |
| `offIcon` | `string \| null` | `null` | Icon shown when not pressed (`toggle-button.component.ts:55`) |
| `size` | `ButtonSize` | `'default'` | Forwarded to `buttonVariants` (`toggle-button.component.ts:56`) |
| `invalid` | `boolean` | `false` | Adds a danger-colored ring on top of the button styling — now via the shared `INVALID_RING_CLASS` (`button.styles.ts`), previously a duplicated string (`toggle-button.component.ts:57`, `:79`) |
| `disabled` | `boolean` | `false` | Disables the button (`toggle-button.component.ts:58`) |
| `inputId` | `string \| null` | `null` | Sets the native `id` (`toggle-button.component.ts:59`) |
| `class` | `string` | `''` | Extra classes merged onto the button (`toggle-button.component.ts:60`) |
| (CVA, via `ngModel`) `checked` | `boolean` (internal signal, not an `@Input`) | `false` | Bound through `ControlValueAccessor.writeValue` (`toggle-button.component.ts:62`, `:93-95`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (unpressed) | `outlined` + `secondary`, `offLabel`/`offIcon` shown (`toggle-button.component.ts:69-70`, `:75-77`) | — |
| Pressed | `filled` + `primary`, `onLabel`/`onIcon` shown | `aria-pressed="true"` (`toggle-button.component.ts:36`) |
| Hover/Active | Inherited from `buttonVariants` | Pointer only |
| Focus | Inherited `focus-visible:ring-*` from `buttonVariants` | Keyboard-visible; native button also fires `onTouched()` on blur (`toggle-button.component.ts:41`) |
| Disabled | Native `[disabled]`, combines own `disabled` input with forms-driven `setDisabledState` (`toggle-button.component.ts:38`, `:64`, `:105-107`) | `toggle()` no-ops (`toggle-button.component.ts:84-91`) |
| Invalid | `ring-(--focus-ring-width) ring-danger-500` appended (`toggle-button.component.ts:79`); `aria-invalid="true"` (`toggle-button.component.ts:37`) | Purely visual/ARIA — doesn't block interaction |
| Loading | Not implemented | — |

### Accessibility
- **Role/ARIA:** `[attr.aria-pressed]="checked()"` (WAI-ARIA pressed-button pattern), `[attr.aria-invalid]="invalid() ? 'true' : null"` (`toggle-button.component.ts:36-37`) — both directly tested: `toggle-button.component.spec.ts` — `'renders unpressed by default, showing offLabel'`, `'clicking toggles pressed state, label, and pushes the value through onChange'`, `'sets aria-invalid when invalid is true'`.
- **Keyboard navigation:** None custom — native `<button>` gives Enter/Space activation and Tab focus for free (comment at `toggle-button.component.ts:16-18`). Not directly exercised via keyboard events in the spec (only `.click()` is used), but this is standard native `<button>` behavior, same treatment as Button/ToggleButton's siblings. `disabled`/`setDisabledState` (reactive-forms `disable()`) both correctly block toggling and set native `[disabled]`, directly tested (`'does not toggle when disabled, and disables the native button'`, `'disables via setDisabledState (Reactive Forms disable())'`) — unlike SelectButton's per-option buttons, ToggleButton's native `disabled` means the browser's own `:disabled` semantics (focus removal, `disabled:*` CSS) apply for free.

**Ripple adoption (2026-08-19):** `[medRipple]` is now applied to the native button, matching the rest of the Button family — previously only `ButtonDirective` itself had it (see `03-patterns/ripple-interaction.md`). Directly tested: `toggle-button.component.spec.ts` — `'triggers the ripple effect on pointerdown (Ripple adoption)'`.
- **Screen reader:** `onLabel`/`offLabel` text content changes announce the state change; `aria-pressed` additionally communicates the toggle semantics. Text-content swap directly tested (`'supports custom onLabel/offLabel'`), as is the paired icon swap (`'shows onIcon/offIcon matching the current state'`).

**A11y verdict:** Covered — `aria-pressed`/`aria-invalid`, disabled state (both input-driven and forms-driven), and the label/icon text that gives the pressed state its screen-reader-visible meaning are all directly tested; keyboard activation itself relies on untested-but-standard native `<button>` semantics, same as the rest of the Button family.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use for a state that reads as meaningful text pairs ("Public"/"Private") | Using it for a plain on/off boolean that has no natural label pair — consider ToggleSwitch instead (per the component's own doc, `toggle-button.component.ts:7-10`) |
| Register with `[(ngModel)]` and a `name` attribute for forms integration | — |
| Rely on `writeValue(null)`/`writeValue(undefined)` normalizing safely to unpressed | Assuming an uninitialized/nullable form value throws — it doesn't, tested (`toggle-button.component.spec.ts` — `'writeValue(false/null/undefined) all normalize to unpressed, never throwing'`) |

### Code example (Angular)
```html
<med-toggle-button [(ngModel)]="toggleButtonDemoValue" name="demo-toggle-button" />
<med-toggle-button onLabel="Public" offLabel="Private" [(ngModel)]="toggleButtonLockDemoValue" onIcon="lock-open" offIcon="lock-closed" name="demo-toggle-button-lock" />
<med-toggle-button invalid />
<med-toggle-button disabled />
```
(from `projects/showcase/src/app/app.html:115-119`)

### Source
- `projects/medra/ui/src/lib/toggle-button/toggle-button.component.ts`
- Reuses `projects/medra/ui/src/lib/button/button.styles.ts` (`buttonVariants`)
