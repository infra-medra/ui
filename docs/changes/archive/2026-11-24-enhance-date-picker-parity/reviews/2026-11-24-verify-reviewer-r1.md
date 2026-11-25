# Review: enhance-date-picker-parity — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

All seven DatePicker parity requirements (`DTP-017` through `DTP-023`), `.changeset/date-picker-parity.md` (`minor`), and Constitution Articles I–VIII, X, and XI are satisfied, with all 117 Jest tests in `projects/medra/ui/src/lib/date-picker/`, `npm run build:ui`, `npm run build:site`, and the Playwright `e2e/site/date-picker-docs.spec.ts` suite passing. Two minor test-hygiene findings remain: the `DTP-020.S1` unit test in `date-picker-panel.component.spec.ts` does not assert `getHours()` or AM/PM toggling directly (and both `timeOnly` Jest tests override `hourFormat` to `'12'`), and `e2e/site/date-picker-docs.spec.ts` still has `'all 19 examples'` and `DTP-016.S1` only in its top-level `test` title despite verifying all 26 sections including `DTP-022.S1` and `DTP-023.S1`.

## Findings

### F-01 [minor] `DTP-020.S1` panel spec omits hour value and AM/PM period assertions

**Where:** `projects/medra/ui/src/lib/date-picker/date-picker-panel.component.spec.ts:620-647` · `DTP-020` / `DTP-020.S1`
**Problem:** The test titled `'DTP-020.S1: timeOnly renders only time controls without grids and commits Date on hour/minute/period changes'` sets `hourInput.value = '8'` and `minuteInput.value = '15'` with `hourFormat: '12'`, but only asserts `expect(lastDate.getMinutes()).toBe(15)` without checking that `lastDate.getHours()` reflects `8` or exercising the AM/PM period toggle button. In addition, neither `date-picker-panel.component.spec.ts:623` nor `date-picker.component.spec.ts:781` exercises `timeOnly` with the default `hourFormat` (`'24'`).
**Fix:** Assert `(lastDate.getHours() % 12 || 12) === 8` and click the `AM`/`PM` button in `date-picker-panel.component.spec.ts:645-646`, and add a `timeOnly` check leaving `hourFormat` unset at its `'24'` default.

### F-02 [minor] Playwright docs spec title still references 19 examples and `DTP-016.S1` only

**Where:** `e2e/site/date-picker-docs.spec.ts:34-35` · `DTP-023` / `DTP-023.S1`
**Problem:** Although `EXPECTED_EXAMPLES` lists all 26 sections and lines `122-197` assert every `DTP-022.S1` and `DTP-023.S1` requirement, the `test.describe` and `test` titles still read `'DatePicker documentation page (DTP-016.S1)'` and `'DTP-016.S1: renders On this page links, prose, live demos, and code blocks for all 19 examples'`, tagging `DTP-022.S1` and `DTP-023.S1` only in inline comments.
**Fix:** Update the test titles in `e2e/site/date-picker-docs.spec.ts:34-35` to reference all 26 examples and cite `DTP-022.S1` and `DTP-023.S1` (or move the parity assertions into a dedicated `DTP-023.S1` / `DTP-022.S1` test).

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DTP-017` | `projects/medra/ui/src/lib/date-picker/date-picker.component.ts:91-139,197,271-277,537`, `date-picker-panel.component.ts:478-480,629-634,672-700`, `date-picker.component.spec.ts:605-666`, `date-picker-panel.component.spec.ts:543-554`, `e2e/site/date-picker-docs.spec.ts:122-128` | met |
| `DTP-018` | `projects/medra/ui/src/lib/date-picker/date-picker.component.ts:127-129,137,215,219-220,467-470,593-595,605`, `date-picker-panel.component.ts:402-421,474-476,485,1336-1392`, `date-picker.component.spec.ts:670-738`, `date-picker-panel.component.spec.ts:556-590`, `e2e/site/date-picker-docs.spec.ts:130-139` | met |
| `DTP-019` | `projects/medra/ui/src/lib/date-picker/date-picker.types.ts:3`, `date-picker.component.ts:195,228-229,295,327-329,352-355,582-583`, `date-picker-panel.component.ts:138-184,429,452-453,627-628,639,834-853,914-938,1114-1165,1214-1224,1402`, `date-picker.component.spec.ts:742-774`, `date-picker-panel.component.spec.ts:592-618`, `e2e/site/date-picker-docs.spec.ts:141-150` | met |
| `DTP-020` | `projects/medra/ui/src/lib/date-picker/date-picker.component.ts:121,238,295,321-323,348-351,450,551,587`, `date-picker-panel.component.ts:347-400,468,629-634,676-679,704-708,1265-1295,1331-1334`, `date-picker.component.spec.ts:778-808`, `date-picker-panel.component.spec.ts:620-651`, `e2e/site/date-picker-docs.spec.ts:152-161` | met |
| `DTP-021` | `projects/medra/ui/src/lib/date-picker/date-picker.types.ts:10-20`, `date-picker.component.ts:130,248,596`, `date-picker-panel.component.ts:1,329-333,477,820-832`, `date-picker.component.spec.ts:812-882`, `date-picker-panel.component.spec.ts:653-684`, `e2e/site/date-picker-docs.spec.ts:163-170` | met |
| `DTP-022` | `projects/medra/ui/src/lib/date-picker/date-picker.component.ts:77-82,188,210-211,255,264-277`, `date-picker.component.spec.ts:886-901`, `e2e/site/date-picker-docs.spec.ts:172-196` | met |
| `DTP-023` | `projects/site/src/app/pages/docs/components/date-picker.page.ts:15-388`, 7 new `projects/site/src/app/pages/docs/components/demos/date-picker-*.demo.{ts,html}`, 7 new `projects/site/src/content/docs/date-picker-*.txt`, `projects/site/src/content/api/date-picker.json`, `e2e/site/date-picker-docs.spec.ts:48-72,122-198`, `npm run build:ui`, `npm run build:site` | met |
