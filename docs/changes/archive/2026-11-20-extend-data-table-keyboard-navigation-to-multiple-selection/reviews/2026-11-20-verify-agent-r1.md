# Review: extend-data-table-keyboard-navigation-to-multiple-selection — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

DAT-026 is implemented as the delta specifies. Rows are focusable in every selection mode, the four movement keys move focus without touching the selection, and Space and Enter toggle the row in `multiple` mode. The five scenario tests exercise their Given, When and Then, and the evidence lines are complete (red on T001, green on T002 to T004). The suite is green per the dispatch. One minor finding: the `multiple` guard against keys that bubble from the row checkbox has no test.

## Findings

### F-01 [minor] The checkbox-bubbling guard in multiple mode is untested

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:864` · DAT-026 (T002)
**Problem:** `onRowKeydown` returns early when `mode === 'multiple' && event.target !== event.currentTarget`. This keeps Space on the row checkbox from being handled twice. No test in `data-table.component.spec.ts` (S4 and S5, lines 490 to 530) dispatches a key from the checkbox. Every key in S4 and S5 is dispatched on the `<tr>`, so deleting the guard leaves the suite green. The behavior belongs to DAT-026, which says the keys apply "on a focused row".
**Fix:** Add a test under DAT-026.S5. Focus the row checkbox, dispatch Space and ArrowDown from it, and assert that the selection toggles exactly once (the checkbox's own `change` path) and that focus does not move to another row.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-026` | Code: `data-table.component.ts:322` (`tabindex` set for any selection mode) and `:859-884` (key handling, `toggleRow` in `multiple`). Tests: S1 (`spec.ts:425,443`) and S2 (`:453`) are unchanged and assert focus and unchanged selection. S3 (`:467,480`) covers the edges in `single` mode and the no-selection-mode case, asserting `defaultPrevented === false`. S4 (`:490`) covers focus moves with the two selected rows unchanged and `onRowSelect` not called. S5 (`:518`) covers Space adding the row and Enter removing it. Evidence: T001 red, T002 green, T003 e2e green, T004 changeset green. No test was weakened. The only removed assertion is the old "multiple does not handle keys" check, which the delta replaces. The S4 test presses Home before End, not End before Home as the scenario lists. The final states are the same, so I count this as equivalent. | met |

## Checks run

- **Weakening audit:** the spec diff removes only the multiple-mode "not handled" expectation, which the delta reverses. It adds no skips, no loosened matchers and no mocks of the behavior under test.
- **Scope creep:** every changed file maps to T001 to T004: the component and spec, the demo (T003), the docs prose, and the changeset (T004). No other files changed.
- **Constitution:** Article VI keyboard operation is served by the change. Article VII is met, since all added text is English. Article X is met: the changeset is `patch`. I found no violation.
