## Component: Select Button

### Description
A connected row of `ToggleButton`-style options driven by data (`options`, the same `SelectOption<T>` shape Select/MultiSelect use) rather than content-projected children (`projects/medra/ui/src/lib/select-button/select-button.component.ts:7-13`). Picking one (or, in `multiple` mode, several) options is rendered as a segmented control. The `multiple` input picks both the runtime value shape (`single`: `T | null`; `multiple`: `readonly T[]`) and the ARIA role: single mode is a real `role="radiogroup"` of `role="radio"` buttons with roving tabindex and arrow-key automatic activation; multiple mode is a plain `role="group"` of independently `aria-pressed` buttons with normal `tabindex="0"` each (`select-button.component.ts:15-26`). Implements `ControlValueAccessor`.

### Variants
No `variant` input. Selected options render `filled`+`primary`; unselected render `outlined`+`secondary` (`select-button.component.ts:88`), same pattern as ToggleButton. Only `size` (`ButtonSize`) and `multiple` (boolean mode switch) are exposed.

| Mode | ARIA role model |
|---|---|
| Single (default, `multiple=false`) | `role="radiogroup"` container, `role="radio"` options, roving tabindex, arrow-key navigation, clicking the already-selected option is a no-op (`select-button.component.ts:19-22`, `:133-170`) |
| `multiple` | `role="group"` container, independent `aria-pressed` buttons, normal `tabindex="0"` each, no roving tabindex (`select-button.component.ts:23-26`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `readonly SelectOption<T>[]` | `[]` | `{ label, value, disabled? }` items (`select-button.component.ts:61`; shape at `projects/medra/ui/src/lib/select/select.types.ts:2-6`) |
| `multiple` | `boolean` | `false` | Switches value shape and ARIA role model (`select-button.component.ts:62`) |
| `size` | `ButtonSize` | `'default'` | Forwarded to `buttonVariants` (`select-button.component.ts:63`) |
| `invalid` | `boolean` | `false` | Adds a danger-colored ring — now via the shared `INVALID_RING_CLASS` (`button.styles.ts`), previously a duplicated string (`select-button.component.ts:64`, `:91`) |
| `disabled` | `boolean` | `false` | Disables all options (`select-button.component.ts:65`) |
| `ariaLabel` | `string \| null` | `null` | Accessible name for the option group (`select-button.component.ts:66`) |
| `class` | `string` | `''` | Extra classes on the group container (`select-button.component.ts:67`, `:78`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Unselected (default) | `outlined` + `secondary` (`select-button.component.ts:88`) | Roving `tabindex="-1"` unless it's the first enabled option with nothing selected (`select-button.component.ts:102-115`) |
| Selected | `filled` + `primary` | `aria-checked`/`aria-pressed` depending on mode (`select-button.component.ts:46-47`); clicking again in single mode is a no-op (`select-button.component.ts:127`) |
| Hover/Active | Inherited from `buttonVariants` | Pointer only |
| Focus | Inherited `focus-visible:ring-*` + `focus-visible:z-10` to stay above adjacent option's ring (`select-button.component.ts:89`) | Arrow keys move focus + selection in single mode (`select-button.component.ts:133-170`) |
| Disabled (whole component) | `isDisabled()` combines `disabled` input + forms `setDisabledState` (`select-button.component.ts:71`, `:184-186`) | All options get `tabIndex=-1`, clicks no-op (`select-button.component.ts:103-104`, `:118-120`) |
| Disabled (per-option) | `pointer-events-none cursor-not-allowed opacity-(--opacity-disabled)` — added manually since the button never gets the native `:disabled` pseudo (only `aria-disabled`, comment at `select-button.component.ts:92-97`) | Excluded from arrow-key traversal (`select-button.component.ts:138`) |
| Invalid | `ring-(--focus-ring-width) ring-danger-500` appended (`select-button.component.ts:91`) | Purely visual — doesn't block interaction |
| Loading | Not implemented | — |

### Accessibility
- **Role/ARIA:** Container: `[attr.role]="multiple() ? 'group' : 'radiogroup'"`, `[attr.aria-label]="ariaLabel()"` (`select-button.component.ts:40`) — both roles directly tested (`select-button.component.spec.ts` — `'sets role="radiogroup" on the container and role="radio" on each button'`, `'sets role="group" on the container and no role on each button'`). Options: `[attr.role]="multiple() ? null : 'radio'"`, `[attr.aria-pressed]`/`[attr.aria-checked]` depending on mode, `[attr.aria-disabled]` (`select-button.component.ts:45-48`) — `aria-checked`/`aria-pressed` toggling tested (`'clicking an option selects it...'`, `'clicking toggles an option independently...'`), `aria-disabled` tested (`'disables all options via the disabled input'`).
- **Keyboard navigation:** ArrowRight/ArrowDown move to next enabled option, ArrowLeft/ArrowUp to previous, Home/End to first/last enabled — wraps around and **skips disabled options** — only active in single (non-`multiple`) mode (`select-button.component.ts:133-170`). All directly tested: `select-button.component.spec.ts` — `'ArrowRight moves to the next enabled option, wrapping and skipping disabled'`, `'Home/End jump to the first/last enabled option'`. Roving tabindex (only the selected, or first-enabled-when-none-selected, option has `tabIndex=0`) is also tested (`'nothing selected initially, first enabled option has tabIndex 0 (roving)'`, `'clicking an option selects it and updates the roving tabindex'`). `multiple` mode has no roving tabindex — every enabled option keeps normal `tabIndex=0` and relies on plain Tab order (`'every enabled option has normal tabIndex 0 (no roving tabindex)'`).
- **Screen reader:** `ariaLabel` names the whole group — tested (`'sets aria-label on the group when provided'`); per-option accessible name comes from visible `option.label` text (native button text content, not separately tested but standard native semantics). **Note:** if `ariaLabel` is omitted, the group has no accessible name at all (`aria-label` is simply absent) — already flagged in Do's/Don'ts below.

**A11y verdict:** Covered — role, state (`aria-checked`/`aria-pressed`/`aria-disabled`), keyboard navigation (including disabled-option skipping and mode-dependent tabindex behavior), and the group's accessible name are all directly exercised by tests, not just present in the template.

**Ripple adoption (2026-08-19):** `[medRipple]` now applied to each option button, `medRippleDisabled` bound to `isDisabled() || option.disabled` since these never get a native `disabled` (aria-disabled convention only) — previously only Button itself had it (see `03-patterns/ripple-interaction.md`). Also directly tested: `select-button.component.spec.ts` — `'triggers the ripple effect on pointerdown for an enabled option (Ripple adoption)'`, `'does not trigger the ripple effect for a disabled option'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use single mode for mutually-exclusive choices (radio semantics — clicking the selected option again does nothing) | Expecting single-mode selection to be clearable by re-clicking the active option (`select-button.component.spec.ts` — `'clicking the already-selected option is a no-op (radio semantics, never deselects)'`) |
| Provide `ariaLabel` since there's no visible group label by default | Omitting `ariaLabel` when no adjacent text already labels the control |
| Set `option.disabled` per-item to exclude specific choices | Assuming a disabled option looks the same as an enabled one — it needs the manual `pointer-events-none cursor-not-allowed opacity-(--opacity-disabled)` treatment since it never gets the native `:disabled` pseudo-class (`select-button.component.ts:96-102`, tested: `'a disabled option is visually dimmed and not just functionally inert'`) |

### Code example (Angular)
```html
<med-select-button [options]="sizeOptions" ariaLabel="Size" [(ngModel)]="selectButtonDemoValue" name="demo-select-button" />
<med-select-button multiple [options]="sizeOptions" ariaLabel="Sizes" [(ngModel)]="selectButtonMultipleDemoValue" name="demo-select-button-multiple" />
```
(from `projects/showcase/src/app/app.html:334`, `:339`)

### Source
- `projects/medra/ui/src/lib/select-button/select-button.component.ts`
- Reuses `projects/medra/ui/src/lib/button/button.styles.ts` (`buttonVariants`) and `projects/medra/ui/src/lib/select/select.types.ts` (`SelectOption`)
