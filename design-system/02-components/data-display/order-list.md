## Component: OrderList

### Description
A single reorderable list (`med-order-list`): click to multi-select items, then use Move Up/Down/Top/Bottom buttons to reposition the selection as one contiguous block, preserving the selected items' relative order among themselves. Reordering is **button-driven, not drag-and-drop** — the component's doc comment explains this is a deliberate v1 scope cut: native HTML5 drag-and-drop has real accessibility gaps (no keyboard equivalent without extra work, inconsistent screen-reader support) that the button controls already cover functionally, since every reorder is reachable by keyboard/click (`order-list.component.ts:14-19`). Item markup is fully consumer-templated via a single required projected `<ng-template let-item>`.

### Variants
| Variant | When to use |
|---|---|
| (none — single behavior) | OrderList has one reordering mechanism (button-driven); no drag-and-drop variant exists |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly T[]` (model) | `[]` | List data, mutated in place on reorder — `order-list.component.ts:65` |
| `header` | `string` | `''` | Header text above the list, also used as the listbox's `aria-label` — `order-list.component.ts:47,66` |
| `emptyLabel` | `string` | `'No items'` | Text shown when `value` is empty — `order-list.component.ts:67` |
| `moveTopLabel` | `string` | `'Move to top'` | `aria-label` for the "move to top" button — `order-list.component.ts:69` |
| `moveUpLabel` | `string` | `'Move up'` | `aria-label` for the "move up" button — `order-list.component.ts:70` |
| `moveDownLabel` | `string` | `'Move down'` | `aria-label` for the "move down" button — `order-list.component.ts:71` |
| `moveBottomLabel` | `string` | `'Move to bottom'` | `aria-label` for the "move to bottom" button — `order-list.component.ts:72` |
| `class` | `string` | `''` | Extra classes on the host — `order-list.component.ts:73` |
| projected `<ng-template let-item>` | `TemplateRef` (required content child) | — | Per-item markup — `order-list.component.ts:75` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Unselected item, `hover:bg-surface-50` / dark variant — `order-list.component.ts:107` |
| Hover | `hover:bg-surface-50` / dark `hover:bg-surface-800/50` — `order-list.component.ts:107` |
| Focus | No custom focus-visible ring class found on list items (list items are `<li role="option">`, clickable but not natively `tabindex`-ed) | — |
| Active/Selected | `bg-brand-50` / dark `bg-brand-500/10`, `aria-selected="true"` — `order-list.component.ts:51,106` |
| Disabled | Move buttons are individually disabled based on selection position: `canMoveUp`/`canMoveDown` become `false` when nothing is selected or the selection already touches the corresponding edge — `order-list.component.ts:82-98` |
| Loading | Not implemented | — |
| Empty | `@empty` block renders a centered `emptyLabel()` message — `order-list.component.ts:57-59,67` |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** The list is `<ul role="listbox" aria-multiselectable="true" [attr.aria-label]="header()">` with each item `<li role="option" [attr.aria-selected]="...">` — `order-list.component.ts:47-56`. Move buttons have `aria-label`s (`moveTopLabel`/`moveUpLabel`/`moveDownLabel`/`moveBottomLabel`) and are real `<button medButton>` elements — `order-list.component.ts:29-40`. Confirmed by spec: `order-list.component.spec.ts` locates items exclusively via `[role="listbox"]`/`[role="option"]` selectors (helper functions `list()`/`itemsIn()`), and `'clicking an item selects it (aria-selected), clicking again deselects it'` directly asserts `aria-selected` toggling `"false"` → `"true"` → `"false"`.
- **Keyboard navigation:** Move buttons are natively keyboard-reachable/activatable (real `<button>`s), and their disabled state is directly spec-verified (`'Move up/down are disabled when the selection already touches that edge'`, `'Move buttons are disabled when nothing is selected'`). List items themselves have no `tabindex`/`keydown` handler found — selection toggling is bound only to `(click)` (`order-list.component.ts:53`), so keyboard users cannot select/deselect list items directly; only the move buttons (which act on whatever is already selected) are keyboard-operable. This is confirmed, not just inferred: every selection-toggling test in the spec (e.g. `'clicking an item selects it...'`, `'moves a multi-selection up together as one block...'`) drives selection via `.click()` only — no test dispatches a `keydown`/`keypress` on a `role="option"` item anywhere in the file [gap, not covered by tests].
- **Screen reader:** `role="listbox"`/`role="option"`/`aria-selected`/`aria-multiselectable` convey list semantics, spec-verified as above. No `aria-live` region announcing reorder results — the move tests (e.g. `'Move to top sends the selection to the start, keeping relative order'`) only assert the final array order, not any announcement [not covered by tests].

**A11y verdict:** Covered — **resolved 2026-08-19.** Options now use roving `tabindex` (only one option is a tab stop at a time, same model `TabsComponent`/`SelectButtonComponent` already use), with ArrowDown/ArrowUp moving focus and the tab stop (wrapping at the ends), Home/End jumping to the first/last option, and Enter/Space toggling selection on the focused option — the same effect a click already had. Directly tested: `order-list.component.spec.ts` — `'roving tabindex: only one option is in the tab order at a time...'`, `'ArrowDown/ArrowUp move focus and the roving tabindex, wrapping at the ends'`, `'Home/End jump focus to the first/last option'`, `'Enter/Space toggle selection on the focused option, same as a click'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Rely on the four move buttons for all reordering — there is no drag-and-drop, by deliberate design (`order-list.component.ts:14-19`); button disabled-state correctness at both edges is spec-verified | Don't assume list items are keyboard-selectable — only `(click)` toggles selection; no `keydown` handler was found on `<li role="option">` (`order-list.component.ts:53`), and no spec test exercises one either. This is a real gap for keyboard-only users, not just an untested path |
| Provide the required `<ng-template let-item>` — OrderList fails to render without a projected item template (`contentChild.required`, `order-list.component.ts:75`) | Don't expect a drag handle or reorder animation — items are repositioned in a single array `.set()` with no transition (`order-list.component.ts:123,134,141,148`) |
| Trust multi-selection reorder keeps relative order as one block — directly asserted by spec (`'moves a multi-selection up together as one block, keeping relative order'`, `'Move to top sends the selection to the start, keeping relative order'`) | Don't forget selection is a toggle, not radio-like — clicking a selected item deselects it (confirmed by spec), unlike DataTable/Tree/OrganizationChart single-selection modes which are no-ops on re-click |

### Code example (Angular)
```html
<med-order-list [(value)]="orderListValue" header="Fruits" class="max-w-sm">
  <ng-template let-item>{{ item }}</ng-template>
</med-order-list>
```
(Lifted from `projects/showcase/src/app/app.html:1317-1319`.)

### Source
- `projects/medra/ui/src/lib/order-list/order-list.component.ts`
- Showcase usage: `projects/showcase/src/app/app.html:1315-1321`
