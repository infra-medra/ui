## Component: Select

### Description
`Select` (`med-select`) is a custom combobox, not a styled native `<select>` — it implements the WAI-ARIA APG "Select-Only Combobox" pattern: a `role="combobox"` trigger `<div>` driving a `role="listbox"` overlay panel. This gives full control over option styling and behavior (filtering, disabled options) that a native `<select>` can't offer. The trigger is a `<div>` rather than a `<button>` because it needs to contain a real nested `<button>` for the optional clear affordance (buttons can't nest); disabled state is therefore expressed via `aria-disabled` rather than the native `:disabled` pseudo-class. The dropdown panel (`SelectPanelComponent`, internal/not part of the public API) is shared with `MultiSelect` and uses `CdkVirtualScrollViewport` so option lists of any size (the showcase demonstrates 12k options) stay smooth — only the visible ~10-15 rows are ever in the DOM. Implements `ControlValueAccessor`. `projects/medra/ui/src/lib/select/select.component.ts:24-37`, `projects/medra/ui/src/lib/select/select-panel.component.ts:20-32`

### Variants
| Variant | When to use |
|---|---|
| Plain (no `filter`, no `showClear`) | Simple fixed-option dropdown. |
| `filter` | Adds a search input at the top of the panel to narrow long option lists. `projects/medra/ui/src/lib/select/select-panel.component.ts:48-61` |
| `showClear` | Adds a clear ("x") button in the trigger once a value is selected. `projects/medra/ui/src/lib/select/select.component.ts:74-83` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `readonly SelectOption<T>[]` | `[]` | List of `{ label, value, disabled? }` items. `projects/medra/ui/src/lib/select/select.component.ts:94`, `projects/medra/ui/src/lib/select/select.types.ts:1-6` |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Trigger padding/font-size, reusing the shared field tokens. `projects/medra/ui/src/lib/select/select.component.ts:95` |
| `invalid` | `boolean` | `false` | Error styling + `aria-invalid` on the trigger. `projects/medra/ui/src/lib/select/select.component.ts:96` |
| `disabled` | `boolean` | `false` | Disables the trigger (`aria-disabled`, `tabindex="-1"`). `projects/medra/ui/src/lib/select/select.component.ts:97` |
| `filter` | `boolean` | `false` | Shows the in-panel search input. `projects/medra/ui/src/lib/select/select.component.ts:98` |
| `showClear` | `boolean` | `false` | Shows the clear button once a value is selected. `projects/medra/ui/src/lib/select/select.component.ts:99` |
| `placeholder` | `string` | `'Select an option'` | Trigger text when nothing is selected (English default). `projects/medra/ui/src/lib/select/select.component.ts:101` |
| `filterPlaceholder` | `string` | `'Search'` | Placeholder for the in-panel filter input. `projects/medra/ui/src/lib/select/select.component.ts:102` |
| `emptyLabel` | `string` | `'No results found'` | Shown when the filter yields zero options. `projects/medra/ui/src/lib/select/select.component.ts:103` |
| `clearLabel` | `string` | `'Clear'` | `aria-label` for the clear button. `projects/medra/ui/src/lib/select/select.component.ts:104` |
| `inputId` | `string \| null` | `null` | `id` on the trigger. `projects/medra/ui/src/lib/select/select.component.ts:105` |
| `class` | `string` | `''` | Extra classes merged onto the trigger. `projects/medra/ui/src/lib/select/select.component.ts:106` |

No `@Output()`s; value flows through `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Standard field-like chrome (border/padding via `selectTriggerVariants`, same field tokens as InputText) | — |
| Hover | Border darkens `hover:border-surface-400`/dark `hover:border-surface-500` | `projects/medra/ui/src/lib/select/select.styles.ts:21` |
| Focus | `focus-visible:ring-(--focus-ring-width)` with ring offset, brand color | `projects/medra/ui/src/lib/select/select.styles.ts:22` |
| Open | `aria-expanded="true"`, `aria-controls` points at the panel; panel opens via `OverlayService.openConnected()`, sized to the trigger's width | `projects/medra/ui/src/lib/select/select.component.ts:59-60,162-191` |
| Disabled | `aria-disabled:opacity-(--opacity-disabled)`, `bg-surface-50`/dark `bg-surface-800`, `cursor-not-allowed`; `tabindex="-1"` | `disabled` input OR Reactive Forms `setDisabledState()`; click/keydown handlers early-return. `projects/medra/ui/src/lib/select/select.styles.ts:23`, `projects/medra/ui/src/lib/select/select.component.ts:57,124-143` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500`, `focus-visible:ring-danger-500` | `aria-invalid="true"` on the trigger when `invalid()` is true. `projects/medra/ui/src/lib/select/select.styles.ts:33`, `projects/medra/ui/src/lib/select/select.component.ts:62,96` |

