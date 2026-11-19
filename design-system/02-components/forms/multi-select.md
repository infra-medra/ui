## Component: MultiSelect

### Description
`MultiSelect` (`med-multi-select`) uses the exact same combobox architecture as `Select` — the same trigger CVA (`selectTriggerVariants`) and the same shared internal `SelectPanelComponent` overlay. The only real differences are the value shape (`T[]` instead of `T | null`) and that choosing an option toggles it and keeps the panel open, since picking more than one option is the point. The trigger summary is deliberately simple for v1: 1-2 selections show their labels joined by a comma, 3+ collapse to "N selected"; a chip/pill-style display was considered and explicitly deferred as a possible future opt-in. Implements `ControlValueAccessor` with a `readonly T[]` value. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:24-35`

### Variants
| Variant | When to use |
|---|---|
| Plain (no `filter`, no `showClear`) | Simple fixed-option multi-select. |
| `filter` | Adds a search input at the top of the panel to narrow long option lists. |
| `showClear` | Adds a clear ("x") button in the trigger once at least one option is selected. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:72-81` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `readonly SelectOption<T>[]` | `[]` | List of `{ label, value, disabled? }` items (shared `SelectOption` type with Select). `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:92` |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Trigger padding/font-size, reusing shared field tokens. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:93` |
| `invalid` | `boolean` | `false` | Error styling + `aria-invalid` on the trigger. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:94` |
| `disabled` | `boolean` | `false` | Disables the trigger. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:95` |
| `filter` | `boolean` | `false` | Shows the in-panel search input. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:96` |
| `showClear` | `boolean` | `false` | Shows the clear button once at least one option is selected. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:97` |
| `placeholder` | `string` | `'Select options'` | Trigger text when nothing is selected. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:99` |
| `filterPlaceholder` | `string` | `'Search'` | Placeholder for the in-panel filter input. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:100` |
| `emptyLabel` | `string` | `'No results found'` | Shown when the filter yields zero options. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:101` |
| `clearLabel` | `string` | `'Clear'` | `aria-label` for the clear button. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:102` |
| `inputId` | `string \| null` | `null` | `id` on the trigger. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:103` |
| `class` | `string` | `''` | Extra classes merged onto the trigger. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:104` |

No `@Output()`s; value flows through `ControlValueAccessor` as `readonly T[]`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Same field-like chrome as Select (shared `selectTriggerVariants`) | — |
| Hover | Border darkens (shared with Select) | `projects/medra/ui/src/lib/select/select.styles.ts:21` |
| Focus | `focus-visible:ring-(--focus-ring-width)` with ring offset, brand color | `projects/medra/ui/src/lib/select/select.styles.ts:22` |
| Open | `aria-expanded="true"`; panel stays open after a selection since multiple picks are expected — closes only via Tab, Escape/outside click (overlay default), or explicit toggle | `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:188` |
| Disabled | Same as Select (`aria-disabled`-driven opacity/cursor/background) | `disabled` input OR Reactive Forms `setDisabledState()`. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:108` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500`, `focus-visible:ring-danger-500` (shared with Select) | `aria-invalid="true"` on the trigger when `invalid()` is true. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:60,94` |

### Accessibility
- **Role/ARIA:** Trigger is `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-disabled`, `aria-invalid` — `aria-disabled` verified by `multi-select.component.spec.ts` — `'a disabled MultiSelect never opens on click'`. The shared panel sets `aria-multiselectable="true"` (via `multiple` input set to `true` — tested at the panel level by `select-panel.component.spec.ts` — `'sets aria-multiselectable on the listbox'`) and renders each option as `role="option"` with `aria-selected` reflecting membership in the selection array; selected rows also show a checkbox-style indicator (not a native checkbox — a plain `<span>` driven by a boolean, since there's no native input to pair with inside a `role="option"` row). `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:56-60,182`, `projects/medra/ui/src/lib/select/select.styles.ts:76-92`
- **Keyboard navigation:** Same underlying panel as Select, so the same disabled-aware, wrapping ArrowUp/Down + Home/End matrix applies (see `select-panel.component.spec.ts`, exercised here through `MultiSelectComponent`). Distinct from single-select: Enter/Space **toggles** the active option's selection and the panel stays open, verified end-to-end by `multi-select.component.spec.ts` — `'picking options keeps the panel open and joins up to 2 labels with a comma'` and `'picking the same option again removes it (toggle)'` (re-selecting an already-picked option removes it). Disabled options are never toggled even after navigating past them — `'never toggles a disabled option'`. Escape closes the panel **without discarding already-picked values** — `'Escape closes the panel without discarding already-picked values'` (a meaningful distinction from Select, where Escape simply closes with no selection made yet).
- **Trigger summary behavior:** 1-2 selections join their labels with a comma; 3+ collapse to `"N selected"` — verified together by `'collapses the trigger summary to "N selected" for 3+ picks'`.
- **Screen reader:** `aria-activedescendant` on the listbox tracks the active option; each option's `aria-selected` reflects multi-selection state. No `aria-describedby` for external hint/error text found on the trigger. `[not covered by tests]`
- **Form integration (`ControlValueAccessor`):** `writeValue(null)`/`writeValue(undefined)` both normalize to an empty selection (`[]`) without throwing — `'writeValue(null) and writeValue(undefined) both normalize to an empty selection'`. A `FormControl` seeded with multiple values renders the correctly joined summary on init — `'a FormControl seeded with values renders the joined summary on init (real-world regression scenario)'`. Destroying the host while the panel is open correctly tears down the overlay — `'destroying the component while the panel is open closes the overlay'`.

**A11y verdict:** Covered — combobox/listbox roles, `aria-multiselectable`, the toggle-not-close selection model, disabled-option skipping, Escape-preserves-selection behavior, and null-safe form integration are all directly tested (partly via the shared `SelectPanelComponent` suite, partly via `MultiSelectComponent`'s own). The only gap is `aria-describedby` for an external error message, unwired and untested, same as Select.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Expect the trigger label to collapse to "N selected" once more than 2 options are chosen — there's no chip/pill display in this version. | Don't expect individually removable chips per selection; that's a deferred, not-yet-implemented feature. `projects/medra/ui/src/lib/multi-select/multi-select.component.ts:31-35` |
| Use `filter` for large option sets — the panel is virtualized and handles thousands of options (showcase demonstrates 12k). | Don't assume selecting an option closes the panel — by design it stays open so users can pick more than one. |
| Trust that Escape preserves whatever was already picked and only closes the panel (`multi-select.component.spec.ts` — `'Escape closes the panel without discarding already-picked values'`). | Don't assume re-selecting an already-picked option is a no-op — it's a genuine toggle and removes it from the selection (`'picking the same option again removes it (toggle)'`), unlike clicking an already-selected option in single-select `Select`, which is a true no-op. |

### Code example (Angular)
```html
<med-multi-select
  [options]="fruitOptions"
  placeholder="Choose fruits"
  filter
  showClear
  [(ngModel)]="multiSelectDemoValue"
  name="demo-multi-select"
/>
```

### Source
- `projects/medra/ui/src/lib/multi-select/multi-select.component.ts`
- Shared: `projects/medra/ui/src/lib/select/select-panel.component.ts`, `projects/medra/ui/src/lib/select/select.styles.ts`, `projects/medra/ui/src/lib/select/select.types.ts`
- Usage: `projects/showcase/src/app/app.html:411-419,590`
