# Review: document-existing-data-table-features — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

DAT-024 is met. The page declares a 20-entry `EXAMPLES` list whose ids and order match the 20 `example-<slug>` sections. Each section holds prose, a live demo and a code block. The six Playwright tests pass on this code (6 passed). Every `med-data-table` binding used by the demos exists on the component, and no file under `projects/medra/ui/` changed. The one finding is a config edit that no task accounts for.

## Findings

### F-01 [minor] Unplanned edit to `docs/config-flow.yaml`

**Where:** `docs/config-flow.yaml:15-16` · plan Decisions D-01 to D-04, tasks T001 to T010
**Problem:** The diff against `7ddca3d` adds `e2e/**` and `"**/*.spec.*"` to the `testing` patterns. No task or plan section mentions this. It changes which files count as tests for the weakening and hash checks, and so alters the verification rules for this change itself.
**Fix:** Add a plan note or task for it, or split it into its own change. If it is deliberate, record the reason in the plan so the Playwright spec is tracked as a test file.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-024` | `data-table.page.ts:85-106` (`EXAMPLES`) and sections at `:143-301`. All 20 demo, prose and code files exist, and every prose file starts with `## `. Every demo table has `ariaLabel`. Every demo input and output exists in the component. `e2e/site/data-table-docs.spec.ts:54,62,75,84,95,104` all green: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts`, 6 passed, run by the reviewer. T001 has red evidence and T002 to T010 have green evidence. `suite: green` (`npm test`). The spec hash equals the T001 snapshot, with no skips or loosened assertions. | met |

DAT-024.S1, S2 and S3 each map to a covering test that asserts its Given, When and Then:
- S1 compares the index ids with the section ids.
- S2 checks prose, one demo and a code block per section.
- S3 checks the pre-existing slugs and interacts with multi-sort, cell edit and CSV export.

The lazy, row-group and row-reorder demos in S3 are checked for presence only. That matches the spec wording.
