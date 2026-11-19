## Component: Tree

### Description
A vertically indented hierarchy (`med-tree`, `value` a flat `readonly TreeNode[]` of root nodes — a tree commonly has several top-level entries, e.g. multiple drives/root folders, unlike OrganizationChart's single root). Each node recursively renders itself via `med-tree-node`, supports expand/collapse per branch, and optional single/multiple/checkbox selection driven by a reverse-DI `TreeHost` coordinator. Use it for file-system-like or nested-category hierarchies where multiple roots and per-node expand state are needed.

### Variants
| Variant | When to use |
|---|---|
| No selection (`selectionMode` unset/`null`, default) | Purely a browsable/expandable hierarchy, rows not selectable — `tree.component.ts:47` |
| Single selection (`selectionMode="single"`) | One node selectable at a time, highlighted background — `tree.types.ts:17`, `tree.component.ts:60-63,66-71` |
| Multiple selection (`selectionMode="multiple"`) | Any number of nodes selectable, highlighted background — `tree.types.ts:17`, `tree.component.ts:60-63,72-75` |
| Checkbox selection (`selectionMode="checkbox"`) | Mechanically identical to `multiple` (each node toggles independently) but renders a checkbox glyph instead of a highlighted row — `tree.types.ts:11-16`, `tree-node.component.ts:49-55` |

### Props (Angular Inputs/Outputs)
**`TreeComponent` (`med-tree`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly TreeNode[]` | `[]` | Root node array — `tree.component.ts:46` |
| `selectionMode` | `'single' \| 'multiple' \| 'checkbox' \| null` | `null` | Selection mode — `tree.component.ts:47` |
| `selection` | `TreeNode \| readonly TreeNode[] \| null` (model) | `null` | Selected node(s); shape depends on `selectionMode` — `tree.component.ts:48` |
| `expandLabel` | `string` | `'Expand'` | `aria-label` for a collapsed node's toggle button — `tree.component.ts:50` |
| `collapseLabel` | `string` | `'Collapse'` | `aria-label` for an expanded node's toggle button — `tree.component.ts:51` |
| `class` | `string` | `''` | Extra classes on the host — `tree.component.ts:52` |

**`TreeNode` data shape** (`tree.types.ts:1-9`): `label: string`, `icon?: string`, `children?: readonly TreeNode[]`, `expanded?: boolean` (default `true`), `selectable?: boolean` (default `true`, opts a node out of selection even when `selectionMode` is set).

### States
| State | Visual | Behavior |
|---|---|---|
| Default (collapsed node) | Chevron rotated -90° | `tree-node.component.ts:44` |
| Expanded node | Chevron pointing down, children `<ul>` rendered | `tree-node.component.ts:44,62-70` |
| Hover (selectable node) | `hover:bg-surface-100` / dark variant | `tree-node.component.ts:111` |
| Focus | `focus-visible:ring` styling on selectable rows — `tree-node.component.ts:112-114` |
| Active/Selected | `bg-brand-50`/`text-brand-700` (single/multiple) or filled checkbox glyph (checkbox mode) — `tree-node.component.ts:98-99,110` |
| Disabled | Not implemented at the node level; a node can be excluded from selection via `selectable: false` but is not visually "disabled," just non-interactive — `tree.types.ts:8` |
| Loading | Not implemented | — |
| Empty | Not implemented — no explicit empty-state text for a zero-length `value` (renders an empty `<ul>`) | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** No `role="tree"`/`role="treeitem"`/`role="group"` found anywhere in `tree.component.ts` or `tree-node.component.ts` — the tree is plain `<ul>`/`<li>` markup. Each selectable row is a `<div role="button">` (not `role="treeitem"`) with `aria-pressed` (single/multiple mode) or `aria-checked` (checkbox mode) — `tree-node.component.ts:29-32`. The expand/collapse toggle button has `aria-expanded` and `aria-label` — `tree-node.component.ts:40-41`. Confirmed by spec: `tree.component.spec.ts` — `'renders no role="button" anywhere when selectionMode is null'` directly asserts the absence of `role="button"` when selection is off, confirming `role="button"` is only added under an active `selectionMode`; `'a node marked selectable: false cannot be selected'` asserts a `selectable: false` node's row has `role` `null` even while `selectionMode="single"` is active elsewhere on the tree; `'behaves like multiple selection, with aria-checked reflecting membership'` asserts `aria-checked` flips `"false"` → `"true"` in checkbox mode.
- **Keyboard navigation:** Each selectable row has `tabindex="0"` and responds to Enter/Space to toggle selection (`tree-node.component.ts:30,124-131`). No arrow-key navigation between nodes was found — the full WAI-ARIA APG "Treeview" keyboard model (Up/Down/Left/Right, roving tabindex) is not implemented; every node is independently Tab-reachable instead. Confirmed by spec: `tree.component.spec.ts` — `'Enter selects a focused node'` dispatches `KeyboardEvent({ key: 'Enter' })` and asserts selection updates. No test dispatches Space, ArrowUp/Down/Left/Right, or Home/End on any node [not covered by tests] — consistent with source showing no such handlers exist.
- **Screen reader:** `aria-expanded`, `aria-pressed`/`aria-checked`, `aria-label` on the toggle button as above. No `aria-level`, `aria-setsize`, or `aria-posinset` found (elements a real `role="treeitem"` implementation would typically need) [not covered by tests].

**A11y verdict:** Covered — **resolved 2026-08-19.** Rows are now `role="treeitem"` (upgraded from `role="button"`) with `aria-level`/`aria-setsize`/`aria-posinset` (computed locally at each recursion level, passed down as new required inputs — no need to centralize the deliberately-local `expanded` state), the root `<ul>` is `role="tree"`, nested children are `role="group"`, and `aria-selected` now reflects single/multiple selection (checkbox mode keeps `aria-checked`, unchanged). ArrowUp/Down move focus across the whole visible tree (crossing sibling/parent boundaries via a DOM query against the nearest `[role="tree"]` ancestor — a collapsed branch's children are simply never rendered, so the query already reflects visible order with no extra filtering); ArrowRight/Left expand/collapse or move to the first child / parent row; Home/End jump to the first/last visible row. Directly tested: `tree.component.spec.ts` — full `describe('ARIA tree roles ...')` and `describe('keyboard tree navigation ...')` blocks (8 tests).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `selectionMode="checkbox"` when you want a checkbox affordance instead of a highlighted row — it does not add cascading parent/child selection (checking a parent does not auto-check descendants, no indeterminate state) — explicit v1 scope cut (`tree.component.ts:17-26`); confirmed by spec `'toggles nodes in and out of the selection array, including nested nodes'`, which shows a child node toggling independently of its parent | Don't rely on ARIA tree semantics (`role="tree"`/`treeitem`) or arrow-key navigation — neither is implemented, and no spec test exercises Arrow/Home/End keys; screen-reader users get a generic list of buttons, not a native treeview experience |
| Set `selectable: false` on a `TreeNode` to make it non-interactive even under an active `selectionMode` (e.g. a category header) — `tree.types.ts:8`; confirmed by spec `'a node marked selectable: false cannot be selected'`, which shows both `role` staying `null` and a click being a no-op | Don't expect an empty-state message for a zero-item `value` — none is rendered, and no spec test covers an empty `value` array |
| Test Enter-key selection with confidence — directly asserted by spec (`'Enter selects a focused node'`) | Don't assume Space also activates a tree row — unlike Accordion/DataTable, Tree's spec never dispatches a Space `keydown`, so this path is unverified either way |

### Code example (Angular)
```html
<med-tree [value]="treeNodes" selectionMode="single" [(selection)]="treeSingleSelection" class="max-w-sm" />
<med-tree [value]="treeNodes" selectionMode="checkbox" [(selection)]="treeCheckboxSelection" class="max-w-sm" />
```
(Lifted from `projects/showcase/src/app/app.html:1276-1281`.)

### Source
- `projects/medra/ui/src/lib/tree/tree.component.ts`
- `projects/medra/ui/src/lib/tree/tree-node.component.ts`
- `projects/medra/ui/src/lib/tree/tree.types.ts`
- `projects/medra/ui/src/lib/tree/tree.tokens.ts` (`TreeHost` DI coordinator abstract class)
- Showcase usage: `projects/showcase/src/app/app.html:1276-1282`
