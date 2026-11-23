import { ChangeDetectionStrategy, Component, DestroyRef, Injector, PLATFORM_ID, TemplateRef, afterNextRender, booleanAttribute, computed, contentChild, contentChildren, effect, ElementRef, inject, input, linkedSignal, model, numberAttribute, output, signal, untracked, viewChild } from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonDirective } from '../button/button.directive';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { IconComponent } from '../icon/icon.component';
import { InputTextDirective } from '../input-text/input-text.directive';
import { PaginatorComponent } from '../paginator/paginator.component';
import { PopoverComponent } from '../popover/popover.component';
import { SelectComponent } from '../select/select.component';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { checkboxBoxVariants } from '../checkbox/checkbox.styles';
import { DOT_SIZE_CLASS, radioRingVariants } from '../radio-button/radio-button.styles';
import { mergeClasses } from '../utils/merge-classes';
import { TableColumnComponent } from './table-column.component';
import { FILTER_MODES_BY_TYPE, isRuleActive, matchesColumnFilter, offeredMatchModes, preselectedMatchMode } from './data-table-column-filter';
import { TableColumnAlign, TableColumnFilter, TableColumnFilters, TableFilterMatchMode, TableColumnReorderEvent, TableLazyLoadEvent, TableLoadingMode, TableRowEditEvent, TableRowReorderEvent, TableSelectionMode, TableSize, TableSortMeta, TableSortMode, TableSortOrder } from './data-table.types';

let nextRadioGroupId = 0;

/** English names of the column filter match modes; `matchModeLabels` overrides them. */
const DEFAULT_MATCH_MODE_LABELS: Readonly<Record<TableFilterMatchMode, string>> = {
  contains: 'Contains',
  notContains: 'Does not contain',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  equals: 'Equals',
  notEquals: 'Does not equal',
  lt: 'Less than',
  lte: 'Less than or equal to',
  gt: 'Greater than',
  gte: 'Greater than or equal to',
  dateIs: 'Date is',
  dateIsNot: 'Date is not',
  dateBefore: 'Date is before',
  dateAfter: 'Date is after',
};

const SIZE_PADDING_CLASS: Record<TableSize, string> = {
  sm: 'px-2 py-1.5',
  default: 'px-3 py-2.5',
  lg: 'px-4 py-4',
};

const SIZE_TEXT_CLASS: Record<TableSize, string> = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
};

const ALIGN_CLASS: Record<TableColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** Width of the row reorder handle column, in px: exact so the sticky offsets of frozen columns after it are exact. */
const REORDER_COLUMN_PX = 32;
/** Width of the selection checkbox and radio column, in px. */
const SELECTION_COLUMN_PX = 40;
/** Offset contribution of a frozen column with no usable pixel `width`. */
const MIN_FROZEN_COLUMN_PX = 60;
/** A column never resizes below this width. */
const MIN_RESIZE_COLUMN_PX = 40;

/** `Array.isArray()`'s negative branch doesn't reliably narrow a `readonly T[]` union member out in TypeScript (a known limitation with readonly arrays, same one `TreeSelectPanelComponent.isSingleNode` already documents) — an explicit type predicate does. */
function isRowArray<T>(value: T | readonly T[]): value is readonly T[] {
  return Array.isArray(value);
}

/**
 * DataTable primitive (Tier 2, the one item deferred since 2026-07-05 in
 * favor of DatePicker — highest-complexity, highest-frequency component,
 * also the one with the largest mapped known-bug backlog). Columns are
 * content children (`<med-table-column field="..." header="...">`, see that
 * file's doc), not a `columns` data-array input — same precedent every
 * composite component in this library already follows.
 *
 * **Deliberate scope cuts for v1**, each one sidestepping a specific mapped
 * bug rather than an arbitrary omission:
 * - No virtual scrolling (avoids #18917 "virtual scroll broken combined with
 *   the table" and #17529 "scroller breaks when scrollHeight is flex and
 *   virtualScroll is active" by not having the feature at all). `SelectPanelComponent`
 *   already shows the `CdkVirtualScrollViewport` technique is available in
 *   this codebase if a later version needs it for very large datasets.
 * - No per-column filter row (avoids #16576 "column filter indicator
 *   disappearing"). Per-column filtering is a funnel menu instead: a column
 *   with `columnFilter` gets a header button that opens a popover with a match
 *   mode select, a value control for its `filterType` and Apply and Clear
 *   buttons. The rules live in the two-way `columnFilters` model, whose state
 *   (not a DOM indicator) drives the funnel's active look, and combine with
 *   the global filter (`filterable`).
 * - No `responsiveLayout="stack"` mode (avoids #16510, a regression in the
 *   original) — instead the table wrapper scrolls horizontally past the
 *   viewport (`overflow-x-auto`), the same M3-aligned pattern
 *   `TabsComponent` already uses for its own overflow.
 * None of these are dead ends — each layers on top of this API without a
 * breaking change if a later version needs it.
 *
 * **Frozen columns** (`frozen`/`alignFrozen` on `TableColumnComponent`) use the same declarative
 * `position: sticky` technique as `TreeTableComponent`: `frozenLayout` derives each frozen cell's `left`/`right` offset
 * from the declared (or resized) pixel widths of the frozen columns before it on that edge, with a 60px minimum for a
 * column without a `px` width, so no layout is measured and nothing recomputes on resize. Any frozen column forces
 * `table-fixed`, otherwise the browser may shrink a column below the width the offsets assume. A left-frozen data
 * column also freezes the reorder, selection and radio columns, which have exact pixel widths so their offsets are exact.
 *
 * **Sorting** cycles a sortable column through
 * `asc → desc → none (unsorted) → asc → ...` on header click, explicitly —
 * the original's own bug list flags "unclear/inconsistent way back to the
 * default (unsorted) state" (#12553) as a real complaint, so this cycle (and
 * `aria-sort`, the real native table ARIA attribute for exactly this) is
 * deliberately the one three-state loop, not an asc/desc toggle with no way
 * back to "unsorted".
 *
 * **Selection**: `selectionMode` picks `selection`'s runtime shape (`single`:
 * `T | null`; `multiple`: `readonly T[]`), same runtime-branching precedent
 * DatePicker/Accordion/SelectButton already established. `single` re-selects
 * via row click with the same "clicking the already-selected one is a
 * no-op" radio semantics Rating/SelectButton/RadioButton share; `multiple`
 * adds a checkbox column, including a header "select all" — which selects
 * every row currently matching the filter/sort (`sortedValue`), not just the
 * current page, since "select all" is a statement about the whole filtered
 * set the user is looking at, not an artifact of where pagination happens to
 * have cut it.
 *
 * The header/row selection checkboxes reuse `checkboxBoxVariants`
 * (Checkbox's own decorative-box CVA) directly against a real native
 * `<input type="checkbox">`, rather than embedding `CheckboxComponent`
 * itself: that component is a `ControlValueAccessor` meant for one
 * `ngModel`/`formControl` binding, awkward to wire per-row across a
 * dynamically-sized `@for` loop — the visual style is shared, the plumbing
 * isn't.
 *
 * **Five opt-in features**, each opt-in and each
 * layered onto the existing shape without touching what a consumer who
 * uses none of them sees:
 *
 * **`loading`** is purely presentational — when `loadingMode` is `'spinner'`
 * (the default), a dimmed table with a centered `ProgressSpinnerComponent`
 * overlay keeps rows in place underneath (avoids layout jank vs. clearing
 * the body outright). Setting `loadingMode="skeleton"` renders `SkeletonComponent`
 * placeholder cells across all visible columns (`rows` rows when `paginator`
 * is enabled, 5 otherwise), sets `aria-busy="true"` on the table, and announces
 * `loadingLabel` through a polite live region.
 *
 * **`sortMode: 'multiple'`** adds `multiSortMeta` (a model, same
 * two-way-bindable shape as the existing single-column `sortField`/
 * `sortOrder`, left completely untouched for `sortMode: 'single'`
 * consumers). Plain click on a header replaces the whole multi-sort with
 * just that column; Shift+click adds/cycles that column within the
 * existing array, keeping the others — the same spreadsheet convention
 * (Excel, Notion, ...) most users already know, so no extra input is
 * needed to configure which modifier key means "add a sort key".
 *
 * **`lazy` + `totalRecords` + `lazyLoad`**: when `lazy` is on, `value()`
 * is reinterpreted as "the current page only, already filtered/sorted by
 * the server" — the client-side `filteredValue`/`sortedValue` computeds
 * become identity passthroughs, and the paginator's total comes from the
 * separate `totalRecords` input instead of `sortedValue().length`. An
 * `effect()` emits `lazyLoad` (first/rows/sortField/sortOrder/
 * multiSortMeta/filter — everything a server-side data source needs)
 * whenever any of those actually change, including once on initial
 * mount. Selection semantics don't need a separate lazy-mode branch:
 * "select all" already only ever operated on `sortedValue()`, which in
 * lazy mode already *is* just the current page.
 *
 * **`editMode`** has two values. A column opts in with `editable` on
 * `TableColumnComponent` plus a second named template
 * (`<ng-template #editTemplate let-row let-onSave="onSave"
 * let-onCancel="onCancel">`, see that file's own doc for why a second
 * template needs an explicit name).
 * - `'cell'` edits one cell at a time. `editTrigger` picks the gesture that starts it: a double
 *   click (default; a plain click already means "select this row" in `selectionMode="single"`) or a
 *   single click, which stops at the cell so it never selects the row. Clicks and keys inside an
 *   edit cell never reach row selection or row keyboard navigation. The consumer's own edit
 *   template decides which events call `onSave(value)`/`onCancel()` — this component only tracks
 *   *which* cell is currently being edited and emits `editComplete`/`editCancel` when told to, the
 *   same "consumer wires the actual input, this just provides the context functions" split
 *   `cellTemplate` already uses for display.
 * - `'row'` adds an actions column with edit, save and cancel buttons (named by `editRowLabel`,
 *   `saveRowLabel`, `cancelRowLabel`; the column header text by `rowActionsHeaderLabel`) and edits
 *   every editable cell of one row together; at most one row is in edit mode. Save emits
 *   `rowEditComplete` with the row and each editable field's value; cancel emits `rowEditCancel`
 *   with the row, and so does starting to edit another row while one is open. Enter saves and
 *   Escape cancels from inside an edit cell.
 *
 * **`exportCSV()`** is a plain public method (called via a template
 * reference variable, `<med-data-table #dt>` /
 * `dt.exportCSV()` — no `exportAs` needed, Angular already lets a
 * template variable reference any component instance directly), not a
 * button this component renders itself — same reasoning Dialog/Toast
 * leave "when to trigger this" entirely to the consumer. Exports
 * `sortedValue()` (every currently filtered/sorted row, all pages — not
 * just the visible page) unless `{ selectionOnly: true }` is passed.
 * Values are escaped per RFC 4180 (quoted, internal quotes doubled) only
 * when they actually contain the separator, a quote, or a newline —
 * unconditionally quoting every field would still be valid CSV but reads
 * as unnecessary noise for the common all-plain-text-cell case.
 *
 * **Six opt-in features**, API
 *.
 *
 * **`rowsPerPageOptions`** forwards straight to `<med-paginator>`, same
 * addition `DataViewComponent` just got — it had grown
 * this input independently of either table consumer actually wiring it
 * through.
 *
 * **`dataKey`** switches selection comparisons (`isSelected`/`toggleRow`/ `allSelected`/select-all)
 * from row *reference* equality to comparing `row[dataKey()]` — the flagged "correction risk, not
 * just a feature" item: reference equality silently breaks selection the moment `value()` is a
 * *new* array of otherwise-equal objects (a re-fetched page, a `lazy` reload, anything that doesn't
 * hand back the exact same object instances), which is precisely the scenario `dataKey` exists to
 * fix. `dataKey` unset (default) keeps today's reference equality byte-for-byte — this is additive,
 * not a silent behavior change for existing consumers.
 *
 * **`globalFilterFields`** narrows which columns `filterable`'s global
 * search scans (default, unset: every declared column, unchanged from
 * before this item). **`filterDelay`** (default `300`
 * own default) debounces committing a keystroke to the actual filter
 * value that drives `filteredValue()` — the `<input>` itself still
 * reflects every keystroke immediately (a separate, undebounced local
 * signal), only the recompute is delayed, avoiding a full re-filter on
 * every single keystroke for a large `value()`.
 *
 * **`rowSelect`/`rowUnselect`/`sort`/`filter`** are richer companions to the existing
 * `selection`/`sortField`+`sortOrder`+`multiSortMeta`/ `globalFilterValue` models — those models
 * already carry the *current state*, but nothing previously exposed the *resulting* sorted/filtered
 * `T[]` itself, forcing a consumer to recompute it themselves from the metadata alone.
 * `rowSelect`/`rowUnselect` fire only on an actual state change (not on the "clicking the
 * already-selected row" no-op `single` mode already documents). Named without an `on` prefix, the
 * library-wide convention every other component follows.
 *
 * **`rowGroupMode: 'subheader'` + `groupRowsBy`** renders a full-width subheader row (optionally
 * templated via `<ng-template #groupHeader let-row>`, default just prints the group value) whenever
 * consecutive rows' `groupRowsBy` field value changes. **`rowGroupMode: 'rowspan'`** instead
 * merges the `groupRowsBy` column's cells vertically across each group's own rows (a `groupSpans`
 * computed gives each displayed row a span or "omit"; groups never cross a page boundary, and an
 * expanded `#rowexpansion` row inside a group extends the span). Setting `groupRowsBy` makes it
 * the primary sort key ahead of `sortField`/`multiSortMeta`, so grouping implies
 * grouping-column-first sort — otherwise same-group rows could scatter across the table and the
 * group boundary detection would fire once per row.
 *
 * **`expandableRowGroups`** (with `rowGroupMode="subheader"`) adds a toggle button to each
 * subheader row, named by `rowGroupToggleLabel`, that collapses or expands the group. The
 * `expandedRowGroups` model holds the group values that are currently collapsed (the default empty
 * list leaves every group expanded), and `rowGroupExpand`/`rowGroupCollapse` emit the group value
 * on each user toggle.
 *
 * **`reorderable`** adds a small drag-handle column (`bars-3`/hamburger icon) and native HTML5
 * drag-and-drop on each row; dropping emits `rowReorder` with `dragIndex`/`dropIndex` — indices
 * into `value()` itself (translated from the displayed row's position via `indexOf`, the same
 * displayed-vs-real-index translation `PickListComponent.realIndexFromFiltered` established this
 * same session), not the sorted/filtered/paged view, since a consumer reordering their own source
 * array needs real positions regardless of how the table currently happens to be displaying it.
 * This component doesn't reorder `value()` itself — `value` is a plain `input()`, not a `model()`,
 * same "consumer owns the data, this primitive only reports positions" split `PickListComponent`'s
 * own drag-and-drop already uses. Dragging while a sort/filter is active still works but is
 * visually confusing (the drop position you see may not match where the row lands once the
 * consumer's reorder is applied and the existing sort/filter re-runs on top of it) — an inherent
 * tension of reordering a sorted/filtered view, not something to solve here.
 *
 * **`reorderableColumns`** lets the user move a column by dragging its header onto another header
 * or, with a header focused, with Alt+ArrowLeft/Right (hidden columns are skipped). The order covers
 * every declared column, hidden ones included, so a hidden column returns to its place when shown.
 * A frozen column only swaps places with a column frozen on the same edge, and a column whose
 * `reorderable` is `false` can neither be dragged nor dropped onto. `colReorder` emits `dragIndex`,
 * `dropIndex` (positions in the full order) and `columns` (the fields in the new order); the table
 * keeps the order itself and does not persist it. Keyboard moves keep focus on the header and
 * announce the new position through a polite live region whose text `columnMoveAnnouncement`
 * builds (English by default). Header and footer group rows are application-written, so the
 * application owns their `colspan` after a move.
 *
 * **Projected slots**: optional `<ng-template #caption>` and
 * `<ng-template #summary>` render inside the outer bordered wrapper above the
 * scroll viewport and below the table (before any paginator), respectively; when
 * omitted, neither wrapper renders. Optional `<ng-template #empty>` replaces
 * `emptyLabel` inside the spanning empty-state `<td>` when there are zero
 * visible rows and `loading` is false.
 */
