# Plan: add-data-table-column-reorder

## Summary

All behavior lives in `projects/medra/ui/src/lib/data-table/` (`data-table.component.ts`, `table-column.component.ts`, `data-table.types.ts`). A `columnOrder` signal of field names plus an `orderedColumns` computed put the declared columns in the user's order, and `visibleColumns` is derived from it, so rendering, spans, frozen offsets and CSV export follow the order with no other change (DAT-034). Header cells of reorderable columns become HTML5 drag sources and drop targets, and Alt+ArrowLeft/Right on a focused header calls the same move function; both paths emit `colReorder` and write an announcement into a visually hidden live region. The DataTable docs page gains an `example-column-reorder` section (DAT-024.S9), and a `minor` changeset records the new API.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | D-01 to D-05 use `input()`, `output()`, `signal()` and `computed()` on the existing standalone components; the demo is standalone |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | The drop-target highlight and drag state (D-03) use the existing brand and surface tokens with `dark:` variants through `headerCellClass`; the consumer `class` path through `mergeClasses` is unchanged |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay or icon is added |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | No form control is added or changed |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps DAT-034.S1–S11 and DAT-024.S9; DAT-034.S1, S5, S8 and DAT-024.S9 depend on layout or real drag and get Playwright coverage; tasks will order `[TEST]` first |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | D-04 gives the keyboard path (Alt+Arrow, `tabindex` 0 on reorderable headers, focus kept on the header) and a `role="status"` live region; S8 and S9 test them; focus-visible styling reuses the header's token classes and is checked in the real-browser test |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Original logic written against DAT-034; no icon added; all code, docs and the changeset are English |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | The only new string is the live-region announcement, produced by the `columnMoveAnnouncement` input with an English default (D-04); no translation service |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | D-06 adds a `minor` changeset; `package.json` peer ranges are untouched |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` (unit); `npx playwright test e2e/site/data-table-column-reorder.spec.ts e2e/site/data-table-docs.spec.ts` (e2e)
- **Framework:** Jest with `jest-preset-angular` and Angular `TestBed`; Playwright against the docs site

| Scenario | Level | Test location |
|---|---|---|
| `DAT-034.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent column reorder')`) |
| `DAT-034.S1` | e2e | `e2e/site/data-table-column-reorder.spec.ts` (real pointer drag on the docs demo) |
| `DAT-034.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-034.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-034.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-034.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (order and `frozen` state) |
| `DAT-034.S5` | e2e | `e2e/site/data-table-column-reorder.spec.ts` (sticky offsets after the move) |
| `DAT-034.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-034.S7` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-034.S8` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (order, event, live region) |
| `DAT-034.S8` | e2e | `e2e/site/data-table-column-reorder.spec.ts` (focus stays on the header after the move) |
| `DAT-034.S9` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-034.S10` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-034.S11` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test; must pass with the new entry) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test; must pass with the new entry) |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S7` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S8` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S9` | e2e | `e2e/site/data-table-docs.spec.ts` and `e2e/site/data-table-column-reorder.spec.ts` |

## Column order model

- `columnOrder = signal<readonly string[] | null>(null)` holds field names; `null` means declaration order. `orderedColumns` sorts `columns()` by it, with fields missing from the order (columns added later) appended in declaration order and unknown fields ignored. `visibleColumns` becomes `orderedColumns().filter(visible)`. Sort, the default global-filter fields and width state keep reading `columns()` and field keys, so order never affects them.
- `moveColumn(fromField, toField)` works on the full order including hidden columns: it removes the dragged field and re-inserts it at the target's index, so `dragIndex` and `dropIndex` are the full-order positions before and after. It returns `false` and does nothing when the fields are equal, either column has `reorderable` false, or the two differ in `frozen` or `alignFrozen`. Otherwise it sets `columnOrder` and emits `colReorder`.
- `TableColumnReorderEvent { dragIndex; dropIndex; columns: readonly string[] }` goes in `data-table.types.ts`, next to `TableRowReorderEvent`.
- Keyboard resolves the target as the nearest visible column in the arrow's direction, then calls `moveColumn`, so the edge, frozen and `reorderable` limits are the drag limits.

## Decisions

### D-01: A field-name order signal over `columns()`, not a mutation of the content children

**Choice:** Keep `contentChildren(TableColumnComponent)` untouched and layer `columnOrder` and `orderedColumns` on top; `visibleColumns` reads `orderedColumns`.
**Alternatives:** Reorder the DOM or the content-children array (not possible, it is a read-only query result); keep a parallel index array instead of field names; add the order to the `stateKey` state.
**Rationale:** Field names survive columns being added, removed or hidden, and one derived list keeps rendering, spans, frozen offsets and CSV consistent, as D-03 of the archived resize change did for `visible`. Persisting the order is out of scope per the proposal.

### D-02: The order is over all columns, hidden ones included

**Choice:** `moveColumn` indexes into `orderedColumns()` (hidden columns included), and `colReorder` reports those indices.
**Alternatives:** Index only visible columns and place hidden ones by a rule; drop hidden columns from the order.
**Rationale:** DAT-034 states that a hidden column keeps its place and that indices cover hidden columns, so showing it later (S6) needs no extra rule.

### D-03: Native HTML5 drag and drop on the header cell

**Choice:** `[draggable]` on `th` of reorderable columns, with `dragstart`, `dragover`, `dragenter`/`dragleave`, `drop` and `dragend` handlers, a `draggedColumn` field and a `dropTargetField` signal that styles the valid target. `dragover` calls `preventDefault` only over a valid target, so invalid targets (S4, S7) show no drop cursor. `dragstart` is cancelled while `colResizeState` is set, because the resize handle sits inside the `th` and its `pointerdown` runs first.
**Alternatives:** Pointer events with a drag ghost; the CDK drag-drop module.
**Rationale:** The same native approach already drives row reorder (`onRowDragStart`, `onRowDrop`), adds no dependency, and works with Playwright's `dragTo`. Pointer events would need a ghost and hit-testing for no benefit here.

### D-04: Alt+Arrow on the header, focus kept explicitly, announcement through an overridable input

**Choice:** `onHeaderKeydown` handles `Alt+ArrowLeft/Right` before its sort branch and calls `preventDefault`. A reorderable column's `th` gets `tabindex` 0 (as sortable ones do today) so it can take focus, and `headerCellClass` applies its existing `focus-visible` ring (today sortable-only) to reorderable headers too. After a move, the handler refocuses the header by field once the view updates (`afterNextRender`). A visually hidden `<span role="status" aria-live="polite">` shows the text of a new `columnMoveAnnouncement` input, `(header, position, total) => string`, default `` `${header} moved to position ${position} of ${total}` ``, where position counts visible columns.
**Alternatives:** Rely on the browser keeping focus when `@for` moves the node; a fixed English string; a shared announcer service.
**Rationale:** Moving a focused node can drop focus in some browsers, so refocusing is cheap insurance, verified in the real browser (S8). Article VIII requires the string to be overridable and bars a translation service. The input is the minimum new API beyond the proposal and only supplies text for the announcement DAT-034 requires.

### D-05: Off by default, and inert without `reorderableColumns`

**Choice:** `reorderableColumns` defaults to `false`; with it off, `th` has no `draggable`, no drag handlers act and Alt+Arrow falls through to the existing sort branch unchanged. `med-table-column` gains `reorderable` (default `true`).
**Alternatives:** Always-on with per-column opt-out.
**Rationale:** DAT-034 and S11 require the feature to be opt-in so existing tables are unchanged.

### D-06: Docs example and a `minor` changeset

**Choice:** Add `{ id: 'example-column-reorder', label: 'Column reorder' }` after `example-column-groups` in `EXAMPLES` and a matching section in `projects/site/src/app/pages/docs/components/data-table.page.ts`, with prose, a demo showing `colReorder` and a code block. Add `.changeset/data-table-column-reorder.md` as `minor` for `@medra.dev/ui`.
**Alternatives:** Extend the column groups section; a `patch` changeset.
**Rationale:** DAT-024 needs one section per example with its own demo and code block, and the S9 e2e needs a dedicated demo to drag in. New public API is a `minor`; `major` is barred by Article X.
