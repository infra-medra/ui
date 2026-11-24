# Security Report: data-table-advanced-filters — round 1

**Stage:** security
**Verdict:** pass-with-findings
**Counts:** critical 0 · high 0 · medium 0 · low 1 · info 2
**Origin mix:** tool 0 · verified 0 · manual 3 · hypothesis 0
**Reviewer:** security agent
**Date:** 2026-11-24

## Summary

`pass-with-findings`: no critical, high, or medium findings were identified, and three findings remain open (`S-01` low, `S-02` and `S-03` info). The most severe open finding (`S-01`) allows `filterInOptions` in `DataTableComponent` to dereference `null` or `undefined` row slots on sparse `value` arrays in `lazy` + `virtualScroll` mode when `in` filtering is used without explicit `filterOptions`, throwing an uncaught `TypeError`. Stored-state deserialization in `parseStoredColumnFilters` enforces type, match-mode, prototype-key, rule-count, item-count, and length bounds, while consumer `#filter` templates render via Angular `ngTemplateOutlet`. The primary audit limitation is that `semgrep`, `trivy`, and `gitleaks` are unavailable here, `WebFetch` is unavailable (so authoritative references were consulted via `search_web`), and no dynamic test was written or run to reproduce `S-01`–`S-03`.

## Scope and Method

- **Examined:** diff base `8661bd0`; 10 modified tracked files outside `docs/` plus untracked workspace files from current and prior uncommitted changes (focused on the 5 implementation files and 4 test files of `data-table-advanced-filters`, `data-table-state.ts`, and 7 supporting overlay/input primitives), 4 primary entry/boundary paths (`parseStoredColumnFilters`, `restoreTableState`, `filterTemplateContext`, and `filterInOptions`/row/menu filter inputs), and 0 dependency manifest or lockfile changes (`package.json`, `package-lock.json`, and `projects/medra/ui/package.json` unchanged).
- **Method:** code and Angular template audit · persisted-state deserialization and prototype-safety audit · dependency manifest diff and workspace advisory check · threat-model conformance skipped (fast track, no threat model).
- **Tools:** `npx jest projects/medra/ui/src/lib/data-table` (`Jest` `30.5.0`, exit `0` — 10 suites, 393 tests passed); `npm audit --omit=dev --audit-level=low --json` (`npm` `11.19.1`, exit `1` — 8 pre-existing root/site workspace advisories: 1 low, 7 high in `@firebase/firestore`, `@firebase/firestore-compat`, `@grpc/grpc-js`, `esbuild`, `firebase`, `re2js`, `source-map-js`, and `vite`; none are dependencies of `@medra.dev/ui` and no manifests changed); `grep` read-only sink scan (exit `0`).

## Findings

### S-01 [low] `filterInOptions` dereferences nullish sparse rows in `lazy` + `virtualScroll` mode

**Status:** open
**Confidence:** high · **Origin:** manual
**CWE:** CWE-476 · **CVE:** n/a · **CVSS:** n/a
**Location:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2421-2423` · DAT-039, DAT-057
**Evidence:** `filterInOptions` iterates `for (const row of this.value())` and accesses `const raw = (row as Record<string, unknown>)[field];` without checking whether `row` itself is `null` or `undefined`, even though `lazy` + `virtualScroll` documents sparse `value` arrays (`null`/`undefined` placeholders at `data-table.component.ts:345-346`) and `FILTER_MODES_BY_TYPE` (`data-table-column-filter.ts:4-8`) includes `'in'` by default for `'text'`, `'numeric'`, and `'date'`.
**Attack scenario:** In a `lazy` + `virtualScroll` table with `columnFilter` enabled and no `filterOptions` override, a user selects the `In` match mode in the filter menu (or renders a `filterDisplay="row"` table with `filterMatchMode="in"`), invoking `filterInOptions(col)` on a sparse `value` array containing unloaded `null` or `undefined` slots and raising `TypeError: Cannot read properties of null`.
**Impact:** Client-side unhandled exception causing UI rendering failure for the filter control or table view until reload or reset.
**Fix:** Guard against nullish or non-object entries in `filterInOptions` before reading `row[field]`: `if (row === null || row === undefined || typeof row !== 'object') continue;`.
**Validation:** Add a Jest test in `data-table-advanced-filters.spec.ts` or `data-table-filter-row.spec.ts` with `[lazy]="true"`, `[virtualScroll]="true"`, a sparse `value` array containing `null` and `undefined` slots, and `filterMatchMode="in"` without `filterOptions`, asserting no error is thrown and loaded distinct values populate `MultiSelect`.
**References:** https://cwe.mitre.org/data/definitions/476.html
**Residual risk:** On large non-sparse datasets without `filterOptions`, `filterInOptions` still scans all rows in `this.value()` on each template check while an `in` `MultiSelect` is rendered.

### S-02 [info] `DataTableComponent` `columnFilters` reads and writes drop null-prototype protection and `Object.hasOwn` guards

**Status:** open
**Confidence:** confirmed · **Origin:** manual
**CWE:** CWE-1321 · **CVE:** n/a · **CVSS:** n/a
**Location:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1635,1841,2361,2439,2447,2584,2741-2748` · DAT-038, DAT-057
**Evidence:** `parseStoredColumnFilters` (`data-table-state.ts:186,191`) constructs `Object.create(null)` and checks `isSafeKey(col.field)` and `Object.hasOwn(stored, col.field)`, whereas `commitColumnFilter` (`data-table.component.ts:2742-2745`) spreads `{ ...this.columnFilters() }` into a standard `Object.prototype`-backed object and assigns `next[field] = entry`, while `filteredValue`, `isColumnFilterActive`, `rowFilterMode`, `rowFilterValue`, `onFilterMenuShown`, and the `rowControls` effect index `columnFilters()[field]` without `Object.hasOwn`.
**Attack scenario:** Untrusted Web Storage entries cannot introduce prototype keys directly because `parseStoredColumnFilters` rejects them; however, if an application declares a column `field` matching an `Object.prototype` property (such as `constructor` or `toString`) or if another script on the page pollutes `Object.prototype`, `columnFilters()[field]` resolves the inherited property (`onFilterMenuShown` at line `2593` treats any truthy inherited function as an existing rule), and `commitColumnFilter` with `field === '__proto__'` sets the prototype of `next` rather than defining an own property.
**Impact:** Hardening gap only; no standalone exploit demonstrated because `col.field()` is template-declared by the host application.
**Fix:** Guard `columnFilters` reads with `Object.hasOwn(filters, field)` and guard/avoid raw `'__proto__'` bracket assignment in `commitColumnFilter` (for example using `Object.create(null)` or `Object.defineProperty` / safe-key validation).
**Validation:** Add a unit test verifying `DataTableComponent` does not treat inherited `Object.prototype` properties on `columnFilters` as active or existing rules.
**References:** https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html, https://cwe.mitre.org/data/definitions/1321.html
**Residual risk:** Third-party host bindings supplying prototype-polluted objects directly into `[(columnFilters)]` remain dependent on host input hygiene.

