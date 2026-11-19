## Component: CascadeSelect

### Description
`CascadeSelectComponent` (`med-cascade-select`) is a `Select`-style combobox trigger (reuses `selectTriggerVariants`/`SelectSize` unchanged from Select — `projects/medra/ui/src/lib/cascade-select/cascade-select.component.ts:5,88`) that opens a chain of cascading side-panels for picking a value nested in a multi-level tree (e.g. Country → State → City). Only leaf options carry a real `value` — intermediate levels exist purely to narrow down to one (`cascade-select.types.ts:1`). On selection, the trigger displays the full breadcrumb joined by `separator` (default `' / '`, e.g. `"USA / California / Los Angeles"` — `cascade-select.component.ts:92,101`). Implements `ControlValueAccessor`.

**Scope cut for v1**: no `filter`/`showClear` (both real features on `SelectComponent`) — documented explicitly as deferred since the cascading-panel mechanism is already the hard part this component adds over Select (`cascade-select.component.ts:41-45`).

### Variants
| Variant | When to use |
|---|---|
| `size="sm" \| "default" \| "lg"` | Matches Select's field-size scale — `cascade-select.component.ts:88` |
| `invalid` | Error state (danger border/ring, shared `selectTriggerVariants`) — `cascade-select.component.ts:89` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `readonly CascadeSelectOption<T>[]` | `[]` | Tree of `{ label, value?, disabled?, children? }` — `cascade-select.component.ts:87`, shape at `cascade-select.types.ts:2-7` |
| `size` | `SelectSize` | `'default'` | `cascade-select.component.ts:88` |
| `invalid` | `boolean` | `false` | `cascade-select.component.ts:89` |
| `disabled` | `boolean` | `false` | `cascade-select.component.ts:90` |
| `placeholder` | `string` | `'Select an option'` | `cascade-select.component.ts:91` |
| `separator` | `string` | `' / '` | Joins the breadcrumb labels shown in the trigger once a leaf is picked — `cascade-select.component.ts:93` |
| `class` | `string` (aliased) | `''` | `cascade-select.component.ts:94` |

Value (via `ControlValueAccessor`) is a single `T | null`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | `selectTriggerVariants` default — bordered `div[role=combobox]`, placeholder text dimmed | — |
| Hover | Inherited from shared `selectTriggerVariants` | |
| Focus | Native focus ring on the trigger `div` | ArrowDown/ArrowUp/Enter/Space open the panel — `cascade-select.component.ts:117-130` |
| Active | Trigger shows resolved breadcrumb (`displayLabel()`) once a leaf is picked | `cascade-select.component.ts:101` |
| Disabled | `tabindex="-1"`, `aria-disabled="true"` | Click/keydown no-op — `cascade-select.component.ts:64,67,111,118` |
| Loading | Not implemented | — |
| Error | `aria-invalid="true"`, danger border/ring (shared `selectTriggerVariants`) | `cascade-select.component.ts:68,89` |
| Open/Closed | `aria-expanded` reflects `isOpen()` | Opens a connected overlay chain (`CascadeSelectPanelComponent`, recursive submenus) — `cascade-select.component.ts:150-166` |

