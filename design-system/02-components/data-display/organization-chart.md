## Component: OrganizationChart

### Description
A single-root hierarchy (`med-organization-chart`, `value` one `OrgChartNode`, not an array — an org chart only ever has one top box) rendered with pure-CSS connector lines between a node and its children (each child `<li>` draws its own half of the horizontal line above it, so the line only ever spans between siblings). Supports single/multiple node selection centralized on the root component, while expand/collapse is local per-node state. Use it for reporting-line/hierarchy visualizations where there is exactly one top-level entity (contrast with Tree, which supports multiple roots).

### Variants
| Variant | When to use |
|---|---|
| No selection (`selectionMode` unset/`null`, default) | Purely a browsable/expandable hierarchy, boxes not selectable — `organization-chart.component.ts:38` |
| Single selection (`selectionMode="single"`) | One node selectable at a time — `organization-chart.types.ts:11`, `organization-chart.component.ts:51-53,56-66` |
| Multiple selection (`selectionMode="multiple"`) | Any number of nodes independently selectable — `organization-chart.types.ts:11`, `organization-chart.component.ts:51-53,57-60` |

### Props (Angular Inputs/Outputs)
**`OrganizationChartComponent` (`med-organization-chart`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `OrgChartNode \| null` | `null` | Root node — `organization-chart.component.ts:37` |
| `selectionMode` | `'single' \| 'multiple' \| null` | `null` | Selection mode — `organization-chart.component.ts:38` |
| `selection` | `OrgChartNode \| readonly OrgChartNode[] \| null` (model) | `null` | Selected node(s); shape depends on `selectionMode` — `organization-chart.component.ts:39` |
| `expandLabel` | `string` | `'Expand'` | `aria-label` for a collapsed node's toggle button — `organization-chart.component.ts:41` |
| `collapseLabel` | `string` | `'Collapse'` | `aria-label` for an expanded node's toggle button — `organization-chart.component.ts:42` |
| `class` | `string` | `''` | Extra classes on the host — `organization-chart.component.ts:43` |

**`OrgChartNode` data shape** (`organization-chart.types.ts:1-9`): `label: string`, `children?: readonly OrgChartNode[]`, `expanded?: boolean` (default `true`), `selectable?: boolean` (default `true`, opts a node out of selection, e.g. a vacant position), `class?: string` (extra classes on that node's box, `org-chart-node.component.ts:116`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default (collapsed node) | Chevron rotated -90° | `org-chart-node.component.ts:72` |
| Expanded node | Chevron pointing down, children row shown below with connectors | `org-chart-node.component.ts:72,77-88` |
| Hover (selectable node) | `hover:border-surface-300` / dark variant | `org-chart-node.component.ts:112` |
| Focus | `focus-visible:ring` styling on selectable boxes — `org-chart-node.component.ts:113-115` |
| Active/Selected | `border-brand-500 bg-brand-50 text-brand-700` (light) / dark equivalents — `org-chart-node.component.ts:109-111` |
| Disabled | Not implemented at the node level; a node can be excluded from selection via `selectable: false` but is not visually "disabled" — `organization-chart.types.ts:7` |
| Loading | Not implemented | — |
| Empty | Not implemented — with `value` `null` the template renders nothing (`@if (value(); as root)`), no placeholder/empty message — `organization-chart.component.ts:31-33` |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** No `role="tree"`/`role="treeitem"` found. Each selectable node box is a `<div role="button">` (not a real `<button>`, since it nests the expand/collapse `<button>` and a button can't nest another button — the component's own doc comment documents this trade-off, `org-chart-node.component.ts:34-38`) with `aria-pressed` — `org-chart-node.component.ts:57-59`. The expand/collapse toggle has `aria-expanded` and `aria-label` — `org-chart-node.component.ts:68-69`. Confirmed by spec: `organization-chart.component.spec.ts` — `'renders no role="button" anywhere when selectionMode is null'` asserts `role="button"` only appears once selection is active; `'clicking a selectable node selects it'` asserts `aria-pressed` flips to `"true"`; `'a node marked selectable: false cannot be selected'` asserts `role` stays `null` on a `selectable: false` node (CFO) even while `selectionMode="single"` is active elsewhere.
- **Keyboard navigation — resolved 2026-08-19:** each selectable node has `tabindex="0"` and responds to Enter/Space to toggle selection (`org-chart-node.component.ts:58,134-137`). Arrow-key navigation between nodes is now implemented, mapped to the chart's actual 2-D layout (one box above, its children in a horizontal row below) rather than Tree's vertical-list Up/Down: `ArrowUp` moves to the node's parent, `ArrowDown` moves to its first child (expanding a collapsed node first, rather than moving focus, mirroring Tree's `ArrowRight`-expands-then-moves two-step), and `ArrowLeft`/`ArrowRight`/`Home`/`End` move among the current node's *siblings* — there is no single flattened order across branches for Home/End to jump to a chart-wide "start"/"end", so they're scoped to siblings instead. A `selectable: false` node is transparently skipped as a navigation target, the same as it's already skipped in the Tab order. Tab order itself is unchanged: every selectable node remains independently Tab-reachable (no roving tabindex) — a deliberate difference from `Dock`'s toolbar, since an org chart is browsed non-linearly (jumping straight to a distant box is common) and collapsing it to one Tab stop would cost more than it saves. Confirmed by `organization-chart.component.spec.ts` — `'ArrowDown from the root moves focus to its first child'`, `'ArrowDown on a collapsed node expands it instead of moving focus'`, `'ArrowUp moves focus from a child to its parent'`, `'ArrowUp from the root is a no-op (no parent to move to)'`, `'ArrowRight/ArrowLeft move focus between selectable siblings'`, `'Home/End jump to the first/last selectable sibling'`, `'a selectable: false sibling (CFO) is skipped as a navigation target'`. `org-chart-node.component.ts:130-222`
- **Screen reader:** `aria-expanded`, `aria-pressed`, `aria-label` on the toggle button as above, with `aria-pressed` directly spec-verified. No `aria-level`/`aria-setsize`/`aria-posinset` [not covered by tests] — the chart still doesn't adopt `role="tree"`/`role="treeitem"` ARIA treeview semantics (its boxes stay `role="button"`), only the arrow-key interaction model was brought up to Tree's standard; a full ARIA treeview conversion would be a larger, separate change to the roles themselves.

**A11y verdict:** Covered — **arrow-key navigation gap resolved 2026-08-19** (see Keyboard navigation above); the `role="button"`/`aria-pressed`/`selectable: false` exclusion logic remains directly spec-verified as before (button role appears only under an active selection mode, non-selectable nodes stay role-less and unselectable, Enter/Space-key selection works). Remaining scope note: this is still a `role="button"` node model, not a full ARIA `role="tree"`/`role="treeitem"` treeview conversion — the interaction model now matches Tree's arrow-key ergonomics, but the underlying roles were deliberately left as-is (a larger, separate change).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `selectable: false` on vacant/placeholder positions to exclude them from selection while `selectionMode` is active (`organization-chart.types.ts:7`); confirmed by spec `'a node marked selectable: false cannot be selected'` | Don't expect `role="tree"`/`role="treeitem"` ARIA semantics — nodes are `role="button"` boxes; arrow-key navigation was added (2026-08-19) but the underlying roles were not converted |
| Use ArrowUp/ArrowDown/ArrowLeft/ArrowRight/Home/End to move between nodes — mapped to the chart's 2-D layout (parent/child vertically, siblings horizontally), confirmed by spec's `'keyboard navigation (Wave 2 fix — 2026-08-19)'` suite | Don't expect Home/End to jump to the first/last node in the *whole* chart — they only move to the first/last *sibling* of the currently focused node, since there's no single flattened order across branches |
| Pass a single root `OrgChartNode` — unlike Tree, `value` is not an array (`organization-chart.component.ts:37`); confirmed by spec `'renders nothing when value is null'` | Don't expect a placeholder/message when `value` is `null` — the chart simply renders nothing, directly confirmed by spec |
| Trust Enter-key selection on a focused node — directly asserted by spec (`'Enter selects a focused node'`) | Don't assume clicking an already-selected node toggles it off — spec (`'clicking the already-selected node again is a no-op'`) confirms single-selection mode has radio semantics, not toggle-off |

### Code example (Angular)
```html
<med-organization-chart [value]="orgChartValue" selectionMode="single" [(selection)]="orgChartSelection" />
```
(Lifted from `projects/showcase/src/app/app.html:1212`.)

### Source
- `projects/medra/ui/src/lib/organization-chart/organization-chart.component.ts`
- `projects/medra/ui/src/lib/organization-chart/org-chart-node.component.ts`
- `projects/medra/ui/src/lib/organization-chart/organization-chart.types.ts`
- `projects/medra/ui/src/lib/organization-chart/organization-chart.tokens.ts` (`OrgChartHost` DI coordinator abstract class)
- Showcase usage: `projects/showcase/src/app/app.html:1210-1214`
