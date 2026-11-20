# Plan: document-existing-data-table-features

## Summary

The DataTable docs page (`projects/site/src/app/pages/docs/components/data-table.page.ts`) is rebuilt on the AutoComplete page's structure: a typed `EXAMPLES` constant feeds `<app-component-doc [examples]>`, and each of the 20 examples is an `example-<slug>` block with a prose file, a live demo and a code block (DAT-024). Six demos already exist; the combined multi-sort-and-edit demo is split in two and 14 demos are new, all using only API the component implements today. No library code changes. A Playwright spec in `e2e/site/` checks the index against the sections (S1), the completeness of each block (S2) and the preservation of the previously documented features (S3).

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | Every new demo is a standalone component with `signal()` state, like `data-table-basic.demo.ts`; no library class changes. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Demo markup uses the same token-based Tailwind classes (`text-surface-500 dark:text-surface-400`) as the existing demos; no new component styling. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay or icon is added; demos use the library components as they are. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | No input component is added or changed; the table is not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps S1 to S3 to a Playwright spec in a real browser; tasks will order the spec before the page and demos. The unit runner (Jest) has no page-level scenario. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | The component's roles and keyboard handling are unchanged. Each demo sets `ariaLabel` on its table; the `selection-single` demo shows Enter/Space selection and S2 checks every demo renders a table. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Prose and demo data are written fresh (no PrimeNG text or code), in English per `CLAUDE.md`. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No internal UI string is added to the library. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | No file under `projects/medra/ui/` changes, so no changeset is needed (REL-004) and the version is untouched. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx playwright test --project=site e2e/site/data-table-docs.spec.ts`
- **Framework:** Playwright (the `site` project builds the docs site and serves it on port 3000), the same runner as `e2e/site/autocomplete-docs.spec.ts`. `npm test` (Jest) must still pass; `npm run build:site` must pass.

| Scenario | Level | Test location |
|---|---|---|
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` |

S1 reads the "On this page" entries from the DOM and compares their ids and order with the `[id^="example-"]` sections. S2 loops over those entries and asserts prose, a `app-data-table-<slug>-demo` element and a code block in each. S3 asserts the six pre-existing feature demos are present and that a multi-sort, a cell-edit and a CSV-export interaction still work.

## Page structure

The page lists the examples below, in this order; the id is `example-<slug>` and the demo selector is `app-data-table-<slug>-demo`.

| # | Slug | Demonstrates | Source |
|---|---|---|---|
| 1 | `basic` | columns, sort, filter, paginator, template | existing |
| 2 | `selection-single` | `selectionMode="single"`, `dataKey`, Enter/Space | new |
| 3 | `selection-multiple` | `selectionMode="multiple"`, select all | new |
| 4 | `sort-single` | `sortField`/`sortOrder`, `sort` event | new |
| 5 | `sort-multiple` | `sortMode="multiple"`, `multiSortMeta` | split from `multi-sort-edit` |
| 6 | `filter-global` | `filterable`, `globalFilterFields`, `filterDelay` | new |
| 7 | `pagination` | `paginator`, `rows`, `rowsPerPageOptions`, `first` | new |
| 8 | `scroll-vertical` | `scrollable`, `scrollHeight` | new |
| 9 | `row-expansion` | `#rowexpansion`, `expandedRowKeys`, `toggleRowExpansion` | new |
| 10 | `row-group-subheader` | `rowGroupMode`, `groupRowsBy`, `#groupHeader` | renamed from `grouped-rows` |
| 11 | `column-resize` | `resizableColumns`, `colResize` | new |
| 12 | `edit-cell` | `editMode="cell"`, `#editTemplate` | split from `multi-sort-edit` |
| 13 | `loading` | `loading` | new |
| 14 | `lazy` | `lazy`, `totalRecords`, `lazyLoad` | existing, narrowed to lazy |
| 15 | `empty-state` | `emptyLabel` | new |
| 16 | `templates` | column `ng-template` cells | new |
| 17 | `conditional-style` | `rowClass` | new |
| 18 | `stateful` | `stateKey`, `stateStorage` | new |
| 19 | `export-csv` | `exportCSV()`, `selectionOnly` | renamed from `export` |
| 20 | `row-reorder-events` | `reorderable`, `rowReorder`, `rowSelect`, `rowUnselect` | existing |

Each new example adds `content/docs/data-table-<slug>.txt` (starting with `## Title`), `demos/data-table-<slug>.demo.ts` and `.demo.html` (imported with `?raw` for the code block). Demos use the equipment-inventory sample data of the basic demo where it fits, so the page reads as one story.

## Decisions

### D-01: Rename demo files to match section ids

**Choice:** Demo files and selectors take the example slug (`grouped-rows` becomes `row-group-subheader`, `export` becomes `export-csv`); the six old prose files follow the same names.
**Alternatives:** Keep the old file names and map slugs to them in the test.
**Rationale:** One naming rule (`example-<slug>` section, `app-data-table-<slug>-demo` selector) lets the e2e spec derive every selector from the index. The old sections have no anchor ids, so nothing external links to them, which satisfies the anchor-preservation rule.

### D-02: Split the combined sort-and-edit demo

**Choice:** `data-table-multi-sort-edit` becomes `sort-multiple` and `edit-cell`, each with its own prose and code block.
**Alternatives:** Keep one combined example.
**Rationale:** PrimeNG lists them as separate topics and the index must name one feature per entry; the combined demo hid the edit feature behind a sort title.

### D-03: Verify the page with a Playwright site spec, not Jest

**Choice:** `e2e/site/data-table-docs.spec.ts`, derived from the AutoComplete docs spec.
**Alternatives:** A Jest test that renders the page component.
**Rationale:** S1 (index and order) and S3 (working demos) depend on the rendered site and the scroll-spy index, which a jsdom render does not reproduce; Article V requires real-browser verification of layout-dependent scenarios.

### D-04: Document only implemented features; leave one-line pointers to later changes out of the page

**Choice:** The page describes no feature the component lacks, and mentions no future work.
**Alternatives:** Add placeholders for features coming in changes 2 to 7.
**Rationale:** DAT-024 forbids demos of unsupported API, and placeholders would be stale text to remove later. Later changes add their own sections and extend the `EXAMPLES` list.

### D-05: Register the e2e and spec paths in `testing.paths`

**Choice:** `docs/config-flow.yaml` adds `e2e/**` and `**/*.spec.*` to `testing.paths`, so `medra coverage` finds the Playwright spec that cites DAT-024.S1 to S3.
**Alternatives:** Move the spec under `test/**`; leave the scenarios reported as uncovered.
**Rationale:** The repository keeps every test in `e2e/` or in `*.spec.ts` files, and the previous patterns (`test/**`, `*.test.*`) matched none of them. The addition applies project-wide: coverage for older capabilities may now count their existing specs. It was approved by the user during verify.
