# Review: add-data-table-pagination-options — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

The implementation matches DAT-049 and the DAT-024 delta. The `paginatorTpl` template renders at one or two places and forwards every option, `pageChange` re-emits the paginator's own user-only event, and the documentation page adds a complete `paginator-options` section. All tasks carry red/green evidence, no existing test was weakened, and the suite is green. The most important finding is that the DAT-049 unit host binds every input to its default value, so the tests for DAT-049.S3, S7 and S9 never exercise the table's own defaults, even though those scenarios assert defaults.

## Findings

### F-01 [major] DAT-049 unit host overrides the defaults that S3, S7 and S9 assert

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:5058-5101` (host template and signals), `:5148`, `:5196`, `:5221` · DAT-049.S3, DAT-049.S7, DAT-049.S9
**Problem:** `PaginatorOptionsHostComponent` always binds `[paginatorPosition]`, `[paginatorAriaLabel]`, `[paginatorTopAriaLabel]`, `[paginatorBottomAriaLabel]` and `[alwaysShowPaginator]`, with host signals set to `'bottom'`, `'Pagination'`, `'Pagination, top'`, `'Pagination, bottom'` and `true`. S9's Given is "no `paginatorPosition`", and the S9 test even sets `h.position.set('bottom')` explicitly. S7's second clause is "with `alwaysShowPaginator` left at its default", and S3 asserts the default names. In every case the test passes the expected value in from the host, so it would still pass if the table's `input('Pagination')`, `input('Pagination, top')`, `input('Pagination, bottom')`, `input(true)` or `input('bottom')` defaults changed. The defaults are correct by inspection (`data-table.component.ts:807`, `:822`, `:824-828`), but no test protects them. This is the gap L-002 warns about: a Given clause that the test does not assert.
**Fix:** Add a second, minimal host (or tests with a bare `<med-data-table [value] [paginator]="true">`) that binds only what each scenario's Given sets. Use it for S9 (no position and no label bindings: one paginator after the summary, named "Pagination"), S7's default clause (no `alwaysShowPaginator` binding) and S3's default names (only `paginatorPosition="both"`). Keep the current host for the override cases.

### F-02 [minor] `paginatorAriaLabel` TSDoc does not say it is ignored with `both`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:823-824` · DAT-049, plan D-03 and Risks
**Problem:** The plan's Risks section says a host that binds `paginatorAriaLabel` together with `paginatorPosition="both"` gets the top and bottom names instead, "the TSDoc says so". The TSDoc reads only "Accessible name of a single paginator's navigation landmark.", so it does not tell consumers that the value is dropped under `both`.
**Fix:** Extend the TSDoc, for example: "Accessible name of the paginator's navigation landmark when one paginator renders. Ignored with `paginatorPosition="both"`; use `paginatorTopAriaLabel` and `paginatorBottomAriaLabel` instead."

### F-03 [minor] `pageChange` in lazy mode has no test

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:5207` · DAT-049
**Problem:** The requirement says the table SHALL emit `pageChange` "in lazy mode as well as without it". The only `pageChange` test (S8) runs without `lazy`. The implementation forwards the paginator's event the same way in both modes (D-04), so the behavior holds by construction, but nothing guards against a later lazy-specific branch suppressing it.
**Fix:** Add a case with `[lazy]="true"` and `totalRecords` set. Click page 2 and assert that `pageChange` emits `{ first: 10, rows: 10, page: 1, pageCount: 3 }` alongside `lazyLoad`.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-049` | Unit tests `data-table.component.spec.ts:5123` (S1), `:5135` (S2), `:5148`/`:5156` (S3), `:5165` (S4), `:5174` (S5), `:5181` (S6), `:5196` (S7), `:5207` (S8), `:5221` (S9); e2e `e2e/site/data-table-pagination.spec.ts:43` (S1 in a real browser). Implementation `data-table.component.ts` `showPaginator`, `paginatorLabelFor`, `paginatorTpl`, inputs at `:803-828`, output at `:952`. T001 red, T003 green; T008 full unit and data-table e2e run green. Defaults verified by inspection only (F-01) | met |
| `DAT-024` | e2e `e2e/site/data-table-docs.spec.ts:164` (S15 section, prose, demo, code block) and `e2e/site/data-table-pagination.spec.ts` (S15 paginators above and below, custom report); S1–S14 are existing specs re-run in T008 (24/24 covered per `medra coverage`). Section `example-paginator-options` registered after `example-programmatic-pagination` in `data-table.page.ts`; the demo uses only implemented inputs and outputs. T004 red, T006 green | met |
