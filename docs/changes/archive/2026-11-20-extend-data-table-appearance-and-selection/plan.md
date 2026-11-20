# Plan: extend-data-table-appearance-and-selection

## Summary

`DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) gains three inputs, `size`, `showGridlines` and `stripedRows` (DAT-025), a new `selectionMode` value `radio` (DAT-006) and arrow, Home and End navigation between focusable rows (DAT-026). Appearance is a set of class maps merged through `mergeClasses`, the radio cell reuses `radioRingVariants` from the radio-button styles, and keyboard navigation extends the existing `onRowKeydown`. The DataTable docs page gains five examples, with prose, a demo and a code block each, in the structure the previous change built (DAT-024). A minor changeset ships the new public API. Nothing outside `data-table/`, the docs site, `e2e/site/` and `.changeset/` changes.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | Only `DataTableComponent` changes; it is already standalone, and the new inputs use `input()` (D-01, D-03). |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Padding, border and stripe classes are token classes with `dark:` variants merged through `mergeClasses` (D-01, D-02); the radio ring uses `radioRingVariants`. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | No overlay is added, and no new icon: the radio dot is the shared `radioRingVariants` ring (D-03). |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | The table is not a form control, as the previous change already recorded. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps DAT-006.S3 and DAT-026.S1 to S3 to Jest; DAT-025.S1 to S3 and DAT-024.S4 are CSS or page dependent and go to Playwright (D-05). Tasks will order `[TEST]` first. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Radios are native `<input type="radio">` with an accessible name; arrow, Home and End keys are specified in D-04; focus uses the row's existing focus ring. DAT-026.S1 to S3 test the keys. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | The code and prose are written from the deltas; all text is English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | The only new string is the radio's accessible name, which comes from the existing `rowAriaLabel` input with the English default "Select row" (D-03). |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | The new public API ships with a `minor` changeset and no peer range changes (D-06). |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` for the component, and `npx playwright test --project=site e2e/site/data-table-docs.spec.ts e2e/site/data-table-appearance.spec.ts` for the site.
- **Framework:** Jest with jsdom for behavior and DOM; Playwright (the `site` project) for scenarios that depend on computed styles or on the rendered docs page.

| Scenario | Level | Test location |
|---|---|---|
| `DAT-006.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-006.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-006.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-026.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-026.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-026.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-025.S1` | e2e | `e2e/site/data-table-appearance.spec.ts` |
| `DAT-025.S2` | e2e | `e2e/site/data-table-appearance.spec.ts` |
| `DAT-025.S3` | e2e | `e2e/site/data-table-appearance.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` |

DAT-025 asserts computed padding, border widths and background colors, which jsdom cannot resolve from Tailwind classes, so it measures the live docs demos. DAT-006.S1, S2 and DAT-024.S1 to S3 already have tests, which stay as they are and must keep passing.

## Appearance and selection design

- **Cells.** A `computed` per `size()` yields the padding and text classes (`sm`, `default`, `lg`); `default` equals today's `px-3 py-2.5`, so existing tables do not change. The same classes apply to header, body, group, expansion and selection cells.
- **Grid lines and stripes.** `showGridlines()` adds a surface border to every `th` and `td`. `stripedRows()` gives odd data rows a surface background, using the displayed row index so group header and expansion rows do not shift the pattern; a selected row keeps the selected background.
- **Radio.** `TableSelectionMode` gains `'radio'`. A single-like check (`single` or `radio`) replaces the direct `=== 'single'` tests in `isSelected`, `onRowClick`, `onRowKeydown` and the row `tabindex`. `radio` adds one leading cell per row with a native radio sharing a per-table `name`, and an empty header cell; `totalColumnCount` counts it.
- **Keys.** `onRowKeydown` handles ArrowUp, ArrowDown, Home and End by focusing a sibling `tbody > tr[tabindex]` row, so group headers and expansion rows are skipped.
- **Docs.** `data-table.page.ts` adds five slugs, `selection-radio`, `keyboard-navigation`, `size`, `grid-lines` and `striped-rows`, each with `content/docs/data-table-<slug>.txt` and a demo, between the existing entries; `ariaLabel` is set on each table.

## Decisions

### D-01: Size uses `sm`, `default` and `lg`

**Choice:** `size` takes `sm`, `default` (default) and `lg`, matching Button, Badge and Avatar, with `default` equal to today's cell padding.
**Alternatives:** PrimeNG's `small`, `large` names; a free-form padding input.
**Rationale:** One size vocabulary across the library, and no visual change for tables that do not set it.

### D-02: Stripes follow the displayed row index

**Choice:** `rowClassFor` receives the row index and stripes odd indices; grid lines are borders on every `th` and `td`.
**Alternatives:** A CSS `odd:`/`even:` variant on `tr`; `nth-child` selectors.
**Rationale:** Group header and expansion rows are `tr` elements too, so structural selectors would break the alternation; the index makes it deterministic.

### D-03: Radio reuses the single selection model

**Choice:** `selectionMode="radio"` behaves as `single` plus a radio cell built from `radioRingVariants`; the radio's `change` calls `selectSingle` and its click does not bubble to the row, so selection is not applied twice. Its accessible name comes from `rowAriaLabel`, defaulting to "Select row".
**Alternatives:** A separate `radioSelection` input; a custom ARIA radio role on the row.
**Rationale:** Keeps one model, one `selection` shape and one set of events, and native radios give correct semantics for free.

### D-04: Keys move focus only, and rows keep their tab stops

**Choice:** Arrow, Home and End focus a sibling focusable row and never select; every row keeps `tabindex="0"`.
**Alternatives:** Roving tabindex with one tab stop; moving the selection with the arrows.
**Rationale:** The deltas fix the behavior to focus movement. A roving tabindex would change how Tab works today, which is outside this change.

### D-05: CSS-dependent scenarios run in the real browser

**Choice:** DAT-025 and DAT-024.S4 are checked by Playwright against the built docs site; behavior scenarios stay in Jest.
**Alternatives:** Asserting Tailwind class names in Jest.
**Rationale:** Article V requires real-browser checks for style-dependent behavior, and a class name does not prove the computed style.

### D-06: Ship a minor changeset

**Choice:** One `minor` changeset for `@medra.dev/ui` describes the new inputs and the `radio` mode.
**Alternatives:** No changeset; a `patch`.
**Rationale:** REL-004 requires a changeset for source changes under `projects/medra/ui/`, and new public API is a minor bump that leaves the Angular-major rule intact.