@Component({
  selector: 'med-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, ReactiveFormsModule, ButtonDirective, DatePickerComponent, IconComponent, InputTextDirective, PaginatorComponent, PopoverComponent, ProgressSpinnerComponent, SelectComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0', '[class.flex]': 'flexHeight()', '[class.flex-col]': 'flexHeight()', '[class.h-full]': 'flexHeight()' },
  template: `
    @if (reorderableColumns()) {
      <span class="sr-only" role="status" aria-live="polite">{{ columnAnnouncement() }}</span>
    }
    @if (isSkeletonLoading()) {
      <span class="sr-only" role="status" aria-live="polite">{{ loadingLabel() }}</span>
    }
    @if (filterable()) {
      <div class="mb-3 flex justify-end">
        <input
          medInputText
          type="search"
          class="max-w-64"
          [placeholder]="filterPlaceholder()"
          [value]="filterInputText()"
          [attr.aria-label]="filterPlaceholder()"
          (input)="onFilterInput($event)"
        />
      </div>
    }
    <ng-template #dataCells let-row let-i="index" let-frozen="frozen" let-span="span">
      @for (col of visibleColumns(); track col.field()) {
        @if (frozen || span !== 0 || col.field() !== spanColumnField()) {
        <td [class]="cellClass(col, row, i)" [style]="frozenStyle(col)" [attr.rowspan]="!frozen && span >= 1 && col.field() === spanColumnField() ? span : null" [attr.data-med-editing]="!frozen && isEditingCell(row, col) ? '' : null" (click)="frozen ? null : onCellClick($event, row, col)" (dblclick)="frozen ? null : onCellDblClick($event, row, col)">
          @if (!frozen && isEditingCell(row, col); as editing) {
            <ng-container
              [ngTemplateOutlet]="col.editTemplate()!"
              [ngTemplateOutletContext]="editContext(row, col)"
            />
          } @else if (col.cellTemplate(); as t) {
            <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: row, rowIndex: i }" />
          } @else {
            {{ cellValue(row, col) }}
          }
        </td>
        }
      }
    </ng-template>
    <ng-template #frozenRow let-row let-i="index">
      <tr [class]="rowClassFor(row, i, false)">
        @if (reorderable()) {
          <td [class]="utilityCellClass('', true) + ' ' + frozenUtilityClass(row, i)" [style]="utilityStyle('reorder')"></td>
        }
        @if (selectionMode() === 'multiple' || selectionMode() === 'radio') {
          <td [class]="utilityCellClass('') + ' ' + frozenUtilityClass(row, i)" [style]="utilityStyle('selection')"></td>
        }
        <ng-container [ngTemplateOutlet]="dataCells" [ngTemplateOutletContext]="{ $implicit: row, index: i, frozen: true }" />
        @if (editMode() === 'row') {
          <td [class]="utilityCellClass('')"></td>
        }
      </tr>
    </ng-template>
    <div [class]="wrapperClass()">
      @if (captionTemplate(); as capTpl) {
        <div data-med-caption class="border-b border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium text-surface-900 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-100">
          <ng-container [ngTemplateOutlet]="capTpl" />
        </div>
      }
      <div data-med-scroll-viewport class="relative w-full overflow-x-auto" [class.min-h-0]="flexHeight()" [class.flex-1]="flexHeight()" [class.overflow-y-auto]="scrollable()" [style.maxHeight]="scrollable() && !flexHeight() ? scrollHeight() : null">
        @if (isSpinnerLoading()) {
          <div class="absolute inset-0 z-10 flex items-center justify-center bg-surface-0/60 dark:bg-surface-800/60">
            <med-progress-spinner [ariaLabel]="loadingLabel()" />
          </div>
        }
        <table [class]="tableClass()" [style.width.px]="tableWidthPx()" [class.table-fixed]="resizableColumns() || hasFrozenColumn()" [class.opacity-50]="isSpinnerLoading()" [attr.aria-busy]="isSkeletonLoading() ? 'true' : null" [attr.aria-label]="ariaLabel()">
        <thead #tableHead [class]="scrollable() ? 'sticky top-0 z-10 bg-surface-50 dark:bg-surface-800' : ''">
          @if (headerGroupTemplate(); as hg) {
            <ng-container [ngTemplateOutlet]="hg" />
          }
          <tr class="border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50">
            @if (reorderable()) {
              <th [class]="utilityCellClass('', true) + ' ' + frozenUtilityClass(null)" [style]="utilityStyle('reorder')"></th>
            }
            @if (selectionMode() === 'multiple') {
              <th [class]="utilityCellClass('') + ' ' + frozenUtilityClass(null)" [style]="utilityStyle('selection')">
                <span class="relative inline-flex">
                  <input
                    type="checkbox"
                    class="peer absolute inset-0 size-full cursor-pointer opacity-0"
                    [checked]="allSelected()"
                    [indeterminate]="someSelected()"
                    [attr.aria-label]="selectAllLabel()"
                    (change)="toggleSelectAll()"
                  />
                  <span [class]="checkboxBoxClass" aria-hidden="true">
                    @if (someSelected()) {
                      <med-icon name="minus" variant="solid" class="size-3" />
                    } @else if (allSelected()) {
                      <med-icon name="check" variant="solid" class="size-3" />
                    }
                  </span>
                </span>
              </th>
            }
            @if (selectionMode() === 'radio') {
              <th [class]="utilityCellClass('') + ' ' + frozenUtilityClass(null)" [style]="utilityStyle('selection')"></th>
            }
            @for (col of visibleColumns(); track col.field()) {
              <th
                scope="col"
                [style.width]="columnWidth(col)"
                [style]="frozenStyle(col)"
                [class]="headerCellClass(col)"
                [class.relative]="resizableColumns()"
                [attr.aria-sort]="ariaSortFor(col)"
                [attr.tabindex]="col.sortable() || isColumnDraggable(col) ? 0 : null"
                [attr.draggable]="isColumnDraggable(col) ? 'true' : null"
                (dragstart)="onColDragStart($event, col)"
                (dragover)="onColDragOver($event, col)"
                (dragleave)="onColDragLeave(col)"
                (drop)="onColDrop($event, col)"
                (dragend)="onColDragEnd()"
                (click)="onHeaderClick(col, $event)"
                (keydown)="onHeaderKeydown($event, col)"
              >
                <span class="inline-flex items-center gap-1">
                  {{ col.header() }}
                  @if (col.sortable()) {
                    <med-icon name="chevron-down" variant="mini" [class]="sortIconClass(col)" />
                    @if (multiSortPriority(col); as priority) {
                      <sup class="text-[0.6rem] font-semibold text-surface-500 dark:text-surface-400">{{ priority }}</sup>
                    }
                  }
                  @if (col.columnFilter()) {
                    <button
                      #funnelButton
                      type="button"
                      [class]="funnelButtonClass(col)"
                      [attr.aria-label]="columnFilterLabel()(col.header())"
                      aria-haspopup="dialog"
                      [attr.aria-expanded]="openFilterField() === col.field()"
                      (click)="$event.stopPropagation(); filterPopover.toggle(funnelButton)"
                      (keydown)="$event.stopPropagation()"
                    >
                      <med-icon name="funnel" [variant]="isColumnFilterActive(col) ? 'solid' : 'mini'" class="size-3.5" />
                    </button>
                    <med-popover #filterPopover [ariaLabel]="columnFilterLabel()(col.header())" (shown)="onFilterMenuShown(col)" (hidden)="onFilterMenuHidden(funnelButton)">
                      @if (filterDraft(); as draft) {
                        @if (draft.field === col.field()) {
                          <div class="flex w-64 flex-col gap-3 text-left font-normal normal-case">
                            @if (filterModeOptions(col); as modeOptions) {
                              @if (modeOptions.length > 1) {
                                <med-select fluid [options]="modeOptions" [ariaLabel]="filterMatchModeLabel()" [formControl]="filterModeControl" />
                              }
                            }
                            @switch (col.filterType()) {
                              @case ('numeric') {
                                <input type="number" medInputText [attr.aria-label]="columnFilterLabel()(col.header())" [value]="draft.value ?? ''" (input)="onFilterNumberInput($event)" (keydown.enter)="$event.preventDefault(); applyColumnFilter(col, filterPopover)" />
                              }
                              @case ('date') {
                                <med-date-picker [formControl]="filterDateControl" />
                              }
                              @default {
                                <input type="text" medInputText [attr.aria-label]="columnFilterLabel()(col.header())" [value]="draft.value ?? ''" (input)="onFilterTextInput($event)" (keydown.enter)="$event.preventDefault(); applyColumnFilter(col, filterPopover)" />
                              }
                            }
                            <div class="flex justify-end gap-2">
                              <button medButton type="button" variant="outlined" severity="secondary" size="sm" (click)="clearColumnFilter(col, filterPopover)">{{ clearFilterLabel() }}</button>
                              <button medButton type="button" size="sm" (click)="applyColumnFilter(col, filterPopover)">{{ applyFilterLabel() }}</button>
                            </div>
                          </div>
                        }
                      }
                    </med-popover>
                  }
                </span>
                @if (resizableColumns() && hasResizeHandle(col)) {
                  <span
                    data-col-resize-handle="true"
                    class="absolute inset-y-0 right-0 w-1.5 cursor-col-resize touch-none select-none hover:bg-brand-400/50"
                    aria-hidden="true"
                    (click)="$event.stopPropagation()"
                    (pointerdown)="onColResizeStart($event, col)"
                    (pointermove)="onColResizeMove($event)"
                    (pointerup)="onColResizeEnd()"
                    (pointercancel)="onColResizeEnd()"
                  ></span>
                }
              </th>
            }
            @if (editMode() === 'row') {
              <th scope="col" [class]="utilityCellClass('')"><span class="sr-only">{{ rowActionsHeaderLabel() }}</span></th>
            }
          </tr>
        </thead>
        @if (frozenRowsPosition() === 'top' && frozenRows().length) {
          <tbody [class]="scrollable() ? 'sticky z-[5] bg-surface-0 dark:bg-surface-800' : ''" [style.top.px]="scrollable() ? headerHeight() : null">
            @for (row of frozenRows(); track $index; let i = $index) {
              <ng-container [ngTemplateOutlet]="frozenRow" [ngTemplateOutletContext]="{ $implicit: row, index: i }" />
            }
          </tbody>
        }
        <tbody>
          @if (isSkeletonLoading()) {
            @for (_ of skeletonRows(); track $index) {
              <tr class="border-b border-surface-200 last:border-b-0 dark:border-surface-700">
                @if (reorderable()) {
                  <td [class]="skeletonUtilityCellClass(true)" [style]="utilityStyle('reorder')"><med-skeleton height="1rem" /></td>
                }
                @if (selectionMode() === 'multiple' || selectionMode() === 'radio') {
                  <td [class]="skeletonUtilityCellClass()" [style]="utilityStyle('selection')"><med-skeleton height="1rem" /></td>
                }
                @for (col of visibleColumns(); track col.field()) {
                  <td [class]="skeletonCellClass(col)" [style]="frozenStyle(col)"><med-skeleton height="1rem" /></td>
                }
                @if (editMode() === 'row') {
                  <td [class]="utilityCellClass('')"><med-skeleton height="1rem" /></td>
                }
              </tr>
            }
          } @else {
          @for (row of pagedValue(); track rowTrackBy()(row, $index); let i = $index) {
            @if (isGroupStart(row, i)) {
              <tr class="border-b border-surface-200 bg-surface-50 font-semibold dark:border-surface-700 dark:bg-surface-800/50">
                <td [attr.colspan]="totalColumnCount()" [class]="groupCellClass()">
                  @if (isRowGroupToggleable()) {
                    <button
                      type="button"
                      class="mr-2 inline-flex size-6 items-center justify-center rounded align-middle text-surface-600 hover:bg-surface-200 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-surface-300 dark:hover:bg-surface-700"
                      [attr.aria-expanded]="!isGroupCollapsed(row)"
                      [attr.aria-label]="rowGroupToggleLabel()(groupValue(row), !isGroupCollapsed(row))"
                      (click)="toggleRowGroup(row)"
                      (keydown.enter)="$event.preventDefault(); toggleRowGroup(row)"
                    >
                      <med-icon [name]="isGroupCollapsed(row) ? 'chevron-right' : 'chevron-down'" variant="mini" class="size-4" />
                    </button>
                  }
                  @if (groupHeaderTemplate(); as t) {
                    <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: row }" />
                  } @else {
                    {{ groupValue(row) }}
                  }
                </td>
              </tr>
            }
            @if (!isRowHiddenByGroup(row)) {
            <tr
              [class]="rowClassFor(row, i)"
              [attr.aria-selected]="selectionMode() ? isSelected(row) : null"
              [attr.tabindex]="selectionMode() ? 0 : null"
              [draggable]="reorderable()"
              (click)="onRowClick(row)"
              (keydown)="onRowKeydown($event, row)"
              (dragstart)="onRowDragStart(i)"
              (dragover)="onRowDragOver($event)"
              (drop)="onRowDrop(i)"
            >
              @if (reorderable()) {
                <td [class]="utilityCellClass('cursor-move text-surface-400 dark:text-surface-500', true) + ' ' + frozenUtilityClass(row, i)" [style]="utilityStyle('reorder')" (click)="$event.stopPropagation()">
                  <med-icon name="bars-3" variant="mini" class="size-4" />
                </td>
              }
              @if (selectionMode() === 'multiple') {
                <td [class]="utilityCellClass('') + ' ' + frozenUtilityClass(row, i)" [style]="utilityStyle('selection')">
                  <span class="relative inline-flex">
                    <input
                      type="checkbox"
                      class="peer absolute inset-0 size-full cursor-pointer opacity-0"
                      [checked]="isSelected(row)"
                      [attr.aria-label]="rowAriaLabel()?.(row) ?? 'Select row'"
                      (click)="$event.stopPropagation()"
                      (change)="toggleRow(row)"
                    />
                    <span [class]="checkboxBoxClass" aria-hidden="true">
                      @if (isSelected(row)) {
                        <med-icon name="check" variant="solid" class="size-3" />
                      }
                    </span>
                  </span>
                </td>
              }
              @if (selectionMode() === 'radio') {
                <td [class]="utilityCellClass('') + ' ' + frozenUtilityClass(row, i)" [style]="utilityStyle('selection')">
                  <span class="relative inline-flex">
                    <input
                      type="radio"
                      class="peer absolute inset-0 size-full cursor-pointer opacity-0"
                      [name]="radioGroupName"
                      [checked]="isSelected(row)"
                      [attr.aria-label]="rowAriaLabel()?.(row) ?? 'Select row'"
                      (click)="$event.stopPropagation()"
                      (change)="selectSingle(row)"
                    />
                    <span [class]="radioRingClass" aria-hidden="true">
                      @if (isSelected(row)) {
                        <span [class]="radioDotClass"></span>
                      }
                    </span>
                  </span>
                </td>
              }
              <ng-container [ngTemplateOutlet]="dataCells" [ngTemplateOutletContext]="{ $implicit: row, index: i, span: groupSpans()[i] ?? 1 }" />
              @if (editMode() === 'row') {
                <td [class]="utilityCellClass('whitespace-nowrap')" (click)="$event.stopPropagation()">
                  @if (editingRow() === row) {
                    <button type="button" [class]="rowActionButtonClass" [attr.aria-label]="saveRowLabel()" (click)="saveRowEdit()">
                      <med-icon name="check" variant="mini" class="size-4" />
                    </button>
                    <button type="button" [class]="rowActionButtonClass" [attr.aria-label]="cancelRowLabel()" (click)="cancelRowEdit()">
                      <med-icon name="x-mark" variant="mini" class="size-4" />
                    </button>
                  } @else {
                    <button type="button" [class]="rowActionButtonClass" [attr.aria-label]="editRowLabel()" (click)="startRowEdit(row)">
                      <med-icon name="pencil-square" variant="mini" class="size-4" />
                    </button>
                  }
                </td>
              }
            </tr>
            @if (expansionRowsRender() && isRowExpanded(row, i) && rowExpansionTemplate(); as expTpl) {
              <tr class="border-b border-surface-200 bg-surface-50/40 dark:border-surface-700 dark:bg-surface-800/30">
                @if (expansionLayout(); as layout) {
                  @if (layout.lead > 0) {
                    <td [attr.colspan]="layout.lead" [class]="expansionCellClass()">
                      @if (layout.lead >= layout.trail) {
                        <ng-container [ngTemplateOutlet]="expTpl" [ngTemplateOutletContext]="{ $implicit: row, rowIndex: i }" />
                      }
                    </td>
                  }
                  @if (layout.trail > 0) {
                    <td [attr.colspan]="layout.trail" [class]="expansionCellClass()">
                      @if (layout.lead < layout.trail) {
                        <ng-container [ngTemplateOutlet]="expTpl" [ngTemplateOutletContext]="{ $implicit: row, rowIndex: i }" />
                      }
                    </td>
                  }
                } @else {
                  <td [attr.colspan]="totalColumnCount()" [class]="expansionCellClass()">
                    <ng-container [ngTemplateOutlet]="expTpl" [ngTemplateOutletContext]="{ $implicit: row, rowIndex: i }" />
                  </td>
                }
              </tr>
            }
            }
          } @empty {
            <tr>
              <td [attr.colspan]="totalColumnCount()" class="px-3 py-8 text-center text-surface-500 dark:text-surface-400">
                @if (emptyTemplate(); as empTpl) {
                  <ng-container [ngTemplateOutlet]="empTpl" />
                } @else {
                  {{ emptyLabel() }}
                }
              </td>
            </tr>
          }
          }
        </tbody>
        @if (frozenRowsPosition() === 'bottom' && frozenRows().length) {
          <tbody [class]="scrollable() ? 'sticky bottom-0 z-[5] bg-surface-0 dark:bg-surface-800' : ''">
            @for (row of frozenRows(); track $index; let i = $index) {
              <ng-container [ngTemplateOutlet]="frozenRow" [ngTemplateOutletContext]="{ $implicit: row, index: i }" />
            }
          </tbody>
        }
        @if (footerGroupTemplate(); as fg) {
          <tfoot [class]="'border-t border-surface-200 bg-surface-50 text-surface-700 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-200' + (scrollable() ? ' sticky bottom-0 z-10' : '')">
            <ng-container [ngTemplateOutlet]="fg" />
          </tfoot>
        }
      </table>
      </div>
      @if (summaryTemplate(); as sumTpl) {
        <div data-med-summary class="border-t border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-700 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-200">
          <ng-container [ngTemplateOutlet]="sumTpl" />
        </div>
      }
    </div>
    @if (paginator() && effectiveTotalRecords() > 0) {
      <med-paginator class="mt-3 block" [totalRecords]="effectiveTotalRecords()" [(rows)]="pageSize" [rowsPerPageOptions]="rowsPerPageOptions()" [(first)]="first" />
    }
  `,
})
export class DataTableComponent<T> {
  readonly value = input<readonly T[]>([]);
  readonly selectionMode = input<TableSelectionMode>(null);
  /** Cell padding and text size: `sm`, `default` or `lg`. */
  readonly size = input<TableSize>('default');
  /** Draws borders between cells. */
  readonly showGridlines = input(false, { transform: booleanAttribute });
  /** Gives alternate body rows a different background. */
  readonly stripedRows = input(false, { transform: booleanAttribute });
  readonly selection = model<T | readonly T[] | null>(null);
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly rows = input(10, { transform: numberAttribute });
  /** The page size in effect: follows `rows()`, and the paginator's "rows per page" select writes to it, so the visible slice and `lazyLoad` follow the user's choice. */
  protected readonly pageSize = linkedSignal(() => this.rows());
  readonly rowsPerPageOptions = input<readonly number[] | null>(null);
  readonly first = model(0);
  /** Row identity key for selection comparisons — see class doc's "dataKey" section. Unset (default): reference equality, unchanged from before this input existed. */
  readonly dataKey = input<string | null>(null);
  readonly sortField = model<string | null>(null);
  readonly sortOrder = model<TableSortOrder>(null);
  /** When `false`, a sorted column only alternates between ascending and descending instead of returning to unsorted on the third click. Ignored in `sortMode="multiple"`. */
  readonly removableSort = input(true, { transform: booleanAttribute });
  /** `'multiple'` layers `multiSortMeta` on top — `sortField`/`sortOrder` stay exactly as-is for `'single'` consumers. */
  readonly sortMode = input<TableSortMode>('single');
  readonly multiSortMeta = model<readonly TableSortMeta[]>([]);
  /** Shows the global search box above the table. Its text combines with the per-column rules in `columnFilters`: a row is shown only when it passes both. */
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly globalFilterValue = model('');
  /**
   * Active column filter rules keyed by column `field` (two-way). A rule filters its column's rows after the global text
   * filter; a rule for a field no column declares is kept and ignored. With `lazy` it is not applied client-side.
   */
  readonly columnFilters = model<TableColumnFilters>({});
  /** Accessible name of a column's filter funnel button, from the column header. Default: `Filter {header}`. */
  readonly columnFilterLabel = input<(header: string) => string>((header) => `Filter ${header}`);
  /** Text of the filter menu's button that commits the rule. Default: `Apply`. */
  readonly applyFilterLabel = input('Apply');
  /** Text of the filter menu's button that removes the column's rule. Default: `Clear`. */
  readonly clearFilterLabel = input('Clear');
  /** Accessible name of the filter menu's match mode select. Default: `Match mode`. */
  readonly filterMatchModeLabel = input('Match mode');
  /** Overrides the English names of the match modes shown in the filter menu; modes left out keep their default name. */
  readonly matchModeLabels = input<Partial<Record<TableFilterMatchMode, string>>>({});
  /** Narrows which columns `filterable`'s global search scans — unset (default): every declared column, same as before this input existed. Per-column rules (`columnFilter`) are not affected by it. */
  readonly globalFilterFields = input<readonly string[] | null>(null);
  /** Debounces committing a keystroke to `globalFilterValue` (and therefore to `filteredValue()`) — the `<input>` itself still reflects every keystroke immediately, see class doc. */
  readonly filterDelay = input(300, { transform: numberAttribute });
  /** Presentational only — dims the table and overlays a spinner, or renders skeleton rows when `loadingMode` is `'skeleton'`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Controls how `loading` is displayed: `'spinner'` (default overlay) or `'skeleton'` (placeholder rows). */
  readonly loadingMode = input<TableLoadingMode>('spinner');
  protected readonly isSpinnerLoading = computed(() => this.loading() && this.loadingMode() === 'spinner');
  protected readonly isSkeletonLoading = computed(() => this.loading() && this.loadingMode() === 'skeleton');
  protected readonly skeletonRows = computed(() => Array.from({ length: this.paginator() ? Math.max(1, this.pageSize()) : 5 }, (_, i) => i));
  /** Reinterprets `value()` as "current page only, already filtered/sorted server-side" — see class doc's "lazy" section. */
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly totalRecords = input<number | null>(null);
  /** `'cell'` edits one cell at a time; `'row'` adds an actions column and edits every editable cell of a row together. */
  readonly editMode = input<'cell' | 'row' | null>(null);
  /** With `editMode="cell"`, the gesture that starts editing a cell: a double click (default) or a single click. */
  readonly editTrigger = input<'dblclick' | 'click'>('dblclick');
  /** `'subheader'` renders a full-width subheader row per group; `'rowspan'` merges each group's cells in the `groupRowsBy` column. */
  readonly rowGroupMode = input<'subheader' | 'rowspan' | null>(null);
  /** With `rowGroupMode="subheader"`, adds a toggle button to each subheader row that collapses or expands the group. */
  readonly expandableRowGroups = input(false, { transform: booleanAttribute });
  /** Group values that are currently collapsed; the default empty list means every group is expanded. */
  readonly expandedRowGroups = model<readonly string[]>([]);
  /** Accessible name of the edit button in the actions column of `editMode="row"`. */
  readonly editRowLabel = input('Edit row');
  /** Accessible name of the save button in the actions column of `editMode="row"`. */
  readonly saveRowLabel = input('Save row');
  /** Accessible name of the cancel button in the actions column of `editMode="row"`. */
  readonly cancelRowLabel = input('Cancel editing');
  /** Screen-reader-only header text of the actions column of `editMode="row"`. */
  readonly rowActionsHeaderLabel = input('Row actions');
  /** Builds the accessible name of a group toggle button from the group value and whether the group is expanded. */
  readonly rowGroupToggleLabel = input<(group: string, expanded: boolean) => string>((group, expanded) => (expanded ? `Collapse group ${group}` : `Expand group ${group}`));
  /** The row field whose consecutive equal values form a group for `rowGroupMode`; it also becomes the primary sort key. */
  readonly groupRowsBy = input<string | null>(null);
  readonly reorderable = input(false, { transform: booleanAttribute });
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  /** Lets the user move columns by dragging a header onto another or with Alt+ArrowLeft/Right on a focused header; each column opts out with `reorderable` false. */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  /** Builds the live-region text announced after a keyboard move; `position` counts visible columns. Override it to translate the message. */
  readonly columnMoveAnnouncement = input<(header: string, position: number, total: number) => string>((header, position, total) => `${header} moved to position ${position} of ${total}`);
  /**
   * How `resizableColumns` resizes: `fit` (default) keeps the table width and trades width between the dragged column and
   * the next visible column, so the last visible column has no handle; `expand` changes only the dragged column and the table
   * width by the same amount, so the wrapper scrolls horizontally once the table outgrows it.
   */
  readonly columnResizeMode = input<'fit' | 'expand'>('fit');
  readonly scrollable = input(false, { transform: booleanAttribute });
  /** Rows pinned next to the body: they use the same column templates but ignore sorting, the global filter and pagination, and cannot be selected. */
  readonly frozenValue = input<readonly T[] | null>(null);
  /** Where the `frozenValue` rows sit: directly under the header (`top`) or after the rows from `value` (`bottom`). */
  readonly frozenRowsPosition = input<'top' | 'bottom'>('top');
  protected readonly frozenRows = computed(() => this.frozenValue() ?? []);
  private readonly tableHead = viewChild<ElementRef<HTMLElement>>('tableHead');
  /** Height of the sticky `<thead>`, which is where top frozen rows stick; measured in the browser only, so server rendering never touches `ResizeObserver`. */
  protected readonly headerHeight = signal(0);
  readonly scrollHeight = input<string | null>(null);
  readonly stateKey = input<string | null>(null);
  readonly stateStorage = input<'session' | 'local'>('session');
  readonly expandedRowKeys = model<Record<string, boolean>>({});
  readonly csvSeparator = input(',');
  readonly exportFilename = input('export');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly filterPlaceholder = input('Search');
  readonly emptyLabel = input('No results found');
  readonly selectAllLabel = input('Select all rows');
  readonly loadingLabel = input('Loading');
  readonly ariaLabel = input<string | null>(null);
  readonly rowTrackBy = input<(row: T, index: number) => unknown>((_row, index) => index);
  readonly rowClass = input<((row: T) => string) | null>(null);
  readonly rowAriaLabel = input<((row: T) => string) | null>(null);
  readonly class = input('', { alias: 'class' });