### Accessibility
- **Role/ARIA:** Trigger is `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-disabled`, `aria-invalid` — `aria-invalid` verified by `select.component.spec.ts` — `'sets aria-invalid when invalid is true'`, `aria-disabled`/`tabindex="-1"` by `'a disabled Select never opens on click'`. The panel is `role="listbox"` with `aria-multiselectable` (unset in single-select, `"true"` when `multiple`) and `aria-activedescendant` pointing at the currently active option; each option row is `role="option"` with `aria-selected`/`aria-disabled`. `aria-multiselectable` on/off is verified by `select-panel.component.spec.ts` — `'sets aria-multiselectable on the listbox'` and `'does not set aria-multiselectable in single-select mode'`. `projects/medra/ui/src/lib/select/select.component.ts:55-62`, `projects/medra/ui/src/lib/select/select-panel.component.ts:63-70,79-82`
- **Keyboard navigation:** On the trigger, ArrowDown (and ArrowUp/Enter/Space per code) opens the panel — verified by `select.component.spec.ts` — `'ArrowDown on the closed trigger opens the panel'`. Inside the panel (`select-panel.component.spec.ts`): ArrowDown/ArrowUp move the active option and **skip disabled options entirely** (a disabled option is never made active, not just unselectable) — `'ArrowDown moves to the next option, skipping disabled ones'`, `'never emits optionToggled for a disabled option, even after navigating past it'`; navigation wraps at both ends — `'ArrowDown wraps from the last enabled option back to the first'`, `'ArrowUp wraps from the first enabled option to the last'`; Home/End jump to the first/last *enabled* option — `'Home/End jump to the first/last enabled option'`; Enter selects the active option and closes the panel, with the selected value confirmed end-to-end through `SelectComponent` — `select.component.spec.ts` — `'selecting an option (via keyboard) updates the value and closes the panel'`; Escape closes without selecting — `'skips the disabled option when navigating, and Escape closes without selecting'`; Tab emits `closeRequested` without calling `preventDefault`, deliberately letting the browser's own pending Tab action move focus onward after the trigger is refocused — `select-panel.component.spec.ts` — `'Tab emits closeRequested'`. When `filter` is enabled, Space types into the filter input instead of selecting — `'Space types into the filter box instead of selecting the active option'`. `projects/medra/ui/src/lib/select/select.component.ts:130-143`, `projects/medra/ui/src/lib/select/select-panel.component.ts:186-224`
- **Focus management on open:** the panel's `ngAfterViewInit` focuses the filter input (if `filter`) or the listbox itself, and the initially active option is the already-selected one if there is one, otherwise the first enabled option — verified by `select-panel.component.spec.ts` — `'starts with the first enabled option active when nothing is selected'` and `'starts with the already-selected option active, not the first one'`. Destroying the host component while the panel is open correctly tears down the overlay (no leaked `role="listbox"`) — `select.component.spec.ts` — `'destroying the component while the panel is open closes the overlay'`.
- **Filter:** filtering is case-insensitive substring matching on the label, and narrows the panel *and* resets the active option to the first filtered match — `select-panel.component.spec.ts` — `'typing narrows the option set and resets the active option to the first (filtered) match'`, `'is case-insensitive'`.
- **Screen reader:** `aria-activedescendant` keeps DOM focus on the panel's `role="listbox"` while announcing the active option; disabled options are skipped by keyboard navigation and marked `aria-disabled`. No `aria-describedby` for external hint/error text found on the trigger. `[not covered by tests]`

**A11y verdict:** Covered — the combobox/listbox role wiring, the full disabled-aware/wrapping keyboard-navigation matrix, filter behavior, focus management on open (including which option starts active), and overlay teardown are all directly and thoroughly tested across `select.component.spec.ts` and `select-panel.component.spec.ts`. The only notable gap is `aria-describedby` for an external error message on the trigger, which is unwired and untested.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Enable `filter` for long option lists (the showcase demonstrates 12k options with `filter` and virtualization). | Don't expect the trigger's native `:disabled` styling — disabled state is `aria-disabled`-driven since the trigger is a `<div>`, not a real form control. |
| Use `showClear` when "no selection" is a valid, meaningful state for the field. | Don't rely on the panel's internal `SelectPanelComponent` directly — it's explicitly internal/shared with MultiSelect, not part of the public API. |
| Trust that disabled options are fully unreachable by keyboard (never become the active/`aria-activedescendant` option, not just unselectable on Enter) — `select-panel.component.spec.ts` — `'never emits optionToggled for a disabled option, even after navigating past it'`. | Don't assume Tab closes the panel via `preventDefault` + manual refocus logic — it deliberately does *not* call `preventDefault`, relying on the trigger being synchronously refocused so the browser's own pending Tab then moves on naturally (`select-panel.component.spec.ts` — `'Tab emits closeRequested'`). Building custom focus-trap logic on top of this component risks fighting that design. |

### Code example (Angular)
```html
<med-select [options]="fruitOptions" placeholder="Choose a fruit" [(ngModel)]="selectDemoValue" name="demo-select" />
<med-select [options]="fruitOptions" placeholder="Filterable + clearable" filter showClear [(ngModel)]="selectFilterDemoValue" name="demo-select-filter" />
<med-select [options]="fruitOptions" placeholder="Invalid" invalid />
```

### Source
- `projects/medra/ui/src/lib/select/select.component.ts`
- `projects/medra/ui/src/lib/select/select-panel.component.ts`
- `projects/medra/ui/src/lib/select/select.styles.ts`
- `projects/medra/ui/src/lib/select/select.types.ts`
- Usage: `projects/showcase/src/app/app.html:290-293,589`
