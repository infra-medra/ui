# Plan: persist-data-table-extended-state

## Summary

`med-data-table` widens the object it already writes under `stateKey` with seven keys (column order, resized widths, per-column visibility, collapsed row groups, global filter text, `multiSortMeta` and page size), shaped as in `contracts/stored-table-state.md` (DAT-056, DAT-010). All work stays in `projects/medra/ui/src/lib/data-table/`: the persist effect reads the new signals, and `restoreTableState` becomes a list of per-key parsers in a new pure module, `data-table-state.ts`, so one bad key never blocks the rest and every key that names a column is checked against the declared columns. `med-table-column` keeps its `visible` input and gains a `visibleChange` output plus an internal effective visibility that the table can override, which gives applications `[(visible)]` without breaking `visible="false"`. The restored global filter is written to `globalFilterValue` and the search box text directly, skipping the debounce. The persisted state demo and its prose on the DataTable docs page are extended (DAT-024.S18) and a `minor` changeset is added.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | The column adds `output()` and a `linkedSignal`; the table keeps its `effect`-based persist and restore; the parser module is plain functions (D-01, D-02). |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | n/a | No element, class or style is added or changed; restored widths reuse the existing `columnWidth()` binding. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay or icon is added. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | The table and column are not form controls. Falsy stored values are told apart by type checks: `""` is a valid global filter, `0` is a valid `first`, `false` a valid visibility (contract). |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps all 9 DAT-056 scenarios, the 3 kept DAT-010 scenarios and DAT-024.S18; tasks order each `[TEST]` first. The restored width in DAT-056.S1 also gets a Playwright check on the docs demo, since column width is layout. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | n/a | No interactive element is added or changed. A restored order and visibility reuse the existing header rendering, so `aria-sort`, focus and Alt+Arrow behave as before (covered by existing DAT-034 tests). |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Parsers, demo and prose are written for this change, in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No UI string is added; the demo's labels are application text. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | `.changeset/data-table-extended-state.md` is `minor`; peer ranges are untouched (D-07). |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | DAT-056.S2 leaves `rows`, `expandedRowGroups`, `globalFilterValue` and `multiSortMeta` unset to assert their defaults; S1 asserts all eight Then clauses; S6 asserts both the restore and the later override. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` and `npx playwright test e2e/site/data-table-state.spec.ts --trace off`
- **Framework:** Jest with Angular TestBed; Playwright for the docs demo

| Scenario | Level | Test location |
|---|---|---|
| `DAT-056.S1` | integration | `projects/medra/ui/src/lib/data-table/data-table-persisted-state.spec.ts`; width also in `e2e/site/data-table-state.spec.ts` |
| `DAT-056.S2` | integration | `projects/medra/ui/src/lib/data-table/data-table-persisted-state.spec.ts` |
| `DAT-056.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts` (parser) and `data-table-persisted-state.spec.ts` (table) |
| `DAT-056.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts` and `data-table-persisted-state.spec.ts` |
| `DAT-056.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts` |
| `DAT-056.S6` | integration | `projects/medra/ui/src/lib/data-table/data-table-persisted-state.spec.ts` |
| `DAT-056.S7` | integration | `projects/medra/ui/src/lib/data-table/data-table-persisted-state.spec.ts` |
| `DAT-056.S8` | integration | `projects/medra/ui/src/lib/data-table/data-table-persisted-state.spec.ts` |
| `DAT-056.S9` | integration | `projects/medra/ui/src/lib/data-table/data-table-persisted-state.spec.ts` |
| `DAT-010.S1` | integration | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing, unchanged) |
| `DAT-010.S2` | integration | `projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` (existing, must stay green) |
| `DAT-010.S3` | integration | `projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` (existing, must stay green) |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S7` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S8` | e2e | `e2e/site/data-table-frozen.spec.ts` (existing, must stay green) |
| `DAT-024.S9` | e2e | `e2e/site/data-table-column-reorder.spec.ts` (existing, must stay green) |
| `DAT-024.S10` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must stay green) |
| `DAT-024.S11` | e2e | `e2e/site/data-table-column-filters.spec.ts` (existing, must stay green) |
| `DAT-024.S12` | e2e | `e2e/site/data-table-slots-skeleton.spec.ts` (existing, must stay green) |
| `DAT-024.S13` | e2e | `e2e/site/data-table-cell-context.spec.ts` (existing, must stay green) |
| `DAT-024.S14` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` (existing, must stay green) |
| `DAT-024.S15` | e2e | `e2e/site/data-table-pagination.spec.ts` (existing, must stay green) |
| `DAT-024.S16` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` (existing, must stay green) |
| `DAT-024.S17` | e2e | `e2e/site/data-table-column-templates.spec.ts` (existing, must stay green) |
| `DAT-024.S18` | e2e | `e2e/site/data-table-state.spec.ts` |

