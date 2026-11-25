# Review: document-date-picker-parity — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 2 · major 1 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

Most of the `DatePickerComponent` documentation expansion in `projects/site/src/app/pages/docs/components/date-picker.page.ts` is implemented with 18 accurate sections, `Suite: green`, TDD red/green evidence (`T001` red, `T002` green), and a verified user-authorized selector refinement on `T002`. However, the change fails verification on two critical defects: the **Multiple Months** (`numberOfMonths`) section (`#example-multiple-months`) mistakenly reuses the legacy `date-picker-multiple-month.txt` and `DatePickerMultipleMonthDemo` (`selectionMode="multiple"` and `view="month"`), leaving `numberOfMonths` completely undocumented (`DTP-016`), and the Playwright test `e2e/site/date-picker-docs.spec.ts` violates Constitution Article XI and `DTP-016.S1` by omitting interactive verification for Range, Signal Forms, and Template Driven demos as well as browser console/hydration error checks. Additionally, `date-picker-drilldown.txt` misstates how `navigation="drilldown"` opens and navigates, and `date-picker-locale.txt` inaccurately attributes accessible day labels to `locale`.

## Findings

### F-01 [critical] "Multiple Months" section documents and demos Multiple/Month Picker instead of `numberOfMonths`

**Where:** `projects/site/src/app/pages/docs/components/date-picker.page.ts:16,36,57,78,118,185-189,267,287`, `projects/site/src/content/docs/date-picker-multiple-month.txt:1-7`, `projects/site/src/app/pages/docs/components/demos/date-picker-multiple-month.demo.html:1-12` · `DTP-016`
**Problem:** `REQ DTP-016` (`docs/changes/document-date-picker-parity/specs/date-picker/spec.md:9`) and `proposal.md:5,11` require `/docs/components/date-picker` to provide English prose, a live interactive demo, and a source code block for **Multiple Months** (`numberOfMonths`), alongside separate sections for Multiple and Month Picker. Instead, `#example-multiple-months` in `date-picker.page.ts:185-189` renders the legacy `date-picker-multiple-month.txt` (`## Multiple dates and month-only picking`, which explains `selectionMode="multiple"` and `view="month"`) and `DatePickerMultipleMonthDemo` (`date-picker-multiple-month.demo.html:1-12`, which renders `<med-date-picker selectionMode="multiple" ... />` and `<med-date-picker view="month" ... />`). Neither `numberOfMonths` nor multi-month calendar display is explained or demonstrated anywhere on the page, duplicating `#example-multiple` and `#example-month-picker`.
**Fix:** Create dedicated prose (e.g., `projects/site/src/content/docs/date-picker-multiple-months.txt`) and a live demo (e.g., `DatePickerMultipleMonthsDemo` binding `[numberOfMonths]="2"` or `"3"`, explaining the `1` default in single mode, `2` default in range mode, `navigation="drilldown"` override to `1`, and `< sm` collapse to 1 month), and wire `#example-multiple-months` in `date-picker.page.ts` to that prose, demo, and code block (removing unused `DatePickerMultipleMonthDemo` references if no longer shared).

### F-02 [critical] `e2e/site/date-picker-docs.spec.ts` omits Range, Signal Forms, Template Driven interactive checks and console/hydration error monitoring

**Where:** `e2e/site/date-picker-docs.spec.ts:28-72` · `DTP-016.S1`, `T001`, Constitution Article XI
**Problem:** Constitution Article XI requires every test tagged with a scenario ID to assert every Given and Then clause of that scenario, and `DTP-016.S1` (`docs/changes/document-date-picker-parity/specs/date-picker/spec.md:15-16`) explicitly requires that: (1) the "On this page" navigation lists every `EXAMPLES` anchor in order and each section renders English prose, a live `<med-date-picker>` demo, and a code block, and (2) interactive demos (**Range**, **Clear Icon**, **Signal Forms**, **Template Driven**, **Reactive Forms**) update their bound values without **console or hydration errors**. In `e2e/site/date-picker-docs.spec.ts`:
1. Lines `55-70` only test Clear Icon (`app-date-picker-clear-icon-demo`) and Reactive Forms (`app-date-picker-reactive-forms-demo`); `app-date-picker-range-demo`, `app-date-picker-signal-forms-demo`, and `app-date-picker-template-driven-demo` are never interacted with or asserted to update their bound values.
2. Line `30` only listens to `page.on('pageerror', ...)`, which catches uncaught exceptions but does not catch `console.error` calls or Angular hydration warnings/errors emitted via the browser console (`page.on('console', ...)`).
3. Lines `44-53` assert only `toBeAttached()` on `med-date-picker` and `app-code-block` without asserting visibility, non-empty rendered code (`pre code`), or section DOM order matching `EXAMPLES`.
**Fix:** In `e2e/site/date-picker-docs.spec.ts`: (1) attach `page.on('console', ...)` to fail on `error` messages and Angular hydration errors/warnings; (2) assert that `#example-*` anchors in `<article>` appear in `EXAMPLES` order and each section's prose, `<med-date-picker>`, and `<app-code-block> pre code` are visible/non-empty (plus verifying `#example-multiple-months` renders multiple months when opened); and (3) add interactive assertions verifying bound-value updates for `app-date-picker-range-demo` (selecting start and end dates in the overlay), `app-date-picker-signal-forms-demo`, and `app-date-picker-template-driven-demo`.