  readonly lazyLoad = output<TableLazyLoadEvent>();
  readonly editComplete = output<{ readonly row: T; readonly field: string; readonly value: unknown }>();
  readonly editCancel = output<{ readonly row: T; readonly field: string }>();
  /** Emitted when a row is saved in `editMode="row"`, with the row and the value of each editable field. */
  readonly rowEditComplete = output<TableRowEditEvent<T>>();
  /** Emitted when row editing is cancelled, including when another row starts editing. */
  readonly rowEditCancel = output<T>();
  /** Emitted with the group value when the user expands a collapsed group. */
  readonly rowGroupExpand = output<string>();
  /** Emitted with the group value when the user collapses a group. */
  readonly rowGroupCollapse = output<string>();
  readonly rowSelect = output<T>();
  readonly rowUnselect = output<T>();
  readonly sort = output<{ readonly field: string | null; readonly order: TableSortOrder; readonly multiSortMeta: readonly TableSortMeta[]; readonly data: readonly T[] }>();
  readonly filter = output<{ readonly value: string; readonly data: readonly T[] }>();
  readonly rowReorder = output<TableRowReorderEvent>();
  /** Emitted when the user moves a column; indices are positions in the full column order, hidden columns included. */
  readonly colReorder = output<TableColumnReorderEvent>();
  readonly rowExpand = output<T>();
  readonly rowCollapse = output<T>();
  readonly colResize = output<{ readonly element: HTMLElement; readonly delta: number }>();

