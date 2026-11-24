# Security Report: persist-data-table-extended-state — round 1

**Stage:** security
**Verdict:** pass-with-findings
**Counts:** critical 0 · high 0 · medium 1 · low 2 · info 0
**Origin mix:** tool 0 · verified 0 · manual 3 · hypothesis 0
**Reviewer:** security agent
**Date:** 2026-11-23

## Summary

`pass-with-findings`: no critical or high findings were identified, and three resource-bound gaps remain open (`S-01` medium, `S-02` and `S-03` low). The most severe open finding (`S-01`) allows an untrusted `rows` value in Web Storage to trigger an uncaught `RangeError: Invalid array length` or large DOM allocation in `skeletonRows` when `rowsPerPageOptions` is unset. Five of six threat-model mitigations (`M-01`, `M-02`, `M-04`, `M-05`, `M-06`) are implemented as specified, while `M-03` is partial; the primary audit limitation is that `semgrep`, `trivy`, and `gitleaks` are unavailable here and no dynamic exploit run was executed in Jest or Playwright for the new findings.

## Scope and Method

- **Examined:** diff base `8661bd0`; 11 files changed or added outside `docs/changes/` (6 modified tracked files and 5 new files including `data-table-state.ts`, 3 test files, and 1 changeset), 3 entry points (`restoreTableState`, `TableColumnComponent.applyRestoredVisibility`, and `persistTableState`), and 0 dependency manifest or lockfile changes.
- **Method:** manual code and template audit · configuration and documentation review (`stateStorage`, TSDoc, site docs) · dependency audit check · threat-model conformance against `docs/changes/persist-data-table-extended-state/threat-model.md`.
- **Tools:** `npm audit --omit=dev --audit-level=low` (`npm` `11.19.1`, exit `1` — 8 pre-existing root/site workspace vulnerabilities: 1 low, 7 high in `@grpc/grpc-js`, `@firebase/firestore`, `@firebase/firestore-compat`, `esbuild`, `re2js`, `source-map-js`, and `vite`; none are dependencies of `@medra.dev/ui` and none were altered by this change); `node -e` (`v24.22.2`, exit `0`, reproducing `RangeError: Invalid array length` on `Array.from({ length: Number.MAX_SAFE_INTEGER })`).

## Findings

### S-01 [medium] Unbounded persisted `rows` causes `RangeError` or large DOM allocation in `skeletonRows` when `rowsPerPageOptions` is unset

**Status:** open
**Confidence:** confirmed · **Origin:** manual
**CWE:** CWE-1284 · **CVE:** n/a · **CVSS:** n/a
**Location:** `projects/medra/ui/src/lib/data-table/data-table-state.ts:237-250` (`projects/medra/ui/src/lib/data-table/data-table.component.ts:947`) · M-03, TM-01, TM-03, DAT-056
**Evidence:** `parseRows` (`data-table-state.ts:243-248`) accepts any positive safe integer up to `Number.MAX_SAFE_INTEGER` when `rowsPerPageOptions` is unset or empty (`if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) return undefined;`), and `skeletonRows` (`data-table.component.ts:947`) executes `Array.from({ length: this.paginator() ? Math.max(1, this.pageSize()) : 5 }, (_, i) => i)`. Evaluating `Array.from({ length: Number.MAX_SAFE_INTEGER }, (_, i) => i)` in Node (`v24.22.2`) raises `RangeError: Invalid array length`.
**Attack scenario:** A same-origin script, browser extension, or prior user of a shared browser profile writes `{"rows": 9007199254740991}` (or `10000000`) under `stateKey` for a table configured with `[paginator]="true"`, `loadingMode="skeleton"`, `[loading]="true"`, and no `rowsPerPageOptions`. On init, `restoreTableState` sets `pageSize` to that value and `skeletonRows` throws `RangeError` (or attempts to allocate millions of `<med-skeleton>` rows).
**Impact:** Client-side denial of service on every page load until the `stateKey` entry is cleared from Web Storage.
**Fix:** Enforce a module-level upper bound constant (such as `MAX_PAGE_SIZE`) in `parseRows` when `rowsPerPageOptions` is unset or empty, and clamp `skeletonRows` in `data-table.component.ts` to a safe maximum display count.
**Validation:** Add unit tests in `data-table-state.spec.ts` verifying `rows` at the cap is accepted and one past the cap is dropped when `rowsPerPageOptions` is `null`, plus an integration test in `data-table-persisted-state.spec.ts` with `paginator`, `loadingMode="skeleton"`, `loading="true"`, and stored `rows: Number.MAX_SAFE_INTEGER` asserting no exception is thrown.
**References:** https://cwe.mitre.org/data/definitions/1284.html, https://cwe.mitre.org/data/definitions/770.html, https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
**Residual risk:** Tables whose application explicitly supplies an arbitrarily large `[rows]` input or huge `rowsPerPageOptions` entry still depend on the `skeletonRows` clamp to avoid excess DOM allocation.

