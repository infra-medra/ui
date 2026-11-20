import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, TemplateRef, afterNextRender, booleanAttribute, computed, contentChild, contentChildren, effect, inject, input, linkedSignal, model, numberAttribute, output, signal, untracked } from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { InputTextDirective } from '../input-text/input-text.directive';
import { PaginatorComponent } from '../paginator/paginator.component';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { checkboxBoxVariants } from '../checkbox/checkbox.styles';
import { DOT_SIZE_CLASS, radioRingVariants } from '../radio-button/radio-button.styles';
import { mergeClasses } from '../utils/merge-classes';
import { TableColumnComponent } from './table-column.component';
import { TableColumnAlign, TableLazyLoadEvent, TableRowReorderEvent, TableSelectionMode, TableSize, TableSortMeta, TableSortMode, TableSortOrder } from './data-table.types';

let nextRadioGroupId = 0;

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
 * - No frozen/sticky columns — still true here even after `TableColumnComponent`
 *   grew `frozen`/`alignFrozen` for `TreeTableComponent`'s own sake: both inputs
 *   are inert on this component, which never reads them. `TreeTableComponent`'s
 *   own doc explains the pure-CSS `position: sticky` technique it uses; nothing
 *   about that approach is DataTable-specific, so lifting the cut here later,
 *   if ever needed, should be able to reuse it directly.
 * - No column reorder/resize.
 * - No row expansion.
 * - No per-column filter row (avoids #16576 "column filter indicator
 *   disappearing") — a single global filter (`filterable`) covers the common
 *   "search this table" case with far less surface area.
 * - No `responsiveLayout="stack"` mode (avoids #16510, a regression in the
 *   original) — instead the table wrapper scrolls horizontally past the
 *   viewport (`overflow-x-auto`), the same M3-aligned pattern
 *   `TabsComponent` already uses for its own overflow.
 * None of these are dead ends — each layers on top of this API without a
 * breaking change if a later version needs it.
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
 * **`loading`** is purely presentational — a dimmed table with a centered
 * `ProgressSpinnerComponent` overlay, rows kept in place underneath
 * (avoids layout jank vs. clearing the body outright) rather than a
 * blank/empty state.
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
 * **`editMode: 'cell'`** (row-level batch editing
 * `editMode: 'row'` — is a documented cut for this pass: it needs its own
 * actions column plus aggregate commit/cancel across every editable cell
 * in a row at once, meaningfully more surface area than cell-at-a-time
 * editing for the same core value). A column opts in with `editable` on
 * `TableColumnComponent` plus a second named template
 * (`<ng-template #editTemplate let-row let-onSave="onSave"
 * let-onCancel="onCancel">`, see that file's own doc for why a second
 * template needs an explicit name). Double-click (not a plain click,
 * which already means "select this row" in `selectionMode="single"`) a
 * cell to enter edit mode; the consumer's own edit template decides which
 * events call `onSave(value)`/`onCancel()` — this component only tracks
 * *which* cell is currently being edited and emits `editComplete`/
 * `editCancel` when told to, the same "consumer wires the actual input,
 * this just provides the context functions" split `cellTemplate` already
 * uses for display.
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
 * consecutive rows' `groupRowsBy` field value changes `'rowspan'` (merging the grouped cell
 * vertically across the group's own rows instead of a separate subheader row), is a documented cut:
 * it needs per-cell rowspan bookkeeping interleaved with the existing column-driven `<td>` loop,
 * meaningfully more surface area for a layout variant of the same underlying grouping. Setting
 * `groupRowsBy` makes it the primary sort key ahead of `sortField`/`multiSortMeta`, so grouping
 * implies grouping-column-first sort — otherwise same-group rows could scatter across the table and
 * the subheader boundary detection would fire once per row.
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
 */
@Component({
  selector: 'med-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent, InputTextDirective, PaginatorComponent, ProgressSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
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
    <div [class]="wrapperClass()" [class.overflow-y-auto]="scrollable()" [style.maxHeight]="scrollable() ? scrollHeight() : null">
      @if (loading()) {
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-surface-0/60 dark:bg-surface-800/60">
          <med-progress-spinner [ariaLabel]="loadingLabel()" />
        </div>
      }
      <table [class]="tableClass()" [class.table-fixed]="resizableColumns()" [class.opacity-50]="loading()" [attr.aria-label]="ariaLabel()">
        <thead [class]="scrollable() ? 'sticky top-0 z-10 bg-surface-50 dark:bg-surface-800' : ''">
          <tr class="border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50">
            @if (reorderable()) {
              <th [class]="utilityCellClass('w-8', true)"></th>
            }
            @if (selectionMode() === 'multiple') {
              <th [class]="utilityCellClass('w-10')">
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
              <th [class]="utilityCellClass('w-10')"></th>
            }
            @for (col of columns(); track col.field()) {
              <th
                scope="col"
                [style.width]="columnWidth(col)"
                [class]="headerCellClass(col)"
                [class.relative]="resizableColumns()"
                [attr.aria-sort]="ariaSortFor(col)"
                [attr.tabindex]="col.sortable() ? 0 : null"
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
                </span>
                @if (resizableColumns()) {
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
          </tr>
        </thead>
        <tbody>
          @for (row of pagedValue(); track rowTrackBy()(row, $index); let i = $index) {
            @if (isGroupStart(row, i)) {
              <tr class="border-b border-surface-200 bg-surface-50 font-semibold dark:border-surface-700 dark:bg-surface-800/50">
                <td [attr.colspan]="totalColumnCount()" [class]="groupCellClass()">
                  @if (groupHeaderTemplate(); as t) {
                    <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: row }" />
                  } @else {
                    {{ groupValue(row) }}
                  }
                </td>
              </tr>
            }
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
                <td [class]="utilityCellClass('w-8 cursor-move text-surface-400 dark:text-surface-500', true)" (click)="$event.stopPropagation()">
                  <med-icon name="bars-3" variant="mini" class="size-4" />
                </td>
              }
              @if (selectionMode() === 'multiple') {
                <td [class]="utilityCellClass('w-10')">
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
                <td [class]="utilityCellClass('w-10')">
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
              @for (col of columns(); track col.field()) {
                <td [class]="cellClass(col)" (dblclick)="onCellDblClick($event, row, col)">
                  @if (isEditingCell(row, col); as editing) {
                    <ng-container
                      [ngTemplateOutlet]="col.editTemplate()!"
                      [ngTemplateOutletContext]="{ $implicit: row, onSave: saveEdit(row, col), onCancel: cancelEdit(row, col) }"
                    />
                  } @else if (col.cellTemplate(); as t) {
                    <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: row, rowIndex: i }" />
                  } @else {
                    {{ cellValue(row, col) }}
                  }
                </td>
              }
            </tr>
            @if (isRowExpanded(row, i) && rowExpansionTemplate(); as expTpl) {
              <tr class="border-b border-surface-200 bg-surface-50/40 dark:border-surface-700 dark:bg-surface-800/30">
                <td [attr.colspan]="totalColumnCount()" [class]="expansionCellClass()">
                  <ng-container [ngTemplateOutlet]="expTpl" [ngTemplateOutletContext]="{ $implicit: row, rowIndex: i }" />
                </td>
              </tr>
            }
          } @empty {
            <tr>
              <td [attr.colspan]="totalColumnCount()" class="px-3 py-8 text-center text-surface-500 dark:text-surface-400">{{ emptyLabel() }}</td>
            </tr>
          }
        </tbody>
      </table>
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
  /** `'multiple'` layers `multiSortMeta` on top — `sortField`/`sortOrder` stay exactly as-is for `'single'` consumers. */
  readonly sortMode = input<TableSortMode>('single');
  readonly multiSortMeta = model<readonly TableSortMeta[]>([]);
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly globalFilterValue = model('');
  /** Narrows which columns `filterable`'s global search scans — unset (default): every declared column, same as before this input existed. */
  readonly globalFilterFields = input<readonly string[] | null>(null);
  /** Debounces committing a keystroke to `globalFilterValue` (and therefore to `filteredValue()`) — the `<input>` itself still reflects every keystroke immediately, see class doc. */
  readonly filterDelay = input(300, { transform: numberAttribute });
  /** Presentational only — dims the table and overlays a spinner, see class doc. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Reinterprets `value()` as "current page only, already filtered/sorted server-side" — see class doc's "lazy" section. */
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly totalRecords = input<number | null>(null);
  /** `'cell'` only — see class doc for why `'row'` is a documented cut this pass. */
  readonly editMode = input<'cell' | null>(null);
  /** `'subheader'` only — see class doc for why `'rowspan'` is a documented cut this pass. */
  readonly rowGroupMode = input<'subheader' | null>(null);
  readonly groupRowsBy = input<string | null>(null);
  readonly reorderable = input(false, { transform: booleanAttribute });
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  readonly scrollable = input(false, { transform: booleanAttribute });
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
  readonly rowSelect = output<T>();
  readonly rowUnselect = output<T>();
  readonly sort = output<{ readonly field: string | null; readonly order: TableSortOrder; readonly multiSortMeta: readonly TableSortMeta[]; readonly data: readonly T[] }>();
  readonly filter = output<{ readonly value: string; readonly data: readonly T[] }>();
  readonly rowReorder = output<TableRowReorderEvent>();
  readonly rowExpand = output<T>();
  readonly rowCollapse = output<T>();
  readonly colResize = output<{ readonly element: HTMLElement; readonly delta: number }>();

  protected readonly columns = contentChildren(TableColumnComponent);
  protected readonly groupHeaderTemplate = contentChild('groupHeader', { read: TemplateRef });
  protected readonly rowExpansionTemplate = contentChild('rowexpansion', { read: TemplateRef });
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly checkboxBoxClass = checkboxBoxVariants({ size: 'sm' });
  protected readonly radioRingClass = radioRingVariants({ size: 'sm' });
  protected readonly radioDotClass = `${DOT_SIZE_CLASS.sm} rounded-full bg-brand-500 dark:bg-brand-400`;
  /** Shared `name` of the row radios, unique per table instance so two tables on a page keep independent groups. */
  protected readonly radioGroupName = `med-data-table-radio-${nextRadioGroupId++}`;
  protected readonly wrapperClass = computed(() => mergeClasses('relative w-full overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700', this.class()));

  private readonly editingCell = signal<{ row: T; field: string } | null>(null);
  private readonly resizedColumnWidths = signal<ReadonlyMap<string, number>>(new Map());
  private colResizeState: { field: string; startX: number; startWidth: number; element: HTMLElement } | null = null;
  private readonly browserReady = signal(false);
  private readonly restoredKey = signal<string | null>(null);
  /** Undebounced — bound directly to the `<input>` so every keystroke is visible immediately; `filterDelay` only delays writing into `globalFilterValue`, see class doc. */
  protected readonly filterInputText = signal('');
  private filterDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private draggedRowIndex: number | null = null;

  constructor() {
    // Restoring only after the first render keeps the first client render identical to the server-rendered markup. Restoring
    // earlier changes the state before hydration reconciles the DOM, and the class bindings then leave stale server classes behind
    // (for example two "current page" buttons in the paginator).
    afterNextRender(() => this.browserReady.set(true));

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
      // Never persist before the stored state was restored, or the initial defaults would overwrite it.
      if (!key || this.restoredKey() !== key) {
        return;
      }
      this.persistTableState(key, { first, sortField, sortOrder, expandedRowKeys });
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
    const query = this.globalFilterValue().trim().toLowerCase();
    if (!query) {
      return this.value();
    }
    const fields = this.globalFilterFields() ?? this.columns().map((col) => col.field());
    return this.value().filter((row) => fields.some((field) => this.rowFieldValue(row, field).toLowerCase().includes(query)));
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
  private readonly effectiveGroupField = computed(() => (this.rowGroupMode() === 'subheader' ? this.groupRowsBy() : null));

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

  protected readonly totalColumnCount = computed(() => this.columns().length + (this.selectionMode() === 'multiple' || this.selectionMode() === 'radio' ? 1 : 0) + (this.reorderable() ? 1 : 0));

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

  /** A group boundary starts at `index` when `rowGroupMode()` is on and either it's the first row or the previous row's group value differs. */
  protected isGroupStart(row: T, index: number): boolean {
    const field = this.effectiveGroupField();
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
  protected utilityCellClass(extra: string, narrow = false): string {
    const pad = SIZE_PADDING_CLASS[this.size()];
    return mergeClasses(narrow ? pad.replace(/px-\S+/, 'px-2') : pad, extra, this.gridClass());
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
      col.sortable()
        ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400'
        : '',
    );
  }

  protected cellClass(col: TableColumnComponent): string {
    return mergeClasses(SIZE_PADDING_CLASS[this.size()], 'text-surface-900 dark:text-surface-50', ALIGN_CLASS[col.align()], this.gridClass());
  }

  protected rowClassFor(row: T, index: number): string {
    const striped = this.stripedRows() && index % 2 === 1;
    return mergeClasses(
      'border-b border-surface-200 last:border-b-0 dark:border-surface-700',
      this.selectionMode() ? 'cursor-pointer' : '',
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
    if (!col.sortable()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleSort(col.field(), event.shiftKey);
    }
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
      const next: TableSortOrder = this.sortOrder() === 'asc' ? 'desc' : this.sortOrder() === 'desc' ? null : 'asc';
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
    const editing = this.editingCell();
    return editing !== null && editing.row === row && editing.field === col.field();
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
   * Exports `sortedValue()` (every currently filtered/sorted row, not just
   * the visible page) as CSV, or just `selection()` when `{ selectionOnly:
   * true }` is passed. See class doc for the escaping rule and why this is
   * a plain method rather than a rendered button.
   */
  exportCSV(options?: { readonly selectionOnly?: boolean }): void {
    const rows = options?.selectionOnly ? this.selectionAsArray() : this.sortedValue();
    const cols = this.columns();
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

  protected onColResizeStart(event: PointerEvent, col: TableColumnComponent): void {
    const th = (event.currentTarget as HTMLElement).closest('th') as HTMLElement | null;
    if (!th) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.colResizeState = {
      field: col.field(),
      startX: event.clientX,
      startWidth: th.getBoundingClientRect().width || 100,
      element: th,
    };
  }

  protected onColResizeMove(event: PointerEvent): void {
    const state = this.colResizeState;
    if (!state) {
      return;
    }
    const nextWidth = Math.max(40, Math.round(state.startWidth + (event.clientX - state.startX)));
    this.resizedColumnWidths.update((map) => new Map(map).set(state.field, nextWidth));
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
    } catch {
      // Ignore malformed stored state.
    }
  }

  private persistTableState(
    key: string,
    state: {
      first: number;
      sortField: string | null;
      sortOrder: TableSortOrder;
      expandedRowKeys: Record<string, boolean>;
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
