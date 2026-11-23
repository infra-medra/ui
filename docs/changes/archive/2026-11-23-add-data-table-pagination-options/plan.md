# Plan: add-data-table-pagination-options

## Summary

`DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) gains eleven inputs and one output for the paginator it already embeds (DAT-049). `paginatorPosition` renders the existing `<med-paginator>` below the table (today), above the header and below the caption, or in both places; both copies bind to the same `first` and page-size signals, so they stay in step without extra code. `showCurrentPageReport`, `currentPageReportTemplate`, `showFirstLastIcon`, `showJumpToPageInput`, `pageLinks` and `alwaysShowPaginator` forward to inputs `med-paginator` already has, and three label inputs give each landmark a distinct accessible name. A `pageChange` output re-emits the paginator's own page event, which fires only on user action, so lazy and non-lazy modes behave alike and a host writing `first` emits nothing. The documentation page adds a "Paginator options" example (DAT-024). Unit tests live in `data-table.component.spec.ts`; placement in document order and the live demo are verified by Playwright.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | New members are `input()` and `output()`; the template uses `@if`. The demo component is standalone. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | The only new element is the top paginator wrapper, which reuses the caption's surface and border tokens with their `dark:` variants (D-01). The consumer `class` merge on the wrapper is untouched. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay or icon is added; the paginator keeps its own icons. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `DataTableComponent` is not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario to Jest; document-order placement (`DAT-049.S1`) and the live demo (`DAT-024`) also go to Playwright. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | The paginator keeps its toolbar keyboard model. The only new accessibility surface is the landmark names (D-03), covered by `DAT-049.S3` and `S9`. Colors are existing tokens. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Forwarding code, demo and docs prose are written from scratch, in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | The two new default strings, "Pagination, top" and "Pagination, bottom", are `paginatorTopAriaLabel` and `paginatorBottomAriaLabel`; the report wording is `currentPageReportTemplate`. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | A `minor` changeset; no dependency or peer range change. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (unit) and `npx playwright test --reporter=list --project=site e2e/site/data-table-*.spec.ts` (e2e, every data-table spec, see L-009, because the paginator wrapper DOM changes)
- **Framework:** Jest (unit) and Playwright (e2e)

| Scenario | Level | Test location |
|---|---|---|
| `DAT-049.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S1` | e2e | `e2e/site/data-table-pagination.spec.ts` |
| `DAT-049.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S7` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S8` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S9` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-049.S9` | e2e | `e2e/site/data-table-pagination.spec.ts` (existing pagination specs, must still pass) |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (the new `paginator-options` slug joins the checked lists) |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S6` | e2e | `e2e/site/data-table-frozen.spec.ts` (existing, must still pass) |
| `DAT-024.S7` | e2e | `e2e/site/data-table-columns.spec.ts` (existing, must still pass) |
| `DAT-024.S8` | e2e | `e2e/site/data-table-frozen.spec.ts` (existing, must still pass) |
| `DAT-024.S9` | e2e | `e2e/site/data-table-column-reorder.spec.ts` (existing, must still pass) |
| `DAT-024.S10` | e2e | `e2e/site/data-table-row-editing.spec.ts` (existing, must still pass) |
| `DAT-024.S11` | e2e | `e2e/site/data-table-column-filters.spec.ts` (existing, must still pass) |
| `DAT-024.S12` | e2e | `e2e/site/data-table-slots-skeleton.spec.ts` (existing, must still pass) |
| `DAT-024.S13` | e2e | `e2e/site/data-table-cell-context.spec.ts` (existing, must still pass) |
| `DAT-024.S14` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` (existing, must still pass) |
| `DAT-024.S15` | e2e | `e2e/site/data-table-pagination.spec.ts` (new: section, prose, demo, code block, paginators above and below, custom report) |

## Risks

- Moving the bottom paginator into a shared template means every existing demo's paginator DOM is touched; the full data-table e2e run (L-009) guards against selector regressions.
- A host that binds `paginatorAriaLabel` together with `paginatorPosition="both"` gets the top and bottom names instead (D-03); the TSDoc says so.

## Architecture & Interfaces