### F-03 [major] `date-picker-drilldown.txt` inaccurately describes `navigation="drilldown"` panel flow

**Where:** `projects/site/src/content/docs/date-picker-drilldown.txt:1-3` · `DTP-016`
**Problem:** `date-picker-drilldown.txt:3` states: `` `navigation="drilldown"` switches the header into interactive month and year buttons so users can jump up to the month grid or searchable year list instead of stepping one month at a time. `` In `DatePickerPanelComponent` (`projects/medra/ui/src/lib/date-picker/date-picker-panel.component.ts:134-168,213-219,1083-1091`), `navigation="drilldown"` starts every fresh open directly on the **searchable year list** (`view = 'year'`), drills down year -> month -> day upon selection, hides prev/next chevrons, and exposes a single clickable header button on the month view (back to year) and day view (back to month). The current prose implies it opens on the day grid with month/year buttons to jump up.
**Fix:** Rewrite `projects/site/src/content/docs/date-picker-drilldown.txt` to state accurately that `navigation="drilldown"` opens on a searchable year list and steps down through the month and day grids without prev/next chevrons, using the header button to step back up one level at a time.

### F-04 [minor] `date-picker-locale.txt` claims `locale` formats accessible day labels that are not rendered

**Where:** `projects/site/src/content/docs/date-picker-locale.txt:3` · `DTP-016`
**Problem:** `date-picker-locale.txt:3` states that `` `locale` passes a BCP 47 tag to `Intl.DateTimeFormat` for month names, weekday headers, and accessible day labels in the calendar overlay ``. In `DatePickerPanelComponent` (`projects/medra/ui/src/lib/date-picker/date-picker-panel.component.ts:269-297,510-530`), `Intl.DateTimeFormat(this.locale(), ...)` formats month/year headers (`monthYearLabelForOffset`), month grid cells (`monthLabels`), and weekday headers (short text and full weekday `abbr`), whereas day `gridcell` elements (`lines 284-295`) only render the numeric day (`cell.date.getDate()`) with no `aria-label`.
**Fix:** Update `projects/site/src/content/docs/date-picker-locale.txt` to refer to month names, month/year headings, and weekday headers (including `abbr` names) instead of accessible day labels.

### F-05 [minor] Section titles/labels abbreviate `Min / Max & Disabled Dates` and `Time` inconsistently with `REQ DTP-016`

**Where:** `projects/site/src/app/pages/docs/components/date-picker.page.ts:73,76`, `projects/site/src/content/docs/date-picker-min-max.txt:1`, `projects/site/src/content/docs/date-picker-show-time.txt:1` · `DTP-016`
**Problem:** `REQ DTP-016` specifies the feature list including `Min / Max & Disabled Dates` and `Time`. In `date-picker.page.ts:73` and `date-picker-min-max.txt:1`, the label and `<h2>` heading are shortened to `Min / Max` (while the prose documents `minDate`, `maxDate`, `disabledDates`, and `disabledDays`), and `date-picker-show-time.txt:1` uses `## Time selection` while `EXAMPLES` (`date-picker.page.ts:76`) labels it `Time`.
**Fix:** Align the `EXAMPLES` label and `date-picker-min-max.txt` heading (`Min / Max & Disabled Dates`) and `date-picker-show-time.txt` heading (`Time`) with `REQ DTP-016` (or update the spec if shorter labels are intended).

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DTP-016` | `projects/site/src/app/pages/docs/components/date-picker.page.ts:1-298`, 16 new `.demo.ts`/`.demo.html` pairs and 16 new `.txt` files (`projects/site/src/content/docs/date-picker-*.txt`), pre-existing `date-picker-{basic,show-time,multiple-month}` files, `e2e/site/date-picker-docs.spec.ts:27-73` (authorized `T002` `tocLinks` edit verified non-weakening), tasks `T001` (red) and `T002` (green); fails on missing Multiple Months (`numberOfMonths`) docs/demo (`F-01`), incomplete `DTP-016.S1` interactive and console/hydration assertions (`F-02`), drilldown prose inaccuracy (`F-03`), and minor prose/label discrepancies (`F-04`, `F-05`) | partial |
