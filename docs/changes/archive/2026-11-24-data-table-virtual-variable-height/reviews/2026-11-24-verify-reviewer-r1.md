# Review: data-table-virtual-variable-height — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 3
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

The `virtualScrollRowHeight` implementation (`callback | 'auto' | null`), `Float64Array` prefix-sum helper, `ResizeObserver` auto-measurement, TDD red/green evidence, and `tsc`/`npm test` (`186` suites, `4,763` tests) all pass and satisfy `DAT-061`, `DAT-061.S1`, and `DAT-061.S2`. The single major finding (`F-01`) is that the `'auto'`-mode reset `effect` clears `measuredRowHeights` on sort, filter, or data changes without disconnecting `rowHeightObserver`, which skips re-observing reused `<tr>` elements whose rendered height happens not to change. Three minor findings cover the unrecorded `medra suite` checkpoint (`medra step --role reviewer` exited `1`), an unclamped placeholder `style.height.px`, and test coverage/tagging polish.

## Findings

### F-01 [major] Reused `<tr>` elements in `'auto'` mode are not re-observed after reset on sort, filter, or data change

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1887-1917`, `projects/medra/ui/src/lib/data-table/data-table.component.ts:1785-1809` · `REQ DAT-061` (T004)
**Problem:** When `sortField()`, `sortOrder()`, `multiSortMeta()`, `globalFilterValue()`, `columnFilters()`, `totalRecords()`, or (when `!lazy()`) `value()` changes, the reset `effect` at `data-table.component.ts:1912-1916` clears `measuredRowHeights` to an empty `Map` without calling `this.disconnectRowHeightObserver()` (unlike the `!active` branch at lines `1892-1895`). Because `trackVirtualEntry` (`:1690`) delegates to `rowTrackBy` (which defaults to `(_row, index) => index` at `:1242`, or tracks by row identity across sorts), Angular `@for` reuses existing `<tr>` DOM nodes that remain in `this.observedAutoRows`. In `afterEveryRender`, `syncAutoRowHeightObserver()` (`:1803-1808`) skips `observer.observe(row)` whenever `this.observedAutoRows.has(row)` is true. For any reused `<tr>` whose rendered height matches its previous height, `ResizeObserver` does not fire again, leaving `measuredRowHeights` empty for that index and reverting `virtualHeightIndex` to `virtualScrollItemSize` until the row scrolls out of the window and back in.
**Fix:** Call `this.disconnectRowHeightObserver()` alongside `this.measuredRowHeights.set(new Map())` inside the reset `effect` (`data-table.component.ts:1912-1916`) so `afterEveryRender` re-observes every rendered `<tr>` and emits fresh `ResizeObserver` measurements; add a component test in `data-table-virtual-variable-height.spec.ts` verifying reused `<tr>` elements re-measure after sorting or replacing `rows`.

### F-02 [minor] `medra suite` checkpoint was not recorded (`medra step --role reviewer` exited `1`)

**Where:** `docs/changes/data-table-virtual-variable-height/.medra.yaml` · `verify` workflow (`verify.suite`)
**Problem:** Running `MEDRA_SUBAGENT=1 medra step data-table-virtual-variable-height --role reviewer --stage verify --md` exited `1` (`step.role: Role "reviewer" is not active in stage "verify"`). `medra step data-table-virtual-variable-height --stage verify --json` reports `verify.suite` (`reason: not-run`) with `coordinator_steps: ["medra suite data-table-virtual-variable-height --json"]` and `subagents: []`, and `medra validate data-table-virtual-variable-height --stage verify --json` reports `verify.suite` (`reason: failed`: `"The last full-suite run failed: \"npm test\" exited 1"`). Direct execution of `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json && npm test` in this review passed (`186` suites, `4,763` tests, exit `0`), confirming the suite itself is green, but the CLI checkpoint is missing.
**Fix:** Run `medra suite data-table-virtual-variable-height --json` as coordinator so `verify.suite` passes before the verify gate.

### F-03 [minor] `lazy` placeholder `<tr data-med-placeholder>` does not clamp `virtualScrollItemSize` to `>= 1px`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:908` · `REQ DAT-061` (T004)
**Problem:** `virtualHeightIndex()` (`:1472`) and `virtualRowHeight()` (`:1494`) clamp `defaultSize = Math.max(1, this.virtualScrollItemSize())` per `REQ DAT-061`, whereas `<tr data-med-placeholder>` (`:908`) binds `[style.height.px]="virtualScrollItemSize()"` directly without clamping to at least `1px`.
**Fix:** Bind `Math.max(1, virtualScrollItemSize())` (e.g., via a helper or `virtualRowHeight(null, entry.index)`) on `<tr data-med-placeholder>` at `data-table.component.ts:908`.

### F-04 [minor] `ArrowUp`/`ArrowDown` scroll targeting in variable-height mode has no test assertion, and `DAT-061.S1` tags partial helper unit tests

**Where:** `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts:11`, `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts:77`, `projects/medra/ui/src/lib/data-table/data-table-virtual-variable-height.spec.ts:83-123` · `REQ DAT-061`, Constitution Article XI
**Problem:** `REQ DAT-061` specifies `ArrowUp`/`ArrowDown`/`Home`/`End` scroll targets from cumulative heights; `focusVirtualRow()` implements all four keys, and `data-table-virtual-variable-height.spec.ts:83-123` asserts `End` and `Home` (matching `DAT-061.S1`), leaving `ArrowUp` and `ArrowDown` untested in variable-height mode. Additionally, `data-table-virtual-heights.spec.ts:11` and `:77` tag pure helper unit tests with the `DAT-061.S1` scenario ID without exercising `<med-data-table>` or `End` key navigation as required by Constitution Article XI (all clauses of `DAT-061.S1` are tested in `data-table-virtual-variable-height.spec.ts:83`).
**Fix:** Tag the pure helper unit tests in `data-table-virtual-heights.spec.ts:11,77` with `REQ DAT-061` rather than `DAT-061.S1` (recording `--allow-test-edit` on the locked test files), and add an `ArrowDown`/`ArrowUp` scroll-into-view test in `data-table-virtual-variable-height.spec.ts`.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-061` | `medra coverage` (`2/2`: `DAT-061.S1` at `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts:11,77` and `projects/medra/ui/src/lib/data-table/data-table-virtual-variable-height.spec.ts:83`; `DAT-061.S2` at `e2e/site/data-table-virtual-variable-height.spec.ts:17,18`); `tasks.md` T001–T005 red/green evidence with matching SHA-256 test hashes in `.medra.yaml`; `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` exit `0`; focused Jest (`2/2` suites, `18/18` tests); full `npm test` (`186/186` suites, `4,763/4,763` tests); caller-reported Playwright run (`9/9` tests passing in `e2e/site/data-table-virtual*.spec.ts`, matching T005). | met |
