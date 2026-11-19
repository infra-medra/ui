## Component: TreeTable

### Description
Applies DataTable's column model (`med-table-column`, the same `field`/`header`/`cellTemplate` contract, reused unchanged) to hierarchical rows instead of a flat array. Because a `<tr>` can't nest another `<tr>`, the tree is flattened into an ordered `{ node, depth }[]` (descending into a node's children only when expanded) and rendered as one flat `@for`; the first column's cell adds indentation (`depth * 1.25rem`) and the expand/collapse toggle. This is a v1 scope cut: no sorting, filtering, pagination, or row selection — each of those doesn't have an obviously "correct" meaning once rows are hierarchical, so the release focuses on getting flattening/indent/expand mechanics right first (`tree-table.component.ts:33-41`).

### Variants
| Variant | When to use |
|---|---|
| (none — single behavior) | TreeTable has no `@Input()`-driven visual/behavioral variants beyond column configuration; every instance behaves the same (expand/collapse only, no sort/filter/paginate/select) |

### Props (Angular Inputs/Outputs)
**`TreeTableComponent<T>` (`med-tree-table`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly TreeTableNode<T>[]` | `[]` | Root row(s) — `tree-table.component.ts:104` |
| `ariaLabel` | `string \| null` | `null` | `aria-label` on the `<table>` — `tree-table.component.ts:51,105` |
| `emptyLabel` | `string` | `'No results found'` | Text shown in the empty-state row — `tree-table.component.ts:106` |
| `expandLabel` | `string` | `'Expand'` | `aria-label` for a collapsed row's toggle button — `tree-table.component.ts:108` |
| `collapseLabel` | `string` | `'Collapse'` | `aria-label` for an expanded row's toggle button — `tree-table.component.ts:109` |
| `class` | `string` | `''` | Extra classes on the scroll wrapper — `tree-table.component.ts:110` |

**`TreeTableNode<T>` data shape** (`tree-table.types.ts:1-6`): `data: T`, `children?: readonly TreeTableNode<T>[]`, `expanded?: boolean` (default `true`).

Columns are declared as `med-table-column` content children — the same `TableColumnComponent` used by DataTable (`field`, `header`, `sortable`* , `align`, `width`, projected cell template). *Note: `sortable` has no effect in TreeTable since sorting is not implemented here (see Description).

### States
| State | Visual | Behavior |
|---|---|---|
| Default (collapsed row) | Chevron rotated -90° | `tree-table.component.ts:74` |
| Expanded row | Chevron pointing down, children rows shown at `depth+1` | `tree-table.component.ts:74,119-133` |
| Hover | `hover:bg-surface-50` / dark variant on rows — `tree-table.component.ts:61` |
| Focus | No custom focus-visible ring found on rows (rows are not focusable/selectable) | — |
| Active/Selected | N/A — row selection not implemented (v1 scope cut, `tree-table.component.ts:33-41`) | — |
| Disabled | Not implemented | — |
| Loading | Not implemented | — |
| Empty | `@empty` block renders a centered `emptyLabel()` row spanning all columns — `tree-table.component.ts:93-96` |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Real `<table>`/`<thead>`/`<tbody>`/`<th scope="col">`/`<td>` markup with `aria-label` on the table (`tree-table.component.ts:51`). The row expand/collapse toggle button has `aria-expanded` and `aria-label` (`tree-table.component.ts:83-84`). **Resolved 2026-08-19:** each `<tr>` (implicit `role="row"` inside `<table>`) now also carries `aria-level` (1-based depth), `aria-posinset`/`aria-setsize` (position among same-parent siblings), and its own `aria-expanded` when it has children — the same convention `TreeComponent`'s `role="treeitem"` rows already use. Confirmed by `tree-table.component.spec.ts` — `'every row carries aria-level, aria-posinset, and aria-setsize'`, `'a row with children reflects its expanded state via aria-expanded on the row itself, not just the toggle button'`. `tree-table.component.ts:68-71`
- **Keyboard navigation — resolved 2026-08-19:** Rows now use roving tabindex (one row is the Tab stop at a time) with a row-level treegrid keyboard model: Up/Down move focus one visible row; Right expands a collapsed parent or steps into its first child; Left collapses an expanded parent or steps out to its own parent row; Home/End jump to the first/last visible row. Deliberately row-level, not full 2-D cell navigation, since TreeTable has no per-cell interaction to navigate to (see the component's scope-cut doc). Confirmed by `tree-table.component.spec.ts` — `'roving tabindex: only the first row is in the Tab order initially'`, `'ArrowDown/ArrowUp move the roving tab stop and focus by one visible row'`, `'Home/End jump to the first/last visible row'`, `'ArrowRight on a collapsed parent expands it without moving focus; on an expanded parent it steps into the first child'`, `'ArrowLeft on an expanded parent row collapses it, hiding its descendants'`, `'ArrowLeft on a leaf row moves focus up to its parent row'`. `tree-table.component.ts:202-272`
- **Screen reader:** `aria-expanded`/`aria-label` on the toggle button, plus the row's own `aria-level`/`aria-expanded`/`aria-posinset`/`aria-setsize` above — depth is now exposed via ARIA, not just the visual `padding-left` indent (confirmed by spec `'a deeper row indents further than its parent'`, which still checks the visual indent independently).

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: `aria-level`/`aria-posinset`/`aria-setsize`/row-level `aria-expanded` were added to convey hierarchy depth to assistive technology, and row-level keyboard navigation (Up/Down/Left/Right/Home/End, roving tabindex) was implemented in addition to the pre-existing toggle-button Tab/Enter/Space. See the Keyboard navigation and Role/ARIA sections above for the tests.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Reuse the exact same `med-table-column` you already use with DataTable — field/header/cellTemplate contract is unchanged (`tree-table.component.ts:14-17`); confirmed by spec `'renders every column value from the row's own data'` | Don't expect sorting, filtering, pagination, or row selection — none are implemented in v1 (`tree-table.component.ts:33-41`) |
| Rely on `node.expanded` (default `true`) to control each branch's initial visibility — internal expand overrides are stored separately and don't mutate your data (`tree-table.component.ts:27-31,114-115`); confirmed by spec `'flattens the tree into one row per node, in document order, expanded by default'` | Don't pass a `sortable` attribute on `med-table-column` expecting it to sort TreeTable rows — TreeTable never reads/acts on it |
| Trust that toggling preserves per-branch expand state across re-expansion — directly asserted by spec `'re-expanding shows descendants again (toggle state is not lost)'` | Don't expect column-wise (cell-level) Left/Right navigation — Left/Right are row-level only (expand/collapse/step-to-parent-or-child), since TreeTable has no per-cell interaction to navigate to |

### Code example (Angular)
```html
<med-tree-table [value]="treeTableValue" ariaLabel="Company org" class="max-w-lg">
  <med-table-column field="name" header="Name" />
  <med-table-column field="role" header="Role" />
</med-tree-table>
```
(Lifted from `projects/showcase/src/app/app.html:1289-1292`.)

### Source
- `projects/medra/ui/src/lib/tree-table/tree-table.component.ts`
- `projects/medra/ui/src/lib/tree-table/tree-table.types.ts`
- `projects/medra/ui/src/lib/data-table/table-column.component.ts` (reused column component)
- Showcase usage: `projects/showcase/src/app/app.html:1289-1292`