- **Inputs (`data-table.component.ts`):**
  - `paginatorPosition = input<'bottom' | 'top' | 'both'>('bottom')`.
  - `showCurrentPageReport = input(true, { transform: booleanAttribute })`, forwarded to `showSummary`.
  - `currentPageReportTemplate = input<string | null>(null)`.
  - `showFirstLastIcon` and `showJumpToPageInput`: `input(false, { transform: booleanAttribute })`.
  - `pageLinks = input(5, { transform: numberAttribute })`, forwarded to `pageLinkCount`.
  - `alwaysShowPaginator = input(true, { transform: booleanAttribute })`, forwarded to `alwaysShow`.
  - `paginatorAriaLabel = input('Pagination')`, `paginatorTopAriaLabel = input('Pagination, top')`, `paginatorBottomAriaLabel = input('Pagination, bottom')`.
- **Output:** `pageChange = output<PaginatorPageEvent>()`, wired to the `(pageChange)` of every rendered paginator. `PaginatorPageEvent` is already exported from the paginator file; it is re-exported from the library entry point if it is not yet public.
- **Template:** one `<ng-template #paginatorTpl let-label="label">` holds the single `<med-paginator>` with all bindings, rendered through `ngTemplateOutlet`. The condition `paginator() && !virtualScroll() && effectiveTotalRecords() > 0` becomes a `showPaginator` computed. The top copy renders inside the bordered wrapper, right after the caption block and before the scroll viewport, in `<div data-med-paginator-top>`; the bottom copy stays where it is today, after the wrapper.
- **Docs:** `data-table-paginator-options.demo.ts/.html` with a content text file under `projects/site/src/content/docs/`, an `example-paginator-options` entry placed after `example-programmatic-pagination`, and API rows for the new inputs and output.
- **Changeset:** `.changeset/data-table-pagination-options.md`, `'@medra.dev/ui': minor`.

## Decisions

### D-01: One paginator template rendered at one or two places

**Choice:** Define the `<med-paginator>` once in an `ng-template` and render it at the top (inside the bordered wrapper, below the caption, with the caption's `border-b` and surface tokens), at the bottom (outside the wrapper with the current `mt-3 block`), or both.
**Alternatives:** Duplicate the element with its bindings in two `@if` blocks; place the top copy outside and above the bordered wrapper.
**Rationale:** One template keeps the eleven bindings from drifting apart. Inside the wrapper matches "below the caption and above the table header" and keeps the caption first in document order (`DAT-049.S1`).

### D-02: Keep both paginators in step through the shared models

**Choice:** Both copies bind `[(first)]="first"` and `[(rows)]="pageSize"` to the table's existing signals; no synchronization code is written.
**Alternatives:** Give each copy its own state and copy changes across with `pageChange`.
**Rationale:** The models already feed `lazyLoad`, persisted state and the sliced rows; a second source of truth would invite loops and stale pages (`DAT-049.S2`).

### D-03: Landmark names by position

**Choice:** A single paginator uses `paginatorAriaLabel`; with `both`, the top copy uses `paginatorTopAriaLabel` and the bottom one `paginatorBottomAriaLabel`, and `paginatorAriaLabel` is not used.
**Alternatives:** Append "top" and "bottom" to `paginatorAriaLabel` automatically; leave both copies with the same name.
**Rationale:** Two navigation landmarks with one name are indistinguishable for screen-reader users; independent inputs follow Article VIII and keep the default for the single case unchanged (`DAT-049.S3`, `S9`).

### D-04: `pageChange` is the paginator's event, not a derived one

**Choice:** Re-emit the paginator's `pageChange`, which fires only from its own page and page-size handlers.
**Alternatives:** Derive the event from an effect on `first` and `pageSize`, which would also fire on host writes, restored state and sort or filter resets.
**Rationale:** The requirement is an event for user changes; the paginator already emits it identically in lazy and non-lazy mode, and a host writing `first` emits nothing (`DAT-049.S8`).

### D-05: Forward report visibility to `showSummary`

**Choice:** `showCurrentPageReport` forwards to the paginator's existing `showSummary`, and the table adds no report logic: `currentPageReportTemplate` goes straight to the paginator, which already replaces `{first}`, `{last}`, `{totalRecords}`, `{currentPage}`, `{totalPages}` and `{rows}`.
**Alternatives:** Build the report text in the table.
**Rationale:** The paginator owns the report; forwarding avoids two implementations (`DAT-049.S4`, `S5`).
