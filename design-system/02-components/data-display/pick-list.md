## Component: PickList

### Description
Two lists (`med-pick-list`, `source`/`target`, both two-way `model()`s) with button-driven transfer between them: click to multi-select within a list, then Move/Move All buttons transfer the selection in either direction; double-clicking a single item transfers just that item regardless of the current selection (a common PickList shortcut). Like OrderList, transfer is **button-driven, not drag-and-drop** — the same accessibility-gap reasoning applies (no keyboard equivalent without extra work, inconsistent screen-reader support for native HTML5 DnD), and the button controls already cover every transfer by keyboard/click (`pick-list.component.ts:16-23`). Item markup is fully consumer-templated via a single required projected `<ng-template let-item>`.

### Variants
| Variant | When to use |
|---|---|
| (none — single behavior) | PickList has one transfer mechanism (button-driven, plus double-click shortcut); no drag-and-drop or reordering-within-a-list variant exists |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `source` | `readonly T[]` (model) | `[]` | Left/available list — `pick-list.component.ts:87` |
| `target` | `readonly T[]` (model) | `[]` | Right/selected list — `pick-list.component.ts:88` |
| `sourceHeader` | `string` | `'Available'` | Header text and `aria-label` for the source list — `pick-list.component.ts:33,89` |
| `targetHeader` | `string` | `'Selected'` | Header text and `aria-label` for the target list — `pick-list.component.ts:67,90` |
| `emptyLabel` | `string` | `'No items'` | Text shown when a list is empty — `pick-list.component.ts:91` |
| `moveToTargetLabel` | `string` | `'Move selected to target'` | `aria-label` for the "move selected right" button — `pick-list.component.ts:93` |
| `moveAllToTargetLabel` | `string` | `'Move all to target'` | `aria-label` for the "move all right" button — `pick-list.component.ts:94` |
| `moveToSourceLabel` | `string` | `'Move selected to source'` | `aria-label` for the "move selected left" button — `pick-list.component.ts:95` |
| `moveAllToSourceLabel` | `string` | `'Move all to source'` | `aria-label` for the "move all left" button — `pick-list.component.ts:96` |
| `class` | `string` | `''` | Extra classes on the host — `pick-list.component.ts:97` |
| projected `<ng-template let-item>` | `TemplateRef` (required content child) | — | Per-item markup, shared by both lists — `pick-list.component.ts:99` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Unselected item, `hover:bg-surface-50` / dark variant — `pick-list.component.ts:116` |
| Hover | `hover:bg-surface-50` / dark `hover:bg-surface-800/50` — `pick-list.component.ts:116` |
| Focus | No custom focus-visible ring class found on list items | — |
| Active/Selected | `bg-brand-50` / dark `bg-brand-500/10`, `aria-selected="true"` — `pick-list.component.ts:38,115` |
| Disabled | The four transfer buttons are individually disabled when their source is empty or nothing is selected: `[disabled]="source().length === 0"`, `[disabled]="sourceSelection().length === 0"`, etc. — `pick-list.component.ts:52,55,58,61` |
| Loading | Not implemented | — |
| Empty | `@empty` block renders a centered `emptyLabel()` message per list — `pick-list.component.ts:45-46,79-80,91` |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Each list is `<ul role="listbox" aria-multiselectable="true" [attr.aria-label]="...Header()">` with each item `<li role="option" [attr.aria-selected]="...">` — `pick-list.component.ts:34,38,68,72`. Transfer buttons have `aria-label`s and are real `<button medButton>` elements — `pick-list.component.ts:52-63`. Confirmed by spec: `pick-list.component.spec.ts` locates both lists via `[role="listbox"]`/`[role="option"]` selectors, and `'clicking an item selects it (aria-selected), clicking again deselects it'` directly asserts `aria-selected` toggling on a source-list item.
- **Keyboard navigation:** Transfer buttons are natively keyboard-reachable/activatable, and their disabled state is spec-verified (`'moving to target clears the source selection'` — asserts the move button becomes disabled after a transfer; `'the Move buttons are disabled when there is nothing to move'`). List items have no `tabindex`/`keydown` handler found — selection toggling is bound only to `(click)`/`(dblclick)` (`pick-list.component.ts:40-41,74-75`), so keyboard users cannot select/deselect or double-click-transfer items directly; only the four transfer buttons (acting on whatever is already selected, or "move all") are keyboard-operable. Confirmed, not just inferred: every list-item interaction test in the spec uses `.click()` or a synthetic `dblclick` `MouseEvent` (`'double-clicking a single item transfers it immediately, ignoring selection'`) — no test dispatches a `keydown`/`keypress` on a `role="option"` item anywhere in the file [gap, not covered by tests].
- **Screen reader:** `role="listbox"`/`role="option"`/`aria-selected`/`aria-multiselectable` convey list semantics for both lists, spec-verified as above. No `aria-live` region announcing transfer results — the transfer tests (e.g. `'Move all transfers every source item regardless of selection'`) only assert final `source`/`target` array contents, not any announcement [not covered by tests].

**A11y verdict:** Covered — **resolved 2026-08-19.** Same roving-tabindex/arrow-key/Home-End/Enter-Space model as `OrderListComponent`, applied independently to each list (source and target track their own active index, so navigating one never disturbs the other's tab stop). The double-click transfer shortcut remains mouse-only — not a gap, since selecting an item via keyboard and then using one of the four Move buttons already reaches the same outcome by keyboard. Directly tested: `pick-list.component.spec.ts` — `'roving tabindex and arrow-key navigation work independently per list'`, `'Home/End move focus to the first/last item in a list'`, `'Enter/Space toggle selection on the focused option'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Rely on the four transfer buttons (or double-click) — there is no drag-and-drop, by deliberate design (`pick-list.component.ts:16-23`); "Move all" ignoring selection is directly spec-verified (`'Move all transfers every source item regardless of selection'`) | Don't assume list items are keyboard-selectable or keyboard-transferable — only `(click)`/`(dblclick)` are bound, confirmed by the spec never dispatching a `keydown` on any `role="option"` item; this is a real gap for keyboard-only users |
| Provide the required `<ng-template let-item>` — PickList fails to render without a projected item template, shared across both lists (`contentChild.required`, `pick-list.component.ts:99`) | Don't expect reordering within a single list — PickList only transfers items between `source`/`target`, it doesn't reposition items within one list (that's OrderList's job) |
| Trust that "move all" and reverse transfers are symmetric — directly asserted by spec (`'moving back to source works the same way in reverse'`) | Don't forget a successful transfer clears the source-side selection — confirmed by spec (`'moving to target clears the source selection'`), so the same items aren't accidentally re-selected post-transfer |

### Code example (Angular)
```html
<med-pick-list [(source)]="pickListSource" [(target)]="pickListTarget" sourceHeader="Available" targetHeader="Chosen" class="max-w-lg">
  <ng-template let-item>{{ item }}</ng-template>
</med-pick-list>
```
(Lifted from `projects/showcase/src/app/app.html:1309-1311`.)

### Source
- `projects/medra/ui/src/lib/pick-list/pick-list.component.ts`
- Showcase usage: `projects/showcase/src/app/app.html:1307-1313`