DAT-010.S1–S3 and DAT-024.S1–S17 are characterization only and are expected green from the start (L-003). S8 enables `resizableColumns`, `reorderableColumns`, `sortMode="multiple"`, `filterable`, a paginator and expandable row groups together, so a guard that only works with one feature on is caught (L-006).

## Architecture

- **`data-table-state.ts` (new):** `parseStoredTableState(raw: unknown, ctx)` returns a `Partial` of the restorable fields, where `ctx` holds the declared fields, each column's `filterType` and `rowsPerPageOptions`. One parser per key, per the contract table. `parseStoredColumnFilters` moves here unchanged. Pure, so S3–S5 are tested without TestBed.
- **Restore (`restoreTableState`):** `JSON.parse` stays inside the existing `try`; a non-object result restores nothing (S9). Each key in the parsed result is applied with `set` on its signal or model: `first`, `sortField`/`sortOrder`, `expandedRowKeys`, `columnFilters`, `columnOrder`, `resizedColumnWidths` (record → `Map`), `expandedRowGroups`, `multiSortMeta`, `pageSize`, and the global filter (D-04). Visibility goes through the column (D-02). Because restore runs before `restoredKey` is set, the persist effect does not write back the defaults, as today.
- **Persist effect:** also reads `columnOrder()`, `resizedColumnWidths()`, every column's effective visibility, `expandedRowGroups()`, `globalFilterValue()`, `multiSortMeta()` and `pageSize()`, and writes the full contract object.
- **No user events on restore (S8):** `colReorder`, `colResize`, `sort`, `filter`, `pageChange` and the row group outputs are emitted only from the user gesture handlers, and restore writes signals directly, so nothing new is needed beyond the test. Models (`multiSortMeta`, `globalFilterValue`, `expandedRowGroups`, `first`, `sortField`, `sortOrder`) emit their `…Change` as they do for `columnFilters` today.

## Decisions

### D-01: Restore through per-key parsers in a pure module

**Choice:** `data-table-state.ts` with one parser per stored key, returning only the keys that passed, and the component applying whatever came back.
**Alternatives:** Extend the inline `if` chain in `restoreTableState`; validate with a schema library.
**Rationale:** DAT-056 requires each key to restore on its own and every column-bound key to be checked against declared columns; per-key parsers make that the default shape and are unit-testable for S3–S5. A schema library is a new dependency the proposal rules out. It follows the pure-module choice of the column filter change (D-04 of `add-data-table-column-filters`).

### D-02: Keep `visible` as an input and add `visibleChange` with an overridable effective value

**Choice:** `TableColumnComponent` keeps `visible = input(true, { transform: booleanAttribute })`, adds `visibleChange = output<boolean>()` and `isVisible = linkedSignal(() => this.visible())`. The table reads `isVisible()` everywhere it reads `visible()` today, and on restore calls a column method that sets `isVisible` and emits `visibleChange` only when the value differs. A later write of the `visible` input resets `isVisible` through the `linkedSignal` (DAT-056.S6).
**Alternatives:** Turn `visible` into `model(true)`; keep a table-side override map.
**Rationale:** `model()` takes no transform, so `visible="false"` and the bare attribute would stop type-checking and coercing, a break for existing consumers. A table-side map would not reach the application and would conflict with later input writes. An input plus a `…Change` output is what Angular's `[(visible)]` desugars to, so both one-way and two-way bindings work.

### D-03: Persist visibility for every column and skip `sortOrder` with an unknown `sortField`

**Choice:** `columnVisibility` records `true` or `false` for each declared column; a stored `sortField` that is neither `null` nor a declared field is skipped together with its `sortOrder`.
**Alternatives:** Store only hidden fields; restore `sortOrder` alone.
**Rationale:** A hidden-only list cannot remember that the user showed a column declared hidden (DAT-056.S7). A `sortOrder` without its field would pair the stored direction with the application's initial `sortField`, a sort the user never chose.

### D-04: The restored global filter bypasses the debounce