### Accessibility
- **Role/ARIA:** Trigger is `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-disabled`, `aria-invalid` (`cascade-select.component.ts:63-68`); `aria-disabled`/no-open-on-click verified by `cascade-select.component.spec.ts` — `'disabled: the trigger never opens'`. Each panel level is `role="listbox"` with `role="option"` rows, `aria-activedescendant`, and `aria-haspopup="listbox"`/`aria-expanded` on rows that have children (`cascade-select-panel.component.ts:54-67`); the root panel's rendered option set (labels, in order) is verified by `'opens the root panel on trigger click'`.
- **Keyboard navigation:** ArrowRight opens a submenu at the active row and drilling down through multiple levels stacks additional panels — verified end-to-end for a 3-level tree by `cascade-select.component.spec.ts` — `'drilling down through 3 levels and picking a leaf sets the value and closes the whole tree'` (also confirms `onChange` fires with the leaf's `value` and the *entire* panel chain closes, not just the deepest level). ArrowLeft collapses **only the deepest level**, not the whole tree — `'ArrowLeft collapses just the deepest level, not the whole tree'` (panel count goes from 2 to 1, not to 0). Enter on a disabled leaf never resolves a value — `'a disabled leaf never resolves a value'`. Escape closes **only the deepest panel level**, matching ArrowLeft's collapse-one-level semantics rather than closing the whole chain — `'closes on Escape at the deepest level only'`. **Home/End/Tab — resolved 2026-08-19:** both were already implemented (`cascade-select-panel.component.ts:169-176,190-192`), just untested; now confirmed by `cascade-select.component.spec.ts` — `'Home/End jump the active row to the first/last enabled option in the root panel'` and `'Tab closes the whole panel chain, not just the deepest level'` (Tab, like Enter selection, closes the *entire* stacked chain, not just the panel it was pressed in).
- **Screen reader:** `displayLabel()` (resolved breadcrumb) is rendered as trigger text, or `placeholder()` in a dimmed span when empty (`cascade-select.component.ts:74-78`) — verified by `'shows the placeholder when nothing is selected'` and the breadcrumb-rendering tests below. Rows use `aria-activedescendant` rather than real per-item focus. No `aria-describedby` for external hint/error text found — same accepted gap as `Select` (`select.md`'s own Accessibility section), not implemented here either since neither component owns the hint/error text itself. `[not covered by tests]`
- **Breadcrumb reconstruction (`writeValue`):** unlike `Select`, a bare `value` doesn't carry the path that produced it, so `writeValue` searches the whole options tree to rebuild the breadcrumb — verified by `cascade-select.component.spec.ts` — `'writeValue reconstructs the breadcrumb by searching the tree for the matching leaf'`. `writeValue(null/undefined)` clears the display back to the placeholder without throwing — `'writeValue(null/undefined) clears the display, never throwing'`. A custom `separator` is honored in the reconstructed breadcrumb — `'a custom separator joins the breadcrumb differently'`. Destroying the host while nested panels are open closes the *entire* stacked chain, not just the top one — `'destroying the host while nested panels are open closes the whole tree'`.

**A11y verdict:** Covered — **resolved 2026-08-19**: role/ARIA wiring, the core drill-down/collapse-one-level keyboard semantics (ArrowRight/ArrowLeft/Enter/Escape), disabled-leaf blocking, the breadcrumb-reconstruction form integration, and now Home/End/Tab panel-level keyboard behavior are all directly tested (see Keyboard navigation above). `aria-describedby` error association remains unimplemented, matching `Select`'s same accepted gap — not a CascadeSelect-specific regression.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use for genuinely hierarchical option sets where each level narrows the next (location pickers, category trees) | Don't expect `filter`/`showClear` — not implemented in v1, unlike Select |
| Only give leaf options a `value` — intermediate levels are structural | Don't rely on intermediate-level `value`s being selectable; only leaves resolve the control's value |
| Expect ArrowLeft/Escape to collapse only the deepest open panel level (`cascade-select.component.spec.ts` — `'ArrowLeft collapses just the deepest level, not the whole tree'`, `'closes on Escape at the deepest level only'`) — useful for correcting a wrong branch without restarting the whole pick. | Don't assume selecting a leaf only closes that leaf's panel — it closes the *entire* stacked chain back to the trigger (`'drilling down through 3 levels and picking a leaf sets the value and closes the whole tree'`), and destroying the host component does the same (`'destroying the host while nested panels are open closes the whole tree'`). |

### Code example (Angular)
```html
<med-cascade-select [options]="cascadeOptions" placeholder="Choose a city" class="w-full sm:w-auto sm:min-w-[16rem]" [(ngModel)]="cascadeDemoValue" name="demo-cascade" />
<med-cascade-select [options]="cascadeOptions" placeholder="Disabled" disabled />
<med-cascade-select [options]="cascadeOptions" placeholder="Invalid" invalid />
```
Source: `projects/showcase/src/app/app.html:322-324`

### Source
- `projects/medra/ui/src/lib/cascade-select/cascade-select.component.ts`
- `projects/medra/ui/src/lib/cascade-select/cascade-select-panel.component.ts`
- `projects/medra/ui/src/lib/cascade-select/cascade-select.types.ts`
- `projects/medra/ui/src/lib/select/select.styles.ts` (shared `selectTriggerVariants`)