  protected readonly columns = contentChildren(TableColumnComponent);
  /** Field names in the user's column order; empty until the first move, and columns it does not list keep their declaration order after the listed ones. */
  protected readonly columnOrder = signal<readonly string[]>([]);
  /** Every declared column (hidden ones included) in the user's order, so a hidden column keeps its place and returns to it when shown. */
  protected readonly orderedColumns = computed(() => {
    const cols = this.columns();
    const order = this.columnOrder();
    if (order.length === 0) {
      return cols;
    }
    const rank = new Map(order.map((field, index) => [field, index]));
    return [...cols].sort((a, b) => (rank.get(a.field()) ?? order.length) - (rank.get(b.field()) ?? order.length));
  });
  /** The columns with `visible` on, in declaration order: what renders, spans, freezes and exports. Sorting and the default global-filter fields keep reading `columns()`, so a hidden column keeps its state. */
  protected readonly visibleColumns = computed(() => this.orderedColumns().filter((col) => col.visible()));
  /** Application-written `<tr>` rows rendered in `<thead>` above the column header row. */
  protected readonly headerGroupTemplate = contentChild('headerGroup', { read: TemplateRef });
  /** Application-written `<tr>` rows rendered in a `<tfoot>` after the body; no footer renders without it. */
  protected readonly footerGroupTemplate = contentChild('footerGroup', { read: TemplateRef });
  protected readonly groupHeaderTemplate = contentChild('groupHeader', { read: TemplateRef });
  protected readonly rowExpansionTemplate = contentChild('rowexpansion', { read: TemplateRef });
  /** Optional `#caption` template rendered above the table header inside the bordered container. */
  protected readonly captionTemplate = contentChild('caption', { read: TemplateRef });
  /** Optional `#summary` template rendered below the table and above the paginator inside the bordered container. */
  protected readonly summaryTemplate = contentChild('summary', { read: TemplateRef });
  /** Optional `#empty` template rendered inside the empty-state cell instead of `emptyLabel`. */
  protected readonly emptyTemplate = contentChild('empty', { read: TemplateRef });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly checkboxBoxClass = checkboxBoxVariants({ size: 'sm' });
  protected readonly radioRingClass = radioRingVariants({ size: 'sm' });
  protected readonly radioDotClass = `${DOT_SIZE_CLASS.sm} rounded-full bg-brand-500 dark:bg-brand-400`;
  /** Shared `name` of the row radios, unique per table instance so two tables on a page keep independent groups. */
  protected readonly radioGroupName = `med-data-table-radio-${nextRadioGroupId++}`;
  /** `scrollable` with `scrollHeight="flex"`: the wrapper fills the height of its parent instead of capping at a fixed length. */
  protected readonly flexHeight = computed(() => this.scrollable() && this.scrollHeight() === 'flex');
  protected readonly wrapperClass = computed(() =>
    mergeClasses('relative w-full overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700', this.flexHeight() ? 'flex min-h-0 flex-1 flex-col' : '', this.class()),
  );

  private readonly editingCell = signal<{ row: T; field: string } | null>(null);
  /** The row in edit mode with `editMode="row"`; at most one row at a time. */
  protected readonly editingRow = signal<T | null>(null);
  /** Values the edit templates of the row being edited have reported through `onChange` or `onSave`, keyed by field. */
  private rowDraft: Record<string, unknown> = {};
  private readonly resizedColumnWidths = signal<ReadonlyMap<string, number>>(new Map());
  /** Inline width of the table in `expand` mode (start width plus the applied delta); `null` keeps the table at its natural `w-full`. */
  protected readonly tableWidthPx = signal<number | null>(null);
  private colResizeState: {
    field: string;
    startX: number;
    startWidth: number;
    element: HTMLElement;
    /** The next visible column's field and start width, in `fit` mode only. */
    neighbour: { field: string; startWidth: number } | null;
    tableStartWidth: number;
  } | null = null;
  private readonly browserReady = signal(false);
  private readonly restoredKey = signal<string | null>(null);
  /** Undebounced — bound directly to the `<input>` so every keystroke is visible immediately; `filterDelay` only delays writing into `globalFilterValue`, see class doc. */
  protected readonly filterInputText = signal('');
  private filterDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private draggedRowIndex: number | null = null;