**Choice:** Restore sets `globalFilterValue` and `filterInputText` in the same step and clears any pending debounce handle.
**Alternatives:** Feed the text through `onFilterInput`, which waits `filterDelay`.
**Rationale:** DAT-056 asks for the rows to be filtered at once; going through the debounce would show the unfiltered rows first and emit `filter` from a non-user path, which S8 forbids.

### D-05: Page size is the `pageSize` signal, validated against `rowsPerPageOptions`

**Choice:** Persist `pageSize()` as `rows` and restore it into `pageSize` only when the parser accepts it (contract).
**Alternatives:** Persist the `rows` input; ignore `rowsPerPageOptions`.
**Rationale:** `pageSize` is what the paginator select writes (DAT-049), while `rows` is the application's declared default. A size not offered by the select would show a page size the user cannot pick again (DAT-056.S5). A later change of the `rows` input still resets `pageSize` through its existing `linkedSignal`.

### D-06: Stored state is treated as untrusted input

**Choice:** Accepts M-01, M-02 and M-06. Every stored key, the five existing ones included, gets an allowlist parser in `data-table-state.ts` per the contract, each in its own guard: `first` becomes a non-negative safe integer, `sortOrder` one of `asc`, `desc` or `null`, `expandedRowKeys` a non-array object. Records are read only for declared fields with `Object.hasOwn`; restored data is built as a `Map` (widths) or an `Object.create(null)` record (`expandedRowKeys` from its `true` entries, visibility, filters), and no parsed object is assigned or spread into table state. Restored strings reach the DOM only through the existing property binding of the search box; the restore path adds no `innerHTML` or `bypassSecurityTrust*`. Jest cases feed each key `null`, an array, a number, a string and a nested object, and store `__proto__`, `constructor` and `toString` keys to assert none is restored.
**Alternatives:** Trust storage written by the same library; keep the existing looser checks for the five old keys.
**Rationale:** Any same-origin script or an older library version can write the key, so the shape is not guaranteed (TM-01, TM-02, TM-06). Today a row keyed `constructor` reads as expanded because `expandedRowKeys` is the parsed object itself. Tightening `first` and `sortOrder` only rejects values the table could never have written, so DAT-010.S2 and S3 are unaffected.

### D-07: Docs extend the existing persisted state example and add a `minor` changeset

**Choice:** Extend `projects/site/src/app/pages/docs/components/demos/data-table-stateful.demo.ts` with column reorder, resize, a column toggle bound with `[(visible)]`, the global filter and `rowsPerPageOptions`; update `statefulContent` and `statefulCode` in `data-table.page.ts` to list every persisted field; add `.changeset/data-table-extended-state.md` as `minor`; add `e2e/site/data-table-state.spec.ts`.
**Alternatives:** A new docs section; a `patch` changeset.
**Rationale:** DAT-024 already lists "persisted state" as one section, and S18 inspects that section. `visibleChange` is new public API, so `minor`; Article X bars `major`.

### D-08: Upper bounds on restored values

**Choice:** Accepts M-03. A width is restored only up to 10000 pixels; `collapsedRowGroups` is de-duplicated through a `Set` and keeps at most its first 1000 strings; `globalFilter` is restored only when it is at most 1000 characters; `first` must be a safe integer. The limits are module constants in `data-table-state.ts`, tested at the bound and one past it.
**Alternatives:** No bounds; limits as inputs.
**Rationale:** Well-typed but huge values would lay out an unusable table or slow every filter pass (TM-03). The limits sit far above anything the table writes for a real user, and DAT-056's "only when" conditions are necessary, not sufficient, so extra bounds stay inside the approved behavior. Inputs would add public API the proposal does not cover.

### D-09: Privacy and visibility limits are documented

**Choice:** Accepts M-04 and M-05. `stateStorage` keeps `session` as its default. The TSDoc of `stateKey` and `stateStorage` and the persisted state prose (DAT-024.S18) list every stored field, say that `local` keeps search text, filter values and group values with no expiry, and advise including the signed-in user's identity in `stateKey` and removing the key on sign-out. The TSDoc of `visible` and the column toggle prose state that `visible`, restored or not, is presentation only, not access control.
**Alternatives:** Encrypt or expire stored state; never restore a visibility of `true` over a declared `false`.
**Rationale:** The table cannot know who the user is, so clearing state on sign-out belongs to the application (TM-04). Restoring `true` over a declared `false` is required by DAT-056.S7, so the remaining exposure in TM-05 is accepted as residual risk and handled by keeping restricted columns out of the template and out of `value`.
