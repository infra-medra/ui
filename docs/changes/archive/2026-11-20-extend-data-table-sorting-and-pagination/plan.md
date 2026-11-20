# Plan: extend-data-table-sorting-and-pagination

## Summary

`DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) gains one input, `removableSort` (DAT-002), which `toggleSort` reads in single sort mode to decide whether a sorted column goes back to unsorted on the third click. Presort (DAT-002.S3) and the page controls of DAT-005 (S2 to S4) already work through the existing `model()` inputs `sortField`, `sortOrder` and `first` and the rows per page fix, so they need tests that cite their scenarios and docs examples, not component code. The docs page `projects/site/src/app/pages/docs/components/data-table.page.ts` adds three examples: `presort`, `removable-sort` and `programmatic-pagination`. The existing sort and pagination tests keep their assertions and are only retagged with the scenario IDs.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | Only `DataTableComponent` changes, and `removableSort` is an `input()` (D-01). The three docs demos are standalone components. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | n/a | No element or class is added to the component; the demos reuse the table and the existing prose styles. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay and no icon is added. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | The table is not a form control, as earlier changes recorded. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps DAT-002.S1 to S4 and DAT-005.S1 to S4 to Jest; none depends on layout or CSS. Tasks will order `[TEST]` first, and the new examples are checked by the existing docs e2e (D-04). |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Headers keep `aria-sort` and their Enter and Space keys (DAT-002.S2), and `removableSort` changes only the next order, so `aria-sort` always reports the real order (D-01). The demo buttons are native `<button>` elements. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | The code, tests and prose are written from the deltas, and all text is English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | The component adds no UI string. The demo labels are docs content, not library strings. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | New public API ships with a `minor` changeset and no peer range changes (D-05). |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` for the component, and `npx playwright test --project=site e2e/site/data-table-docs.spec.ts` for the docs page.
- **Framework:** Jest with jsdom for behavior and DOM; Playwright (the `site` project) for the rendered docs page.

| Scenario | Level | Test location |
|---|---|---|
| `DAT-002.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-002.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-002.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-002.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-005.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-005.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-005.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-005.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |

DAT-002.S1, S2 and DAT-005.S1 have tests today that do not cite their IDs; they only get a scenario comment. DAT-005.S4 has two tests from the rows per page fix (plain and lazy), and the plain one gets the comment. The test host binds `sortField`, `sortOrder`, `removableSort` and `first` two-way, which it does not yet do. The three new docs examples are covered by the existing generic checks of DAT-024.S1 and S2 in `e2e/site/data-table-docs.spec.ts`, which require each index entry to have prose, one demo named `app-data-table-<slug>-demo` and a code block.

## Sorting and paging design

- **`removableSort`.** `readonly removableSort = input(true, { transform: booleanAttribute })`. In the single-mode branch of `toggleSort`, the order after `desc` becomes `null` only when `removableSort()` is true; otherwise it goes back to `asc`. A column that is not the current sort field still starts at `asc`, so an unsorted table behaves the same with either value.
- **Multiple sort mode.** `toggleMultiSort` is untouched and ignores `removableSort`; the input's TSDoc and the docs prose say so.
- **Presort and paging.** No component change: the initial `sortField` and `sortOrder` feed `sortedValue`, and `first` is already bound two-way to the embedded paginator.
- **Docs.** `data-table.page.ts` adds the slugs `presort` after `sort-single`, `removable-sort` after `presort` and `programmatic-pagination` after `pagination`, each with `content/docs/data-table-<slug>.txt`, a demo and its `?raw` code import. `presort` binds `sortField` and `sortOrder` two-way and has buttons that change them from code, `removable-sort` shows a table with `[removableSort]="false"`, and `programmatic-pagination` has buttons that set `first`.

## Decisions

### D-01: `removableSort` is a boolean input that defaults to true

**Choice:** `removableSort` is an `input(true, { transform: booleanAttribute })` that only changes the next order after `desc` in single sort mode, so `aria-sort` and the `sort` event keep reporting the real order.
**Alternatives:** Default `false` as in PrimeNG; a `sortCycle` input listing the orders; a separate "removable" flag per column.
**Rationale:** Today's behavior is the three-state cycle (DAT-002), so a `true` default changes nothing for existing tables. A single boolean is the smallest API that satisfies the delta, and a per-column flag or cycle list would be unrequested scope.

### D-02: Presort and programmatic paging stay as they are

**Choice:** The component code for DAT-002.S3 and DAT-005.S2 and S3 is not changed; they are covered by tests and examples.
**Alternatives:** Add dedicated `presort` or `page` inputs.
**Rationale:** `sortField`, `sortOrder` and `first` are already two-way `model()` inputs that cover both cases, and a second way to set the same state would create two sources of truth.

### D-03: Existing tests are retagged, not rewritten

**Choice:** The sorting, pagination and rows per page tests that already exist get a `// DAT-00x.Sn` comment above them, and only the cases the existing tests do not cover (DAT-002.S3, S4 and DAT-005.S2, S3) are new.
**Alternatives:** Rewrite them as new tests that cite the IDs.
**Rationale:** The assertions are already right, and `medra task done` hashes test files at red, so a retag-only task keeps the evidence honest, as the DAT-006 retag did in the previous change.

### D-04: New examples ride on the existing docs checks

**Choice:** No new e2e test; the new slugs are verified by the generic DAT-024.S1 and S2 tests, which read the index and check each example.
**Alternatives:** A dedicated e2e per example.
**Rationale:** Those tests already fail when an example lacks prose, a demo or a code block, and the behavior is covered by the Jest scenarios.

### D-05: Ship a minor changeset

**Choice:** One `minor` changeset for `@medra.dev/ui` describes `removableSort`.
**Alternatives:** A `patch`; no changeset.
**Rationale:** REL-004 requires a changeset for source changes under `projects/medra/ui/`, and a new public input is a minor bump that leaves the Angular-major rule intact.