  private observeHeaderHeight(): void {
    const head = this.tableHead()?.nativeElement;
    if (!head || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => this.headerHeight.set(head.getBoundingClientRect().height));
    observer.observe(head);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  constructor() {
    this.filterModeControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((mode) => this.setFilterDraftMode(mode));
    this.filterDateControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((date) => this.setFilterDraftValue(date));
    // Restoring only after the first render keeps the first client render identical to the server-rendered markup. Restoring
    // earlier changes the state before hydration reconciles the DOM, and the class bindings then leave stale server classes behind
    // (for example two "current page" buttons in the paginator).
    afterNextRender(() => {
      this.browserReady.set(true);
      this.observeHeaderHeight();
    });

    effect(() => {
      const key = this.stateKey();
      if (!this.browserReady() || !key || untracked(this.restoredKey) === key) {
        return;
      }
      this.restoreTableState(key);
      this.restoredKey.set(key);
    });

    effect(() => {
      const key = this.stateKey();
      const first = this.first();
      const sortField = this.sortField();
      const sortOrder = this.sortOrder();
      const expandedRowKeys = this.expandedRowKeys();
      const columnFilters = this.columnFilters();
      // Never persist before the stored state was restored, or the initial defaults would overwrite it.
      if (!key || this.restoredKey() !== key) {
        return;
      }
      this.persistTableState(key, { first, sortField, sortOrder, expandedRowKeys, columnFilters });
    });

    effect(() => {
      if (!this.lazy()) {
        return;
      }
      // Reads every signal a lazy data source needs to react to — this is
      // the whole point of the effect, not a stray dependency.
      this.lazyLoad.emit({
        first: this.first(),
        rows: this.pageSize(),
        sortField: this.sortField(),
        sortOrder: this.sortOrder(),
        multiSortMeta: this.multiSortMeta(),
        filter: this.globalFilterValue(),
        columnFilters: this.columnFilters(),
      });
    });

    // Keeps the (undebounced) visible input in sync with an external
    // programmatic reset of `globalFilterValue` (e.g. a "Clear filters"
    // button outside this component) — a no-op for keystrokes typed
    // through `onFilterInput` itself, since that already set both signals
    // to the same value before this effect re-runs.
    effect(() => {
      const external = this.globalFilterValue();
      untracked(() => {
        if (this.filterInputText() !== external) {
          this.filterInputText.set(external);
        }
      });
    });

    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      if (this.filterDebounceHandle !== null) {
        clearTimeout(this.filterDebounceHandle);
      }
    });
  }

  /** `lazy()`: `value()` is already filtered server-side, so this becomes an identity passthrough — see class doc's "lazy" section. `globalFilterFields()`, when set, narrows which fields are scanned — unset (default): every declared column, same as before that input existed. */
  protected readonly filteredValue = computed(() => {
    if (this.lazy()) {
      return this.value();
    }
    let rows = this.value();
    const query = this.globalFilterValue().trim().toLowerCase();
    if (query) {
      const fields = this.globalFilterFields() ?? this.columns().map((col) => col.field());
      rows = rows.filter((row) => fields.some((field) => this.rowFieldValue(row, field).toLowerCase().includes(query)));
    }
    const rules = this.columnFilters();
    for (const col of this.columns()) {
      const rule = rules[col.field()];
      if (!isRuleActive(rule)) continue;
      const field = col.field();
      const type = col.filterType();
      rows = rows.filter((row) => matchesColumnFilter((row as Record<string, unknown>)[field], rule, type));
    }
    return rows;
  });

  private rowFieldValue(row: T, field: string): string {
    const raw = (row as Record<string, unknown>)[field];
    return raw === null || raw === undefined ? '' : String(raw);
  }

  private compareRows(a: T, b: T, field: string, order: TableSortOrder): number {
    const av = (a as Record<string, unknown>)[field] as string | number | null | undefined;
    const bv = (b as Record<string, unknown>)[field] as string | number | null | undefined;
    const cmp = av === bv ? 0 : av === null || av === undefined ? 1 : bv === null || bv === undefined ? -1 : av < bv ? -1 : 1;
    return order === 'asc' ? cmp : -cmp;
  }

  /** `rowGroupMode() === 'subheader'`: `groupRowsBy()` becomes the primary sort key ahead of anything else — otherwise same-group rows could scatter and the subheader boundary would fire once per row, see class doc's "rowGroupMode" section. */
  private readonly effectiveGroupField = computed(() => (this.rowGroupMode() ? this.groupRowsBy() : null));

  /** The visible column row-span grouping merges: `rowGroupMode() === 'rowspan'` and `groupRowsBy()` naming a visible column's field, otherwise `null` and nothing merges. */
  protected readonly spanColumnField = computed(() => {
    const field = this.groupRowsBy();
    if (this.rowGroupMode() !== 'rowspan' || !field) {
      return null;
    }
    return this.visibleColumns().some((col) => col.field() === field) ? field : null;
  });

  /**
   * Row-span grouping: one entry per displayed row. The first row of a run of consecutive rows sharing the `groupRowsBy` value gets the run length plus the expanded `#rowexpansion` rows inside it; the other rows of the run get `0` (their grouped cell is omitted). Empty when nothing merges. Computed per displayed page, so a run never crosses a page boundary.
   */
  protected readonly groupSpans = computed<readonly number[]>(() => {
    const field = this.spanColumnField();
    if (!field) {
      return [];
    }
    const rows = this.pagedValue();
    const hasExpansion = !!this.rowExpansionTemplate() && this.expansionRowsRender();
    const spans: number[] = [];
    let runStart = -1;
    rows.forEach((row, i) => {
      const startsRun = i === 0 || this.rowFieldValue(rows[i - 1], field) !== this.rowFieldValue(row, field);
      if (startsRun) {
        runStart = i;
        spans.push(0);
      } else {
        spans.push(0);
      }
      spans[runStart] += 1 + (hasExpansion && this.isRowExpanded(row, i) ? 1 : 0);
    });
    return spans;
  });

  /**
   * Row-span grouping: the expansion row cannot cross the merged cell's slot, so it is split into a leading and a trailing
   * cell around the merged column. `null` when no column is merged (one full-width cell). The wider side holds the expansion template.
   */
  protected readonly expansionLayout = computed<{ lead: number; trail: number } | null>(() => {
    const field = this.spanColumnField();
    if (!field) {
      return null;
    }
    const cols = this.visibleColumns();
    const idx = cols.findIndex((col) => col.field() === field);
    const utilityBefore = (this.reorderable() ? 1 : 0) + (this.selectionMode() === 'multiple' || this.selectionMode() === 'radio' ? 1 : 0);
    return { lead: utilityBefore + idx, trail: cols.length - idx - 1 + (this.editMode() === 'row' ? 1 : 0) };
  });

  /** `false` when row-span grouping leaves the expansion row no column to render in (the merged column is the only one): the row is skipped and does not count toward a rowspan. */
  protected readonly expansionRowsRender = computed(() => {
    const layout = this.expansionLayout();
    return !layout || layout.lead + layout.trail > 0;
  });

  /** `lazy()`: `value()` is already sorted server-side, identity passthrough same as `filteredValue`. `sortMode() === 'multiple'`: each `multiSortMeta` entry breaks ties left by the ones before it, primary key first. */
  protected readonly sortedValue = computed(() => {
    if (this.lazy()) {
      return this.value();
    }
    const rows = this.filteredValue();
    const groupField = this.effectiveGroupField();

    if (this.sortMode() === 'multiple') {
      const meta = this.multiSortMeta();
      const effectiveMeta = groupField ? [{ field: groupField, order: 'asc' as TableSortOrder }, ...meta.filter((m) => m.field !== groupField)] : meta;
      if (effectiveMeta.length === 0) {
        return rows;
      }
      return [...rows].sort((a, b) => {
        for (const entry of effectiveMeta) {
          const cmp = this.compareRows(a, b, entry.field, entry.order);
          if (cmp !== 0) {
            return cmp;
          }
        }
        return 0;
      });
    }

    const field = this.sortField();
    const order = this.sortOrder();
    if (groupField) {
      return [...rows].sort((a, b) => {
        const groupCmp = this.compareRows(a, b, groupField, 'asc');
        if (groupCmp !== 0 || !field || !order || field === groupField) {
          return groupCmp;
        }
        return this.compareRows(a, b, field, order);
      });
    }
    if (!field || !order) {
      return rows;
    }
    return [...rows].sort((a, b) => this.compareRows(a, b, field, order));
  });

  /** `lazy()`: `value()` is already the current page — no client-side slicing regardless of `paginator()`. */
  protected readonly pagedValue = computed(() => {
    if (this.lazy() || !this.paginator()) {
      return this.sortedValue();
    }
    const start = this.first();
    return this.sortedValue().slice(start, start + this.pageSize());
  });

  protected readonly effectiveTotalRecords = computed(() => (this.lazy() ? (this.totalRecords() ?? this.value().length) : this.sortedValue().length));

  protected readonly hasFrozenColumn = computed(() => this.visibleColumns().some((col) => col.frozen()));

  /** `true` when the reorder, selection and radio columns freeze on the left: they follow a left-frozen data column. */
  protected readonly utilityFrozen = computed(() => this.visibleColumns().some((col) => col.frozen() && col.alignFrozen() === 'left'));

  private readonly utilityWidth = computed(() => (this.reorderable() ? REORDER_COLUMN_PX : 0) + (this.selectionMode() === 'multiple' || this.selectionMode() === 'radio' ? SELECTION_COLUMN_PX : 0));

  /** Sticky side and offset of every frozen data column: each offset adds the widths of the frozen columns before it on its edge, the left edge starting after the utility columns. Derived from declared and resized widths, so no layout measurement is needed. */
  private readonly frozenLayout = computed(() => {
    const cols = this.visibleColumns();
    const layout = new Map<TableColumnComponent, { readonly side: 'left' | 'right'; readonly offset: number }>();
    let left = this.utilityWidth();
    for (const col of cols) {
      if (col.frozen() && col.alignFrozen() === 'left') {
        layout.set(col, { side: 'left', offset: left });
        left += this.frozenColumnPx(col);
      }
    }
    let right = 0;
    for (let i = cols.length - 1; i >= 0; i--) {
      if (cols[i].frozen() && cols[i].alignFrozen() === 'right') {
        layout.set(cols[i], { side: 'right', offset: right });
        right += this.frozenColumnPx(cols[i]);
      }
    }
    return layout;
  });

  protected readonly totalColumnCount = computed(() => this.visibleColumns().length + (this.selectionMode() === 'multiple' || this.selectionMode() === 'radio' ? 1 : 0) + (this.reorderable() ? 1 : 0) + (this.editMode() === 'row' ? 1 : 0));

  protected readonly allSelected = computed(() => {
    const rows = this.sortedValue();
    const sel = this.selection();
    return rows.length > 0 && Array.isArray(sel) && rows.every((row) => (sel as readonly T[]).some((r) => this.rowsEqual(r, row)));
  });

  protected readonly someSelected = computed(() => {
    const sel = this.selection();
    return Array.isArray(sel) && sel.length > 0 && !this.allSelected();
  });

  /** Reference equality by default; compares `row[dataKey()]` instead when `dataKey` is set — see class doc's "dataKey" section. */
  private rowsEqual(a: T, b: T): boolean {
    const key = this.dataKey();
    if (!key) {
      return a === b;
    }
    return (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key];
  }

  protected cellValue(row: T, col: TableColumnComponent): string {
    return this.rowFieldValue(row, col.field());
  }

  /** Group value for the subheader row — `''` when ungrouped so the template's `@if` never renders a boundary. */
  protected groupValue(row: T): string {
    const field = this.groupRowsBy();
    return field ? this.rowFieldValue(row, field) : '';
  }

  /** `true` when subheader rows carry a collapse toggle: `rowGroupMode="subheader"`, `expandableRowGroups` and a `groupRowsBy` field. */
  protected isRowGroupToggleable(): boolean {
    return this.rowGroupMode() === 'subheader' && this.expandableRowGroups() && !!this.groupRowsBy();
  }

  /** `true` when `row` belongs to a group whose value is in the `expandedRowGroups` model (the collapsed ones). */
  protected isGroupCollapsed(row: T): boolean {
    return this.isRowGroupToggleable() && this.expandedRowGroups().includes(this.groupValue(row));
  }

  /** A collapsed group hides its body rows and their expansion rows; the subheader row stays. */
  protected isRowHiddenByGroup(row: T): boolean {
    return this.isGroupCollapsed(row);
  }

  /** Collapses an expanded group or expands a collapsed one, updating the model and emitting the matching output. */
  protected toggleRowGroup(row: T): void {
    const value = this.groupValue(row);
    const collapsed = this.expandedRowGroups();
    if (collapsed.includes(value)) {
      this.expandedRowGroups.set(collapsed.filter((group) => group !== value));
      this.rowGroupExpand.emit(value);
    } else {
      this.expandedRowGroups.set([...collapsed, value]);
      this.rowGroupCollapse.emit(value);
    }
  }

  /** A group boundary starts at `index` when `rowGroupMode()` is on and either it's the first row or the previous row's group value differs. */
  protected isGroupStart(row: T, index: number): boolean {
    const field = this.rowGroupMode() === 'subheader' ? this.effectiveGroupField() : null;
    if (!field) {
      return false;
    }
    if (index === 0) {
      return true;
    }
    const previous = this.pagedValue()[index - 1];
    return this.rowFieldValue(previous, field) !== this.rowFieldValue(row, field);
  }

  protected tableClass(): string {
    return mergeClasses('w-full border-collapse text-left', SIZE_TEXT_CLASS[this.size()]);
  }

  private gridClass(): string {
    return this.showGridlines() ? 'border-x border-surface-200 dark:border-surface-700' : '';
  }

  /** Padding for the select, reorder and header utility cells; `narrow` uses the tighter horizontal padding. */
  protected readonly rowActionButtonClass = 'inline-flex size-7 items-center justify-center rounded-md text-surface-600 hover:bg-surface-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 dark:text-surface-300 dark:hover:bg-surface-700';

  protected utilityCellClass(extra: string, narrow = false): string {
    const pad = SIZE_PADDING_CLASS[this.size()];
    return mergeClasses(narrow ? pad.replace(/px-\S+/, 'px-2') : pad, extra, this.gridClass());
  }

  /** Pixel width of a frozen column for its neighbours' offsets: a resized width wins, then a `px` `width`, then the 60px minimum. */
  private frozenColumnPx(col: TableColumnComponent): number {
    const resized = this.resizedColumnWidths().get(col.field());
    if (resized !== undefined) {
      return resized;
    }
    const match = /^\s*(\d+(?:\.\d+)?)px\s*$/.exec(col.width() ?? '');
    return match ? parseFloat(match[1]) : MIN_FROZEN_COLUMN_PX;
  }

  /** Sticky style of a frozen data column, or `null` for any other column. */
  protected frozenStyle(col: TableColumnComponent): Record<string, string> | null {
    const placed = this.frozenLayout().get(col);
    return placed ? { position: 'sticky', [placed.side]: `${placed.offset}px`, 'z-index': '1' } : null;
  }

  /** Exact width of a utility column, plus its sticky offset when a left-frozen data column makes it freeze. */
  protected utilityStyle(kind: 'reorder' | 'selection'): Record<string, string> {
    const px = kind === 'reorder' ? REORDER_COLUMN_PX : SELECTION_COLUMN_PX;
    const style: Record<string, string> = { width: `${px}px`, 'min-width': `${px}px`, 'max-width': `${px}px` };
    if (this.utilityFrozen()) {
      style['position'] = 'sticky';
      style['left'] = `${kind === 'selection' && this.reorderable() ? REORDER_COLUMN_PX : 0}px`;
      style['z-index'] = '1';
    }
    return style;
  }

  /** Opaque background of a sticky utility cell (`row` is `null` in the header). */
  protected frozenUtilityClass(row: T | null, index = 0): string {
    return this.utilityFrozen() ? this.frozenBackground(row, index) : '';
  }

  /** Opaque background so scrolled content does not show through a sticky cell. It follows the row state, because a sticky cell does not inherit the row's own background; `group-hover` mirrors the row hover. */
  private frozenBackground(row: T | null, index: number): string {
    if (row === null) {
      return 'bg-surface-50 dark:bg-surface-800';
    }
    if (this.isSelected(row)) {
      return 'bg-brand-50 dark:bg-brand-950';
    }
    return this.stripedRows() && index % 2 === 1
      ? 'bg-surface-100 group-hover:bg-surface-50 dark:bg-surface-800 dark:group-hover:bg-surface-700'
      : 'bg-surface-0 group-hover:bg-surface-50 dark:bg-surface-800 dark:group-hover:bg-surface-700';
  }

  /** Scroll-facing border classes for a frozen column side. */
  private frozenBorderClass(side: 'left' | 'right'): string {
    return `${side === 'left' ? 'border-r' : 'border-l'} border-surface-200 dark:border-surface-700`;
  }

  /** Background and scroll-facing border of a frozen data cell (`row` is `null` in the header). */
  private frozenCellClass(col: TableColumnComponent, row: T | null, index: number): string {
    const placed = this.frozenLayout().get(col);
    return placed ? mergeClasses(this.frozenBackground(row, index), this.frozenBorderClass(placed.side)) : '';
  }

  protected groupCellClass(): string {
    return SIZE_PADDING_CLASS[this.size()];
  }

  protected expansionCellClass(): string {
    return SIZE_PADDING_CLASS[this.size()];
  }

  protected headerCellClass(col: TableColumnComponent): string {
    return mergeClasses(
      SIZE_PADDING_CLASS[this.size()],
      this.gridClass(),
      'font-semibold text-surface-700 select-none dark:text-surface-200',
      ALIGN_CLASS[col.align()],
      this.frozenCellClass(col, null, 0),
      this.dropTargetField() === col.field() ? 'bg-brand-50 dark:bg-brand-900/30' : '',
      col.sortable() || this.isColumnDraggable(col)
        ? (col.sortable() ? 'cursor-pointer ' : '') + 'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400'
        : '',
    );
  }

  protected cellClass(col: TableColumnComponent, row: T, index: number): string {
    return mergeClasses(SIZE_PADDING_CLASS[this.size()], 'text-surface-900 dark:text-surface-50', ALIGN_CLASS[col.align()], this.gridClass(), this.frozenCellClass(col, row, index));
  }

  protected skeletonUtilityCellClass(narrow = false): string {
    return this.utilityCellClass(this.utilityFrozen() ? 'bg-surface-0 dark:bg-surface-800' : '', narrow);
  }

  protected skeletonCellClass(col: TableColumnComponent): string {
    const placed = this.frozenLayout().get(col);
    const frozen = placed ? mergeClasses('sticky z-[1] bg-surface-0 dark:bg-surface-800', this.frozenBorderClass(placed.side)) : '';
    return mergeClasses(SIZE_PADDING_CLASS[this.size()], ALIGN_CLASS[col.align()], this.gridClass(), frozen);
  }

  /** `interactive` is `false` for frozen rows, which are display-only: no pointer cursor, since they cannot be selected. */
  protected rowClassFor(row: T, index: number, interactive = true): string {
    const striped = this.stripedRows() && index % 2 === 1;
    return mergeClasses(
      'group border-b border-surface-200 last:border-b-0 dark:border-surface-700',
      interactive && this.selectionMode() ? 'cursor-pointer' : '',
      this.isSelected(row)
        ? 'bg-brand-50 dark:bg-brand-500/10'
        : striped
          ? 'bg-surface-100/70 hover:bg-surface-100 dark:bg-surface-800/60 dark:hover:bg-surface-800'
          : 'hover:bg-surface-50 dark:hover:bg-surface-800/50',
      this.rowClass()?.(row) ?? '',
    );
  }

  protected ariaSortFor(col: TableColumnComponent): string | null {
    if (!col.sortable()) {
      return null;
    }
    const order = this.sortMode() === 'multiple' ? (this.multiSortMeta().find((m) => m.field === col.field())?.order ?? null) : this.sortField() === col.field() ? this.sortOrder() : null;
    return order === 'asc' ? 'ascending' : order === 'desc' ? 'descending' : 'none';
  }

  /** Field of the column whose filter menu is open, or `null`; drives the funnel's `aria-expanded`. */
  protected readonly openFilterField = signal<string | null>(null);

  /** Whether `col` has an active rule in `columnFilters`, which switches its funnel to the active state. */
  protected isColumnFilterActive(col: TableColumnComponent): boolean {
    return isRuleActive(this.columnFilters()[col.field()]);
  }

  protected funnelButtonClass(col: TableColumnComponent): string {
    return mergeClasses(
      'inline-flex items-center justify-center rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500',
      this.isColumnFilterActive(col) ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300',
    );
  }

  /** Rule being edited in the one open filter menu; seeded when the menu opens and discarded when it closes. */
  protected readonly filterDraft = signal<{ readonly field: string; readonly matchMode: TableFilterMatchMode; readonly value: TableColumnFilter['value'] } | null>(null);

  /** Options of the match mode select: the modes `col` offers, named by `matchModeLabels` over the English defaults. */
  protected filterModeOptions(col: TableColumnComponent): { label: string; value: TableFilterMatchMode }[] {
    const labels = { ...DEFAULT_MATCH_MODE_LABELS, ...this.matchModeLabels() };
    return offeredMatchModes(col.filterType(), col.filterMatchModes()).map((mode) => ({ label: labels[mode] ?? mode, value: mode }));
  }

  protected onFilterMenuShown(col: TableColumnComponent): void {
    this.openFilterField.set(col.field());
    const rule = this.columnFilters()[col.field()];
    const offered = offeredMatchModes(col.filterType(), col.filterMatchModes());
    const matchMode = rule && offered.includes(rule.matchMode) ? rule.matchMode : preselectedMatchMode(col.filterType(), offered, col.filterMatchMode());
    const value = rule?.value ?? null;
    this.filterDraft.set({ field: col.field(), matchMode, value });
    this.filterModeControl.setValue(matchMode, { emitEvent: false });
    this.filterDateControl.setValue(value instanceof Date ? value : null, { emitEvent: false });
  }

  /** Closing the menu by any route discards the draft and returns focus to its funnel button, which a click does not always focus (D-03). */
  protected onFilterMenuHidden(button: HTMLButtonElement): void {
    this.openFilterField.set(null);
    this.filterDraft.set(null);
    button.focus();
  }

  /**
   * Bind the match mode select and the date picker, which are value accessors with no signal model. A `FormControl`
   * writes its value into the accessor as soon as the control renders, where `ngModel` would wait a microtask.
   */
  protected readonly filterModeControl = new FormControl<TableFilterMatchMode>('contains', { nonNullable: true });
  protected readonly filterDateControl = new FormControl<Date | null>(null);

  protected setFilterDraftMode(matchMode: TableFilterMatchMode): void {
    this.filterDraft.update((draft) => (draft ? { ...draft, matchMode } : draft));
  }

  protected setFilterDraftValue(value: TableColumnFilter['value']): void {
    this.filterDraft.update((draft) => (draft ? { ...draft, value } : draft));
  }

  protected onFilterTextInput(event: Event): void {
    this.setFilterDraftValue((event.target as HTMLInputElement).value);
  }

  /** An empty or invalid number field stores `null`, so `0` stays a real value. */
  protected onFilterNumberInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    const value = text.trim() === '' ? null : Number(text);
    this.setFilterDraftValue(value === null || Number.isNaN(value) ? null : value);
  }

  /** Commits the draft as `col`'s rule (an inactive draft removes it) and closes the menu. */
  protected applyColumnFilter(col: TableColumnComponent, popover: PopoverComponent): void {
    const draft = this.filterDraft();
    if (draft) {
      const rule: TableColumnFilter = { matchMode: draft.matchMode, value: draft.value };
      this.commitColumnFilter(col.field(), isRuleActive(rule) ? rule : null);
    }
    popover.hide();
  }

  protected clearColumnFilter(col: TableColumnComponent, popover: PopoverComponent): void {
    this.commitColumnFilter(col.field(), null);
    popover.hide();
  }

  /** A rule change from the menu returns to the first page; an application write to `columnFilters` does not (D-06). */
  private commitColumnFilter(field: string, rule: TableColumnFilter | null): void {
    const next: Record<string, TableColumnFilter> = { ...this.columnFilters() };
    if (rule) {
      next[field] = rule;
    } else {
      delete next[field];
    }
    this.columnFilters.set(next);
    this.first.set(0);
    this.filter.emit({ value: this.globalFilterValue(), data: this.filteredValue() });
  }

  protected sortIconClass(col: TableColumnComponent): string {
    const order = this.sortMode() === 'multiple' ? (this.multiSortMeta().find((m) => m.field === col.field())?.order ?? null) : this.sortField() === col.field() ? this.sortOrder() : null;
    return mergeClasses(
      'size-3.5 transition-transform duration-(--transition-duration-base)',
      order !== null ? 'text-surface-700 dark:text-surface-200' : 'text-surface-400 dark:text-surface-500',
      order === 'desc' ? 'rotate-180' : '',
    );
  }

  /** 1-based position of `col` within `multiSortMeta`, or `null` if it isn't in there (or `sortMode()` isn't `'multiple'`) — drives the small priority badge next to the sort icon. */
  protected multiSortPriority(col: TableColumnComponent): number | null {
    if (this.sortMode() !== 'multiple') {
      return null;
    }
    const index = this.multiSortMeta().findIndex((m) => m.field === col.field());
    return index === -1 ? null : index + 1;
  }

  protected onHeaderClick(col: TableColumnComponent, event: MouseEvent): void {
    if (col.sortable()) {
      this.toggleSort(col.field(), event.shiftKey);
    }
  }

  /**
   * Enter/Space activate a sortable header cell (Wave 2 fix — 2026-08-19):
   * a `<th>` has no native interactive semantics, so before this it was
   * mouse-click-only despite `aria-sort` making it look keyboard-operable.
   * Standard toolbar/button activation keys — both Enter and Space, same
   * pair `onRowKeydown` already uses for row selection. Shift+Enter/Space
   * mirrors Shift+click for adding a sort key in `sortMode="multiple"`.
   */
  protected onHeaderKeydown(event: KeyboardEvent, col: TableColumnComponent): void {
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') && this.isColumnDraggable(col)) {
      event.preventDefault();
      this.moveColumnByKey(col, event.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (!col.sortable()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleSort(col.field(), event.shiftKey);
    }
  }

  /** Text of the visually hidden live region; set after each keyboard move. */
  protected readonly columnAnnouncement = signal('');

  /** Moves `col` one visible position toward the start (`-1`) or end (`1`), skipping hidden columns, then restores focus to its header. */
  private moveColumnByKey(col: TableColumnComponent, direction: -1 | 1): void {
    const ordered = this.orderedColumns();
    const neighbor = (direction === -1 ? ordered.slice(0, ordered.indexOf(col)).reverse() : ordered.slice(ordered.indexOf(col) + 1)).find((c) => c.visible());
    if (!neighbor || !this.moveColumn(col.field(), neighbor.field())) {
      return;
    }
    const visible = this.visibleColumns();
    this.columnAnnouncement.set(this.columnMoveAnnouncement()(col.header(), visible.indexOf(col) + 1, visible.length));
    const field = col.field();
    afterNextRender(
      () => {
        const headers = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('thead tr:last-child th[scope="col"]'));
        headers[this.visibleColumns().findIndex((c) => c.field() === field)]?.focus();
      },
      { injector: this.injector },
    );
  }

  /** Field of the header being dragged, or `null`; a plain field because only the handlers read it. */
  private draggedColumnField: string | null = null;
  /** Field of the header under the drag when it is a valid drop target, for the highlight. */
  protected readonly dropTargetField = signal<string | null>(null);

  protected isColumnDraggable(col: TableColumnComponent): boolean {
    return this.reorderableColumns() && col.reorderable();
  }

  protected onColDragStart(event: DragEvent, col: TableColumnComponent): void {
    if (!this.isColumnDraggable(col)) {
      return;
    }
    if (this.colResizeState) {
      // The resize handle sits inside the draggable header: a native drag would cancel the resize.
      event.preventDefault();
      return;
    }
    this.draggedColumnField = col.field();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', col.field());
    }
  }

  protected onColDragOver(event: DragEvent, col: TableColumnComponent): void {
    const from = this.draggedColumnField === null ? undefined : this.columns().find((c) => c.field() === this.draggedColumnField);
    if (!from || !this.canMoveColumn(from, col)) {
      return;
    }
    event.preventDefault();
    this.dropTargetField.set(col.field());
  }

  protected onColDragLeave(col: TableColumnComponent): void {
    if (this.dropTargetField() === col.field()) {
      this.dropTargetField.set(null);
    }
  }

  protected onColDrop(event: DragEvent, col: TableColumnComponent): void {
    const from = this.draggedColumnField;
    this.dropTargetField.set(null);
    if (from === null) {
      return;
    }
    event.preventDefault();
    this.moveColumn(from, col.field());
  }

  protected onColDragEnd(): void {
    this.draggedColumnField = null;
    this.dropTargetField.set(null);
  }

  /** Whether `from` may take the position of `to`: both reorderable and frozen on the same edge (or both free), so a move never changes a frozen state. */
  protected canMoveColumn(from: TableColumnComponent, to: TableColumnComponent): boolean {
    if (from === to || !from.reorderable() || !to.reorderable()) {
      return false;
    }
    if (from.frozen() !== to.frozen()) {
      return false;
    }
    return !from.frozen() || from.alignFrozen() === to.alignFrozen();
  }

  /** Places the column `fromField` at the position of `toField` in the full column order and emits `colReorder`; returns whether anything moved. */
  protected moveColumn(fromField: string, toField: string): boolean {
    if (!this.reorderableColumns()) {
      return false;
    }
    const ordered = this.orderedColumns();
    const dragIndex = ordered.findIndex((col) => col.field() === fromField);
    const dropIndex = ordered.findIndex((col) => col.field() === toField);
    if (dragIndex < 0 || dropIndex < 0 || !this.canMoveColumn(ordered[dragIndex], ordered[dropIndex])) {
      return false;
    }
    const fields = ordered.map((col) => col.field());
    const [moved] = fields.splice(dragIndex, 1);
    fields.splice(dropIndex, 0, moved);
    this.columnOrder.set(fields);
    this.colReorder.emit({ dragIndex, dropIndex, columns: fields });
    return true;
  }

  protected toggleSort(field: string, additive = false): void {
    if (this.sortMode() === 'multiple') {
      this.toggleMultiSort(field, additive);
      this.emitSort();
      return;
    }
    if (this.sortField() !== field) {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    } else {
      const next: TableSortOrder = this.sortOrder() === 'asc' ? 'desc' : this.sortOrder() === 'desc' && this.removableSort() ? null : 'asc';
      this.sortOrder.set(next);
      if (next === null) {
        this.sortField.set(null);
      }
    }
    this.emitSort();
  }

  private emitSort(): void {
    this.sort.emit({ field: this.sortField(), order: this.sortOrder(), multiSortMeta: this.multiSortMeta(), data: this.sortedValue() });
  }

  /** Plain click replaces the whole `multiSortMeta` with just `field`; Shift+click adds/cycles `field` within the existing array, leaving the others untouched — see class doc's "sortMode: 'multiple'" section. */
  private toggleMultiSort(field: string, additive: boolean): void {
    const current = this.multiSortMeta();
    const existingIndex = current.findIndex((m) => m.field === field);

    if (!additive) {
      if (existingIndex === 0 && current.length === 1) {
        const next = current[0].order === 'asc' ? 'desc' : current[0].order === 'desc' ? null : 'asc';
        this.multiSortMeta.set(next === null ? [] : [{ field, order: next }]);
      } else {
        this.multiSortMeta.set([{ field, order: 'asc' }]);
      }
      return;
    }

    if (existingIndex === -1) {
      this.multiSortMeta.set([...current, { field, order: 'asc' }]);
      return;
    }
    const existing = current[existingIndex];
    const next: TableSortOrder = existing.order === 'asc' ? 'desc' : existing.order === 'desc' ? null : 'asc';
    const withoutField = current.filter((m) => m.field !== field);
    this.multiSortMeta.set(next === null ? withoutField : [...withoutField.slice(0, existingIndex), { field, order: next }, ...withoutField.slice(existingIndex)]);
  }

  protected isSelected(row: T): boolean {
    const sel = this.selection();
    return this.selectionMode() === 'multiple' ? Array.isArray(sel) && (sel as readonly T[]).some((r) => this.rowsEqual(r, row)) : sel !== null && this.rowsEqual(sel as T, row);
  }

  /** `single` and `radio` share the same row selection behavior. */
  protected isSingleLike(): boolean {
    return this.selectionMode() === 'single' || this.selectionMode() === 'radio';
  }

  protected onRowClick(row: T): void {
    if (this.isSingleLike()) {
      this.selectSingle(row);
    }
  }

  protected onRowKeydown(event: KeyboardEvent, row: T): void {
    // Enter saves and Escape cancels an edited row, even from an edit template that does not handle them itself.
    if (this.editMode() === 'row' && this.editingRow() === row && (event.key === 'Enter' || event.key === 'Escape')) {
      const target = event.target as HTMLElement | null;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.cancelRowEdit();
        return;
      }
      if (target?.closest?.('[data-med-editing]') && !target.closest('button, textarea, a')) {
        event.preventDefault();
        this.saveRowEdit();
        return;
      }
    }
    // Keys pressed inside an edit template belong to it: they must neither select the row nor move the row focus.
    if ((event.target as HTMLElement | null)?.closest?.('[data-med-editing]')) {
      return;
    }
    const mode = this.selectionMode();
    if (!mode) {
      return;
    }
    // In `multiple` mode the row holds a checkbox that handles Space natively, so only keys pressed on the row itself count.
    if (mode === 'multiple' && event.target !== event.currentTarget) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (mode === 'multiple') {
        this.toggleRow(row);
      } else {
        this.selectSingle(row);
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.moveRowFocus(event);
    }
  }

  /** Moves focus between the focusable body rows of the current page, without changing the selection and without wrapping. */
  private moveRowFocus(event: KeyboardEvent): void {
    const current = event.currentTarget as HTMLElement;
    const rows = Array.from(current.parentElement?.querySelectorAll<HTMLElement>(':scope > tr[tabindex]') ?? []);
    const index = rows.indexOf(current);
    if (index === -1) {
      return;
    }
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : event.key === 'ArrowDown' ? Math.min(index + 1, rows.length - 1) : Math.max(index - 1, 0);
    rows[target].focus();
  }

  protected selectSingle(row: T): void {
    const current = this.selection();
    if (current !== null && this.rowsEqual(current as T, row)) {
      return;
    }
    this.selection.set(row);
    this.rowSelect.emit(row);
  }

  protected toggleRow(row: T): void {
    const current = (this.selection() as readonly T[] | null) ?? [];
    const isCurrentlySelected = current.some((r) => this.rowsEqual(r, row));
    this.selection.set(isCurrentlySelected ? current.filter((r) => !this.rowsEqual(r, row)) : [...current, row]);
    (isCurrentlySelected ? this.rowUnselect : this.rowSelect).emit(row);
  }

  protected toggleSelectAll(): void {
    this.selection.set(this.allSelected() ? [] : [...this.sortedValue()]);
  }

  protected onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterInputText.set(value);
    if (this.filterDebounceHandle !== null) {
      clearTimeout(this.filterDebounceHandle);
    }
    this.filterDebounceHandle = setTimeout(() => {
      this.filterDebounceHandle = null;
      this.globalFilterValue.set(value);
      this.filter.emit({ value, data: this.filteredValue() });
    }, this.filterDelay());
  }

  protected onRowDragStart(index: number): void {
    this.draggedRowIndex = index;
  }

  protected onRowDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * `dropIndex`/`dragIndex` translate the displayed (`pagedValue()`)
   * drag/drop positions back to real indices in `value()` — same
   * displayed-vs-real-index translation `PickListComponent.realIndexFromFiltered`
   * established this session, see class doc's "reorderable" section.
   */
  protected onRowDrop(dropDisplayIndex: number): void {
    const dragDisplayIndex = this.draggedRowIndex;
    this.draggedRowIndex = null;
    if (dragDisplayIndex === null || dragDisplayIndex === dropDisplayIndex) {
      return;
    }
    const displayed = this.pagedValue();
    const source = this.value();
    const dragIndex = source.indexOf(displayed[dragDisplayIndex]);
    const dropIndex = source.indexOf(displayed[dropDisplayIndex]);
    if (dragIndex === -1 || dropIndex === -1) {
      return;
    }
    this.rowReorder.emit({ dragIndex, dropIndex });
  }

  protected isEditingCell(row: T, col: TableColumnComponent): boolean {
    if (this.editMode() === 'row') {
      return this.editingRow() === row && col.editable() && !!col.editTemplate();
    }
    const editing = this.editingCell();
    return editing !== null && editing.row === row && editing.field === col.field();
  }

  /** With `editTrigger="click"` a click on an editable cell starts editing it; the event stops here so the row click never selects the row. */
  protected onCellClick(event: MouseEvent, row: T, col: TableColumnComponent): void {
    // A click inside a cell that is already being edited belongs to the edit template, never to row selection.
    if (this.isEditingCell(row, col)) {
      event.stopPropagation();
      return;
    }
    if (this.editTrigger() !== 'click' || this.editMode() !== 'cell' || !col.editable() || !col.editTemplate()) {
      return;
    }
    event.stopPropagation();
    this.editingCell.set({ row, field: col.field() });
  }

  protected onCellDblClick(event: MouseEvent, row: T, col: TableColumnComponent): void {
    if (this.editMode() !== 'cell' || !col.editable() || !col.editTemplate()) {
      return;
    }
    // A dblclick is preceded by its own two real click events, which the
    // row's own (click) already reacted to (e.g. selectionMode="single"
    // selecting this row) before this handler ever runs — this only stops
    // the dblclick event itself from bubbling any further, it can't undo
    // that. Selecting the row you're about to edit a cell in is harmless
    // either way.
    event.stopPropagation();
    this.editingCell.set({ row, field: col.field() });
  }

  /** Starts editing `row`; a row already being edited is cancelled first, emitting `rowEditCancel` for it. */
  protected startRowEdit(row: T): void {
    const current = this.editingRow();
    if (current === row) {
      return;
    }
    if (current !== null) {
      this.cancelRowEdit();
    }
    this.rowDraft = {};
    this.editingRow.set(row);
  }

  protected saveRowEdit(): void {
    const row = this.editingRow();
    if (row === null) {
      return;
    }
    // Every editable field with an edit template: the draft value when one was recorded, the row's current value otherwise.
    const values: Record<string, unknown> = {};
    for (const col of this.visibleColumns()) {
      if (col.editable() && col.editTemplate()) {
        const field = col.field();
        values[field] = field in this.rowDraft ? this.rowDraft[field] : (row as Record<string, unknown>)[field];
      }
    }
    this.rowDraft = {};
    this.editingRow.set(null);
    this.rowEditComplete.emit({ row, values });
  }

  protected cancelRowEdit(): void {
    const row = this.editingRow();
    if (row === null) {
      return;
    }
    this.rowDraft = {};
    this.editingRow.set(null);
    this.rowEditCancel.emit(row);
  }

  /**
   * Template context of an edit template. In row mode `onChange` records the field's value in the row's draft, `onSave`
   * records it and commits the whole row, and `onCancel` cancels the row; in cell mode `onSave`/`onCancel` act on the single cell.
   */
  protected editContext(row: T, col: TableColumnComponent): Record<string, unknown> {
    if (this.editMode() !== 'row') {
      return { $implicit: row, onSave: this.saveEdit(row, col), onCancel: this.cancelEdit(row, col) };
    }
    const field = col.field();
    return {
      $implicit: row,
      onChange: (value: unknown) => {
        this.rowDraft[field] = value;
      },
      onSave: (value: unknown) => {
        this.rowDraft[field] = value;
        this.saveRowEdit();
      },
      onCancel: () => this.cancelRowEdit(),
    };
  }

  /** Bound once per render for the currently-editing cell only (guarded by `isEditingCell()` in the template) — not a perf concern, at most one cell is ever in edit mode at a time. */
  protected saveEdit(row: T, col: TableColumnComponent): (value: unknown) => void {
    return (value: unknown) => {
      this.editComplete.emit({ row, field: col.field(), value });
      this.editingCell.set(null);
    };
  }

  protected cancelEdit(row: T, col: TableColumnComponent): () => void {
    return () => {
      this.editCancel.emit({ row, field: col.field() });
      this.editingCell.set(null);
    };
  }

  /**
   * Exports `sortedValue()` (every row that passes the global filter and every
   * column filter, in the current sort order, not just the visible page) as CSV, or just `selection()` when `{ selectionOnly:
   * true }` is passed. See class doc for the escaping rule and why this is
   * a plain method rather than a rendered button.
   */
  exportCSV(options?: { readonly selectionOnly?: boolean }): void {
    const rows = options?.selectionOnly ? this.selectionAsArray() : this.sortedValue();
    const cols = this.visibleColumns();
    const sep = this.csvSeparator();
    const escape = (value: string): string => (value.includes(sep) || value.includes('"') || value.includes('\n') ? `"${value.replace(/"/g, '""')}"` : value);

    const header = cols.map((col) => escape(col.header())).join(sep);
    const lines = rows.map((row) => cols.map((col) => escape(this.cellValue(row, col))).join(sep));
    const csv = [header, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.exportFilename()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private selectionAsArray(): readonly T[] {
    const sel = this.selection();
    if (sel === null) {
      return [];
    }
    return isRowArray(sel) ? sel : [sel];
  }

  protected columnWidth(col: TableColumnComponent): string | null {
    const px = this.resizedColumnWidths().get(col.field());
    return px !== undefined ? `${px}px` : col.width();
  }

  /** `fit` resizes against the next visible column, so the last visible column has no handle there; `expand` gives every column one. */
  protected hasResizeHandle(col: TableColumnComponent): boolean {
    const visible = this.visibleColumns();
    return this.columnResizeMode() === 'expand' || visible[visible.length - 1] !== col;
  }

  protected onColResizeStart(event: PointerEvent, col: TableColumnComponent): void {
    const th = (event.currentTarget as HTMLElement).closest('th') as HTMLElement | null;
    if (!th) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    const visible = this.visibleColumns();
    const nextCol = this.columnResizeMode() === 'fit' ? visible[visible.indexOf(col) + 1] : undefined;
    const nextTh = th.nextElementSibling as HTMLElement | null;
    if (this.columnResizeMode() === 'expand') {
      this.pinMeasuredWidths(th, visible.indexOf(col), visible);
    }
    this.colResizeState = {
      field: col.field(),
      startX: event.clientX,
      startWidth: th.getBoundingClientRect().width || 100,
      element: th,
      neighbour: nextCol && nextTh ? { field: nextCol.field(), startWidth: nextTh.getBoundingClientRect().width || 100 } : null,
      tableStartWidth: th.closest('table')?.getBoundingClientRect().width ?? 0,
    };
  }

  /**
   * Freezes every visible column at its measured width before an `expand` drag. Otherwise a `w-full` fixed-layout table spreads
   * the width it gains across all columns, so the neighbours would change too. Widths set by an earlier drag are kept.
   */
  private pinMeasuredWidths(th: HTMLElement, index: number, visible: readonly TableColumnComponent[]): void {
    const cells = Array.from(th.parentElement?.children ?? []) as HTMLElement[];
    const offset = cells.indexOf(th) - index;
    this.resizedColumnWidths.update((map) => {
      const next = new Map(map);
      visible.forEach((column, i) => {
        const width = cells[offset + i]?.getBoundingClientRect().width;
        if (width && !next.has(column.field())) {
          next.set(column.field(), width);
        }
      });
      return next;
    });
  }

  protected onColResizeMove(event: PointerEvent): void {
    const state = this.colResizeState;
    if (!state) {
      return;
    }
    const requested = Math.round(event.clientX - state.startX);
    if (state.neighbour) {
      const { field, startWidth } = state.neighbour;
      const delta = Math.min(Math.max(requested, MIN_RESIZE_COLUMN_PX - state.startWidth), startWidth - MIN_RESIZE_COLUMN_PX);
      this.resizedColumnWidths.update((map) => new Map(map).set(state.field, Math.round(state.startWidth + delta)).set(field, Math.round(startWidth - delta)));
      return;
    }
    const nextWidth = Math.max(MIN_RESIZE_COLUMN_PX, state.startWidth + requested);
    this.resizedColumnWidths.update((map) => new Map(map).set(state.field, nextWidth));
    if (this.columnResizeMode() === 'expand') {
      this.tableWidthPx.set(state.tableStartWidth + (nextWidth - state.startWidth));
    }
  }

  protected onColResizeEnd(): void {
    const state = this.colResizeState;
    this.colResizeState = null;
    if (!state) {
      return;
    }
    const finalWidth = this.resizedColumnWidths().get(state.field) ?? state.startWidth;
    this.colResize.emit({ element: state.element, delta: finalWidth - state.startWidth });
  }

  private rowExpansionKey(row: T, index: number): string {
    const key = this.dataKey();
    if (key) {
      const value = (row as Record<string, unknown>)[key];
      if (value !== undefined && value !== null) {
        return String(value);
      }
    }
    return String(this.rowTrackBy()(row, index));
  }

  protected isRowExpanded(row: T, index: number): boolean {
    return !!this.expandedRowKeys()[this.rowExpansionKey(row, index)];
  }

  toggleRowExpansion(row: T, index = 0): void {
    const key = this.rowExpansionKey(row, index);
    const current = this.expandedRowKeys();
    const next = { ...current };
    if (next[key]) {
      delete next[key];
      this.expandedRowKeys.set(next);
      this.rowCollapse.emit(row);
    } else {
      next[key] = true;
      this.expandedRowKeys.set(next);
      this.rowExpand.emit(row);
    }
  }

  private getStateStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return this.stateStorage() === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  private restoreTableState(key: string): void {
    const storage = this.getStateStorage();
    if (!storage) {
      return;
    }
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        first?: number;
        sortField?: string | null;
        sortOrder?: TableSortOrder;
        expandedRowKeys?: Record<string, boolean>;
        columnFilters?: unknown;
      };
      if (typeof parsed.first === 'number') {
        this.first.set(parsed.first);
      }
      if (parsed.sortField !== undefined) {
        this.sortField.set(parsed.sortField);
      }
      if (parsed.sortOrder !== undefined) {
        this.sortOrder.set(parsed.sortOrder);
      }
      if (parsed.expandedRowKeys && typeof parsed.expandedRowKeys === 'object') {
        this.expandedRowKeys.set(parsed.expandedRowKeys);
      }
      // State stored before column filters existed has no such key and restores as before.
      if (parsed.columnFilters !== undefined) {
        this.columnFilters.set(this.parseStoredColumnFilters(parsed.columnFilters));
      }
    } catch {
      // Ignore malformed stored state.
    }
  }

  /**
   * Keeps each stored rule whose field is a declared column and whose match mode and value fit that column's
   * `filterType`: a string for text, a finite number for numeric, a valid ISO date string (turned back into a `Date`)
   * for date. Anything else is dropped.
   */
  private parseStoredColumnFilters(stored: unknown): TableColumnFilters {
    if (!stored || typeof stored !== 'object') {
      return {};
    }
    const entries = stored as Record<string, unknown>;
    const rules: Record<string, TableColumnFilter> = {};
    for (const col of this.columns()) {
      const entry = entries[col.field()] as { matchMode?: unknown; value?: unknown } | null | undefined;
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const type = col.filterType();
      const matchMode = entry.matchMode as TableFilterMatchMode;
      if (!FILTER_MODES_BY_TYPE[type].includes(matchMode)) {
        continue;
      }
      const value = entry.value;
      if (type === 'text' && typeof value === 'string') {
        rules[col.field()] = { matchMode, value };
      } else if (type === 'numeric' && typeof value === 'number' && Number.isFinite(value)) {
        rules[col.field()] = { matchMode, value };
      } else if (type === 'date' && typeof value === 'string') {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          rules[col.field()] = { matchMode, value: date };
        }
      }
    }
    return rules;
  }

  private persistTableState(
    key: string,
    state: {
      first: number;
      sortField: string | null;
      sortOrder: TableSortOrder;
      expandedRowKeys: Record<string, boolean>;
      columnFilters: TableColumnFilters;
    },
  ): void {
    const storage = this.getStateStorage();
    if (!storage) {
      return;
    }
    try {
      storage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore quota / security errors.
    }
  }
}
