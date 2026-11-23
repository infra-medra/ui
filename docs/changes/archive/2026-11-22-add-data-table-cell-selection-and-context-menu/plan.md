# Plan: add-data-table-cell-selection-and-context-menu

## Summary

`DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) gains cell-level selection (`cellSelection`, `cellSelect`, `cellUnselect` for DAT-043), conditional body-cell styling (`cellClass` for DAT-044), and `ContextMenuDirective` integration (`contextMenu`, `contextMenuSelection`, `contextMenuSelect` for DAT-045). `ContextMenuDirective` (`projects/medra/ui/src/lib/context-menu/context-menu.directive.ts`) exposes a public `show()` method so `DataTableComponent` opens the shared `TieredMenuPanelComponent` overlay at either the cursor coordinates or the focused row element. `data-table.types.ts` (re-exported via `public-api.ts`) adds `TableCellSelection<T>` and `TableContextMenuSelectEvent<T>`. The DataTable documentation page (`projects/site/src/app/pages/docs/components/data-table.page.ts`) adds three live demos and prose sections (`DAT-024.S13`) verified by Playwright alongside unit tests in `data-table.component.spec.ts`.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | `DataTableComponent`, `ContextMenuDirective`, and new doc demo components are standalone and use `input`, `model`, `output`, and `computed` signals without zone.js. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Selected cell and context-highlighted row classes use existing theme tokens (`brand-*`, `surface-*`, `dark:` variants) and `mergeClasses()` via `bodyCellClass` / `rowClassFor`. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | `DAT-045` delegates menu opening to `ContextMenuDirective.show()`, which uses `OverlayService` and `TieredMenuPanelComponent`. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | Neither `DataTableComponent` nor `ContextMenuDirective` is a form-control `ControlValueAccessor`. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps `DAT-043.S1–S2`, `DAT-044.S1`, and `DAT-045.S1–S2` to Jest unit tests and `DAT-024.S1–S13` to Playwright e2e tests; tasks will order `[TEST]` tasks first. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Selectable cells expose `aria-selected`, `tabindex="0"`, `Enter`/`Space` activation, and visible focus rings; row context menu supports `Shift+F10` and `ContextMenu` keys. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, TSDoc, demos, and doc prose are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | No new hardcoded internal UI strings are introduced; demo strings and `MenuItem` labels are consumer-supplied. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Change adds a `minor` changeset without altering Angular major or peer dependency ranges. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (unit) and `npx playwright test --reporter=list --project=site e2e/site/data-table-cell-context.spec.ts e2e/site/data-table-docs.spec.ts` (e2e)
- **Framework:** Jest (unit) and Playwright (e2e)

| Scenario | Level | Test location |
|---|---|---|
| `DAT-043.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-043.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-044.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-045.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-045.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S6` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-024.S7` | e2e | `e2e/site/data-table-resize-visibility-groups.spec.ts` |
| `DAT-024.S8` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-024.S9` | e2e | `e2e/site/data-table-column-reorder.spec.ts` |
| `DAT-024.S10` | e2e | `e2e/site/data-table-row-editing.spec.ts` |
| `DAT-024.S11` | e2e | `e2e/site/data-table-column-filters.spec.ts` |
| `DAT-024.S12` | e2e | `e2e/site/data-table-slots-skeleton.spec.ts` |
| `DAT-024.S13` | e2e | `e2e/site/data-table-cell-context.spec.ts` |

## Architecture & Interfaces

- **Types (`projects/medra/ui/src/lib/data-table/data-table.types.ts`):**
  - `TableCellSelection<T = unknown>`: `{ readonly row: T; readonly field: string }`.
  - `TableContextMenuSelectEvent<T = unknown>`: `{ readonly originalEvent: Event; readonly row: T; readonly field?: string }`.
- **ContextMenuDirective (`projects/medra/ui/src/lib/context-menu/context-menu.directive.ts`):**
  - Public `show(origin: MouseEvent | { x: number; y: number } | HTMLElement, preventDefault?: () => void): void` delegates to `open(...)` using `CONTEXT_MENU_POSITIONS` when `origin` is a `MouseEvent` or point, and default positions when `origin` is an `HTMLElement`.
- **DataTableComponent (`projects/medra/ui/src/lib/data-table/data-table.component.ts`):**
  - Inputs/models/outputs: `cellSelection = input(false, { transform: booleanAttribute })`, `cellSelect = output<TableCellSelection<T>>()`, `cellUnselect = output<TableCellSelection<T>>()`, `cellClass = input<((row: T, field: string) => string) | null>(null)`, `contextMenu = input<ContextMenuDirective | null>(null)`, `contextMenuSelection = model<T | null>(null)`, `contextMenuSelect = output<TableContextMenuSelectEvent<T>>()`.
  - When `cellSelection()` is `true` and `selectionMode()` is `'single'` or `'multiple'`, row-level click/keyboard selection and row `tabindex`/`aria-selected` are suppressed in favor of data `<td>` `tabindex="0"`, `aria-selected`, click, and `Enter`/`Space` handlers; `selection()` stores `TableCellSelection<T> | null` (`single`) or `readonly TableCellSelection<T>[]` (`multiple`).
  - Body `<tr>` binds `(contextmenu)` and `(keydown)` (`Shift+F10` / `ContextMenu`) to update `contextMenuSelection`, emit `contextMenuSelect`, and call `contextMenu()?.show(...)` when `contextMenu()` is non-null.

## Decisions

### D-01: Reuse `selection` and `selectionMode` with a `cellSelection` toggle

**Choice:** Keep `selectionMode` (`'single' | 'multiple'`) and `selection` (`model`) as the state container when `cellSelection` is `true`, holding `TableCellSelection<T> | null` or `readonly TableCellSelection<T>[]`.
**Alternatives:** Introduce separate `selectedCell` / `selectedCells` models alongside `selection`.
**Rationale:** Matches PrimeNG's `[cellSelection]="true"` + `[(selection)]` mental model and avoids duplicating `dataKey` / `selectionMode` configuration inputs.

### D-02: Expose `show()` on `ContextMenuDirective` instead of opening overlays inside `DataTableComponent`

**Choice:** Add a public `show(origin, preventDefault?)` method to `ContextMenuDirective` and pass `[contextMenu]="cm"` into `DataTableComponent`.
**Alternatives:** Inject `OverlayService` inside `DataTableComponent` and render `TieredMenuPanelComponent` directly.
**Rationale:** Satisfies Constitution Article III by keeping all context-menu overlay positioning, `itemSelect`, and close lifecycle inside `ContextMenuDirective`.

### D-03: Pass `(row, field) => string` to `cellClass`

**Choice:** Type `cellClass` as `((row: T, field: string) => string) | null`, matching `rowClass: ((row: T) => string) | null`.
**Alternatives:** Pass a `{ row, field, value }` object or a per-column `cellClass` input on `TableColumnComponent`.
**Rationale:** Keeps `cellClass` symmetric with `rowClass` on `DataTableComponent` and avoids requiring consumers to repeat callbacks across columns.
