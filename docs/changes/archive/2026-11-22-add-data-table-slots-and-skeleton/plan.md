# Plan: add-data-table-slots-and-skeleton

## Summary

`DataTableComponent` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` gains `#caption` and `#summary` projected template slots, an `#empty` template fallback for `emptyLabel`, and a `loadingMode` input (`'spinner' | 'skeleton'`, default `'spinner'`) typed via `TableLoadingMode` in `projects/medra/ui/src/lib/data-table/data-table.types.ts`. The bordered table container separates the `#caption` and `#summary` regions from the scrollable `<table>` wrapper so they stay fixed across horizontal and vertical scroll, while skeleton mode reuses `<med-skeleton>` across every visible column (and utility columns) using `pageSize()` rows when `paginator()` is enabled or `5` rows otherwise. Documentation examples and Playwright e2e coverage are added to `projects/site/src/app/pages/docs/components/data-table.page.ts` and `e2e/site/` with a `minor` changeset.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | `DataTableComponent` and new demo components are standalone and use `input`, `contentChild`, and `computed` signals with no NgModule or `zone.js`. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Caption and summary regions use `surface-*` tokens with `dark:` variants inside `wrapperClass()`, which merges consumer `class` via `mergeClasses`. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | Skeleton loading reuses `SkeletonComponent` (`<med-skeleton>`) and spinner mode keeps `ProgressSpinnerComponent`. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `DataTableComponent` is a data-display component, not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps `DAT-040`–`DAT-042`, `DAT-007`, and `DAT-024.S12` to Jest specs and Playwright e2e checks. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Skeleton loading sets `aria-busy="true"` on the table and renders an `sr-only` `role="status"` element with `loadingLabel()`; caption/summary add no focus traps. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, TSDoc, prose, and site demos are written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | Empty and loading announcements use the existing `emptyLabel` and `loadingLabel` inputs; no translation service is added. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Ships with a `minor` changeset and no Angular baseline or `major` bump. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` and `npx playwright test e2e/site/data-table-slots-skeleton.spec.ts e2e/site/data-table-docs.spec.ts`
- **Framework:** Jest (`@angular/core/testing`) for unit/component behavior; Playwright for real-browser layout and docs verification.

| Scenario | Level | Test location |
|---|---|---|
| `DAT-040.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-040.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-041.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-041.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-042.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-042.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-007.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-007.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S7` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S8` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S9` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S10` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S11` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S12` | e2e | `e2e/site/data-table-slots-skeleton.spec.ts` |

## Architecture & Interfaces

- **`data-table.types.ts`:** Export `TableLoadingMode = 'spinner' | 'skeleton'`.
- **`data-table.component.ts`:**
  - `captionTemplate = contentChild('caption', { read: TemplateRef })`
  - `summaryTemplate = contentChild('summary', { read: TemplateRef })`
  - `emptyTemplate = contentChild('empty', { read: TemplateRef })`
  - `loadingMode = input<TableLoadingMode>('spinner')`
  - Outer bordered container holds `#caption` (when present), an inner scroll wrapper (`overflow-x-auto` and `overflow-y-auto`/`maxHeight` when `scrollable()`) containing the loading spinner overlay (only when `loading() && loadingMode() === 'spinner'`) and `<table>`, and `#summary` (when present) below the scroll wrapper and above `<med-paginator>`.

## Decisions

### D-01: Keep `#caption` and `#summary` outside the scroll viewport inside the bordered container

**Choice:** Move `overflow-x-auto` and `scrollable()` `overflow-y-auto` / `maxHeight` onto an inner wrapper around `<table>`, while the outer `wrapperClass()` div keeps the rounded border and hosts `#caption` above and `#summary` below.
**Alternatives:** Render `#caption` and `#summary` inside the `overflow-x-auto` / `overflow-y-auto` div; render them outside the bordered container altogether.
**Rationale:** Placing them inside the bordered container gives a unified card-like table frame matching PrimeNG, while keeping them outside the scroll viewport prevents wide or tall tables from scrolling the caption or summary away (`DAT-040`).

### D-02: Reuse `SkeletonComponent` in `<tbody>` with `aria-busy` and `role="status"`

**Choice:** Add `loadingMode = input<TableLoadingMode>('spinner')`. When `loading() && loadingMode() === 'skeleton'`, skip the spinner overlay and `opacity-50` dim, set `aria-busy="true"` on `<table>`, render a visually hidden `role="status"` element with `loadingLabel()`, and render `pageSize()` (when `paginator()` is true) or `5` skeleton rows in `<tbody>`, each cell (utility columns + `visibleColumns()`) containing `<med-skeleton height="1rem" />`.
**Alternatives:** Use a boolean `loadingSkeleton` input; build custom CSS pulse bars inside `DataTableComponent`.
**Rationale:** `loadingMode` is mutually exclusive with `'spinner'` and extensible (Article III requires reusing `SkeletonComponent`). Because `SkeletonComponent` sets `aria-hidden="true"`, pairing `aria-busy="true"` with an `sr-only` `role="status"` preserves screen-reader parity with spinner mode (Article VI).

### D-03: Query `#empty` template and render it inside the empty-state `<td>`

**Choice:** Query `emptyTemplate = contentChild('empty', { read: TemplateRef })` and render it inside the `@empty` `<tr><td [attr.colspan]="totalColumnCount()">` cell when present, falling back to `{{ emptyLabel() }}` when omitted.
**Alternatives:** Render `#empty` outside `<table>`; name the template `#emptymessage`.
**Rationale:** Keeping `#empty` inside the spanning `<td>` preserves table semantics and column alignment (`DAT-041`), and `#empty` matches `AutoCompleteComponent` in the same library.

### D-04: Docs add three examples and a `minor` changeset

**Choice:** Add `example-caption-summary`, `example-empty-template`, and `example-loading-skeleton` to `EXAMPLES` in `projects/site/src/app/pages/docs/components/data-table.page.ts` with corresponding demo components and Playwright checks in `e2e/site/data-table-slots-skeleton.spec.ts`, plus `.changeset/data-table-slots-and-skeleton.md` as `minor`.
**Alternatives:** Bundle into existing `example-loading` and `example-empty-state` sections; use a `patch` changeset.
**Rationale:** `DAT-024` requires one `EXAMPLES` entry and section per feature; new public inputs and template slots are a `minor` release under Article X.
