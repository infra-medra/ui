# Security Report: persist-data-table-extended-state — round 2

**Stage:** security
**Verdict:** pass
**Counts:** critical 0 · high 0 · medium 0 · low 0 · info 0
**Origin mix:** tool 0 · verified 0 · manual 0 · hypothesis 0
**Reviewer:** security agent
**Date:** 2026-11-23

## Summary

`pass`: all three findings from round 1 (`S-01`, `S-02`, and `S-03`) are remediated in the current implementation and tests, and zero open findings or new security regressions were identified across the incremental diff. All six accepted threat-model mitigations (`M-01` through `M-06`) now conform to `threat-model.md`, updating `M-03` from `partial` to `implemented`. The main audit limitations are that `semgrep`, `trivy`, and `gitleaks` are unavailable in this environment, `WebFetch` is unavailable (so CWE and OWASP guidance was verified through `search_web` summaries), and round 2 verification relied on the `data-table` Jest suite rather than a fresh Playwright e2e run.

## Scope and Method

- **Examined:** incremental round 2 over diff base `8661bd0`; 4 files in `changed_since_previous` (`data-table-state.ts`, `data-table.component.ts`, `data-table-state.spec.ts`, `data-table-persisted-state.spec.ts`), round 1 finding context (`data-table-column-filter.ts:58-60` and `paginator.component.ts` as downstream `pageSize` consumer), and 0 dependency manifest or lockfile changes (`projects/medra/ui/package.json` adds no dependencies); unchanged `M-04`, `M-05`, and `M-06` surfaces were carried from round 1 with spot verification of `data-table.component.ts` and `table-column.component.ts`.
- **Method:** incremental code and template audit · remediation and regression verification · dependency audit check (`npm audit`) · threat-model conformance verification against `docs/changes/persist-data-table-extended-state/threat-model.md`.
- **Tools:** `npx jest projects/medra/ui/src/lib/data-table` (`Jest` `30.5.0`, exit `0` — 7 suites, 351 tests passed); `npm audit --omit=dev --audit-level=low` (`npm` `11.19.1`, exit `1` — 8 pre-existing root/site workspace vulnerabilities: 1 low, 7 high in `@grpc/grpc-js`, `@firebase/firestore`, `@firebase/firestore-compat`, `firebase`, `esbuild`, `re2js`, `source-map-js`, and `vite`; none are dependencies of `@medra.dev/ui` and none were altered by this change).

## Findings

None.

## Previous Findings

| ID | Previous status | Status | Evidence |
|---|---|---|---|
| S-01 | open | remediated | `projects/medra/ui/src/lib/data-table/data-table-state.ts:20,241-258` enforces `MAX_PAGE_SIZE = 1000` in `parseRows` when `rowsPerPageOptions` is unset or empty; `projects/medra/ui/src/lib/data-table/data-table.component.ts:947-949` clamps `skeletonRows` to `Math.min(100, this.paginator() ? Math.max(1, this.pageSize()) : 5)`; `data-table-state.spec.ts:309-312` tests `MAX_PAGE_SIZE` acceptance and `MAX_PAGE_SIZE + 1` rejection, and `data-table-persisted-state.spec.ts:534-568` verifies `{ rows: Number.MAX_SAFE_INTEGER }` under `paginator`, `loadingMode="skeleton"`, and `loading="true"` throws no error and renders 5 rows (`npx jest projects/medra/ui/src/lib/data-table`, exit `0`). |
| S-02 | open | remediated | `projects/medra/ui/src/lib/data-table/data-table.component.ts:963` derives `collapsedRowGroupSet = computed(() => new Set(this.expandedRowGroups()))`, and both `isGroupCollapsed` (`data-table.component.ts:1935-1937`) and `toggleRowGroup` (`data-table.component.ts:1948`) use `this.collapsedRowGroupSet().has(...)` instead of linear `.includes()` scans (`npx jest projects/medra/ui/src/lib/data-table`, exit `0`). |
| S-03 | open | remediated | `projects/medra/ui/src/lib/data-table/data-table-state.ts:18,132` defines `MAX_COLUMN_FILTER_LENGTH = 1000` and enforces `value.length <= MAX_COLUMN_FILTER_LENGTH` for restored `text` filters in `parseStoredColumnFilters`; `data-table-state.spec.ts:314-328` verifies acceptance at `1000` characters and rejection at `1001` characters (`npx jest projects/medra/ui/src/lib/data-table`, exit `0`). |

## Threat Model Conformance

| Mitigation | Status | Evidence |
|---|---|---|
| M-01 | implemented | `projects/medra/ui/src/lib/data-table/data-table-state.ts:64-320` (per-key allowlist parsers for all 12 keys); `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts:144-207` |
| M-02 | implemented | `projects/medra/ui/src/lib/data-table/data-table-state.ts:22,52-58,97-102,115-142,165-177,183-195,268`; `projects/medra/ui/src/lib/data-table/data-table.component.ts:1593-1596,3100`; `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts:209-266` |
| M-03 | implemented | `projects/medra/ui/src/lib/data-table/data-table-state.ts:12-20,67,132,172,201-209,216,247-256`; `projects/medra/ui/src/lib/data-table/data-table.component.ts:947-949,963,1935-1937,1948`; `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts:268-329`; `projects/medra/ui/src/lib/data-table/data-table-persisted-state.spec.ts:534-568` |
| M-04 | implemented | Carried from r1 (`projects/medra/ui/src/lib/data-table/data-table.component.ts:1020-1035`, `'session'` default and TSDoc guidance; `projects/site/src/content/docs/data-table-stateful.txt:3-5` unchanged) |
| M-05 | implemented | Carried from r1 (`projects/medra/ui/src/lib/data-table/table-column.component.ts:86-93`; `projects/site/src/content/docs/data-table-column-toggle.txt:5` and `projects/site/src/content/docs/data-table-stateful.txt:5` unchanged) |
| M-06 | implemented | Carried from r1 (`projects/medra/ui/src/lib/data-table/data-table.component.ts:373` `[value]="filterInputText()"`; zero `innerHTML` or `bypassSecurityTrust*` matches across `data-table-state.ts`, `data-table.component.ts`, and `table-column.component.ts`) |

## Limitations

- `semgrep`, `trivy`, and `gitleaks` are not installed in this environment, so automated SAST and dedicated secret scanning did not run (`npm audit` `11.19.1` ran instead).
- `WebFetch` is unavailable in this environment; CWE-1284, CWE-407, and OWASP Input Validation Cheat Sheet guidance were consulted via `search_web` summaries.
- `medra step persist-data-table-extended-state --role security --stage verify --md` returned exit `1` (`Role "security" is not active in stage "verify"`, as `medra step --stage verify` resolves to `action: "gate"`); round 2 was scoped via `medra handoff persist-data-table-extended-state audit --fixed S-01,S-02,S-03`, `medra context persist-data-table-extended-state --stage verify --md`, and the invoking dispatch.
- Pre-existing vulnerabilities flagged by `npm audit --omit=dev --audit-level=low` in unchanged root/site workspace packages (`@grpc/grpc-js`, `@firebase/firestore`, `@firebase/firestore-compat`, `firebase`, `esbuild`, `re2js`, `source-map-js`, and `vite`) were not cross-checked against NVD or CISA KEV because this change modifies no dependency manifests or lockfiles and `@medra.dev/ui` does not depend on those packages.
- Unchanged files outside `changed_since_previous` (site docs/demos and `e2e/site/data-table-state.spec.ts`) were carried from round 1 rather than re-audited in full, and no fresh Playwright e2e pass was executed in this round.