### S-02 [low] `isGroupCollapsed` scans `expandedRowGroups` linearly with `.includes()` instead of checking through a `Set`

**Status:** open
**Confidence:** confirmed · **Origin:** manual
**CWE:** CWE-407 · **CVE:** n/a · **CVSS:** n/a
**Location:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1932-1934` · M-03, TM-03
**Evidence:** While `parseCollapsedRowGroups` (`data-table-state.ts:197-206`) deduplicates up to `MAX_COLLAPSED_ROW_GROUPS` (`1000`) items using a `Set`, it returns an array (`Array.from(seen)`), and `isGroupCollapsed` (`data-table.component.ts:1933`) still performs `this.expandedRowGroups().includes(this.groupValue(row))` (called multiple times per body row in the template at lines `442`, `443`, `447`, and `458`). Mitigation `M-03` (`accepted (D-08)`) specifies: "Restored group keys are checked through a `Set`."
**Attack scenario:** A same-origin writer or prior shared-profile user stores `1000` distinct strings in `collapsedRowGroups` under `stateKey`. On a grouped table displaying many rows (for example without pagination), each render executes `O(rows * 1000)` linear string scans.
**Impact:** Degraded rendering performance and partial non-conformance with `M-03`, bounded by `MAX_COLLAPSED_ROW_GROUPS = 1000`.
**Fix:** Add a `computed(() => new Set(this.expandedRowGroups()))` signal in `DataTableComponent` and check `.has(this.groupValue(row))` inside `isGroupCollapsed` (and `toggleRowGroup`).
**Validation:** Inspect `isGroupCollapsed` to confirm `Set.has` membership lookup and re-run the `data-table` Jest suite.
**References:** https://cwe.mitre.org/data/definitions/407.html, https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
**Residual risk:** `parseCollapsedRowGroups` still iterates a large stored array until `1000` unique strings are collected on init, bounded by Web Storage quota.

### S-03 [low] `parseStoredColumnFilters` applies no length limit to restored text filter values

**Status:** open
**Confidence:** confirmed · **Origin:** manual
**CWE:** CWE-1284 · **CVE:** n/a · **CVSS:** n/a
**Location:** `projects/medra/ui/src/lib/data-table/data-table-state.ts:128-129` (`projects/medra/ui/src/lib/data-table/data-table-column-filter.ts:58-60`) · M-03, TM-03
**Evidence:** `parseGlobalFilter` (`data-table-state.ts:212`) caps restored search text at `MAX_GLOBAL_FILTER_LENGTH` (`1000`), whereas `parseStoredColumnFilters` (`data-table-state.ts:128-129`) restores any string (`if (col.filterType === 'text' && typeof value === 'string') { rules[col.field] = { matchMode: matchMode as TableFilterMatchMode, value }; }`), and `matchesText` (`data-table-column-filter.ts:60`) executes `const needle = String(rule.value).toLowerCase();` for every row evaluated by `filteredValue()`.
**Attack scenario:** A same-origin script or prior shared-profile user stores a multi-megabyte string in `columnFilters.<field>.value` for a text column. On every load and filter pass over a large table, `matchesText` allocates a lowercased copy of that string once per row.
**Impact:** Excessive memory churn and UI stalls on large datasets until the stored state is cleared.
**Fix:** Enforce a length upper bound (such as `MAX_GLOBAL_FILTER_LENGTH` or a dedicated constant) on text filter `value` strings in `parseStoredColumnFilters`.
**Validation:** Add unit tests in `data-table-state.spec.ts` verifying text filter values at the cap are restored and values one character past the cap are dropped.
**References:** https://cwe.mitre.org/data/definitions/1284.html, https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
**Residual risk:** Legitimate column filter strings exceeding the chosen limit are dropped on restore.

## Previous Findings

None.

## Threat Model Conformance

| Mitigation | Status | Evidence |
|---|---|---|
| M-01 | implemented | `projects/medra/ui/src/lib/data-table/data-table-state.ts:60-312` (per-key allowlist parsers for all 12 keys); `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts:142-205` |
| M-02 | implemented | `projects/medra/ui/src/lib/data-table/data-table-state.ts:52-54,93-98,111-118,164-171,182-189,260`; `projects/medra/ui/src/lib/data-table/data-table.component.ts:1590,3097`; `projects/medra/ui/src/lib/data-table/data-table-state.spec.ts:207-264` |
| M-03 | partial | `projects/medra/ui/src/lib/data-table/data-table-state.ts:12-16,63,168,201,212` and `data-table-state.spec.ts:266-306` bound widths, `collapsedRowGroups`, `globalFilter`, and `first`, but `data-table.component.ts:1933` uses `.includes()` instead of a `Set` (`S-02`), `parseRows` + `skeletonRows` lack an upper bound (`S-01`), and `parseStoredColumnFilters` has no text length bound (`S-03`) |
| M-04 | implemented | `projects/medra/ui/src/lib/data-table/data-table.component.ts:1017-1032` (`'session'` default and TSDoc guidance); `projects/site/src/content/docs/data-table-stateful.txt:3-5` |
| M-05 | implemented | `projects/medra/ui/src/lib/data-table/table-column.component.ts:86-88`; `projects/site/src/content/docs/data-table-column-toggle.txt:5`; `projects/site/src/content/docs/data-table-stateful.txt:5` |
| M-06 | implemented | `projects/medra/ui/src/lib/data-table/data-table.component.ts:373` (`[value]="filterInputText()"`); zero `innerHTML` or `bypassSecurityTrust*` matches across `projects/medra/ui/src/lib/data-table/` non-test files and `data-table-stateful.demo.*` |

## Limitations

- `semgrep`, `trivy`, and `gitleaks` are not installed in this environment, so automated SAST and dedicated secret scanning did not run (`npm audit` `11.19.1` ran instead).
- `WebFetch` is unavailable in this environment; OWASP, MITRE CWE, and Angular documentation guidance was consulted via `search_web` summaries.
- Pre-existing vulnerabilities flagged by `npm audit --omit=dev` in unchanged root/site workspace packages (`@grpc/grpc-js`, `@firebase/firestore`, `@firebase/firestore-compat`, `esbuild`, `re2js`, `source-map-js`, `vite`) were not cross-checked against NVD or CISA KEV because this change modifies no dependency manifests or lockfiles and `@medra.dev/ui` does not depend on those packages.
- No dynamic exploit test was executed in Jest or Playwright for `S-01`–`S-03`; `S-01`'s `RangeError` was reproduced in Node (`v24.22.2`) and verified by code inspection against `parseRows` and `skeletonRows`.