### S-03 [info] `parseStoredFilterRule` (`in` mode) scans unbounded array elements until 200 valid items are collected

**Status:** open
**Confidence:** confirmed · **Origin:** manual
**CWE:** CWE-1284 · **CVE:** n/a · **CVSS:** n/a
**Location:** `projects/medra/ui/src/lib/data-table/data-table-state.ts:161-170` · DAT-038
**Evidence:** `parseStoredColumnFilters` bounds group rule inspection up front via `rawRules.slice(0, MAX_COLUMN_FILTER_RULES)` (`data-table-state.ts:205`), whereas `parseStoredFilterRule` for `mode === 'in'` (`data-table-state.ts:161-170`) runs `for (const rawItem of value)` across the entire array and only breaks once `items.length >= MAX_COLUMN_FILTER_IN_ITEMS` (`200`).
**Attack scenario:** A same-origin writer or prior shared-profile user writes a JSON array containing hundreds of thousands of invalid elements (such as `null`s) under `columnFilters.<field>.value` for an `in` rule. Because invalid entries do not increment `items.length`, startup deserialization scans every element in `value`.
**Impact:** Minor startup CPU overhead on tampered storage, practically bounded in browsers by Web Storage size limits (~5 MB per origin) and matching the existing scan pattern in `parseCollapsedRowGroups` (`data-table-state.ts:281-288`).
**Fix:** Bound total inspected elements in `mode === 'in'` (for example slicing `value.slice(0, MAX_COLUMN_FILTER_IN_ITEMS)` or applying an explicit raw-element scan ceiling) before validating items.
**Validation:** Add a unit test in `data-table-advanced-filters.spec.ts` passing a large array of invalid items to `parseStoredColumnFilters` in `in` mode and asserting bounded inspection.
**References:** https://cwe.mitre.org/data/definitions/1284.html, https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
**Residual risk:** Parsing the outer JSON string via `JSON.parse(raw)` remains bounded by Web Storage quota.

## Previous Findings

None.

## Threat Model Conformance

No threat model (fast track).

## Limitations

- `semgrep`, `trivy`, and `gitleaks` are not installed in this environment, so automated SAST and dedicated secret scanning did not run (`npm audit` `11.19.1` and manual/`grep` inspection ran instead).
- `WebFetch` is unavailable in this environment; MITRE CWE (`CWE-476`, `CWE-1284`, `CWE-1321`), OWASP (`Prototype Pollution Prevention`, `Input Validation`, `HTML5 Security`), and Angular security documentation were consulted via `search_web` summaries.
- Pre-existing advisories reported by `npm audit --omit=dev` in unchanged root/site workspace packages (`@firebase/firestore`, `@firebase/firestore-compat`, `@grpc/grpc-js`, `esbuild`, `firebase`, `re2js`, `source-map-js`, and `vite`) were not individually cross-checked against NVD or CISA KEV because this change modifies no dependency manifests or lockfiles and `@medra.dev/ui` does not depend on those packages.
- No Playwright e2e test or dynamic Jest reproduction test was authored or run for `S-01`–`S-03`; verification relied on the existing `data-table` Jest suites (`10` suites, `393` tests) and static code/template inspection.
