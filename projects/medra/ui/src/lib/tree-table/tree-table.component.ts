import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, contentChildren, input, linkedSignal, model, numberAttribute, output, signal, viewChild, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IconComponent } from '../icon/icon.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TableSortMeta, TableSortMode, TableSortOrder } from '../data-table/data-table.types';
import { TableColumnComponent } from '../data-table/table-column.component';
import { mergeClasses } from '../utils/merge-classes';
import { TreeTableNode } from './tree-table.types';

interface VisibleRow<T> {
  readonly node: TreeTableNode<T>;
  readonly depth: number;
  /** 1-based, matching `aria-level`'s own convention — position and count among same-depth, same-parent siblings, same as `TreeComponent`'s own `aria-posinset`/`aria-setsize`. */
  readonly posinset: number;
  readonly setsize: number;
}

const MIN_COLUMN_WIDTH_PX = 60;
const DEFAULT_GRID_COLUMN_WIDTH = 'minmax(120px, 1fr)';

/**
 * TreeTable primitive (Tier 4): `DataTable`'s column model
 * (`<med-table-column>`, reused unchanged — same `field`/`header`/
 * `cellTemplate` contract) applied to hierarchical rows instead of a flat
 * `T[]`. Rows can't reuse `TreeNodeComponent`'s recursive-component
 * approach the way `TreeComponent` does: a `<tr>` can't nest another
 * `<tr>` inside it, every row has to be a direct sibling at the same
 * `<table>` level for the columns to actually line up. Instead, the tree is
 * flattened into an ordered `{ node, depth }[]` (only descending into a
 * node's children when it's expanded) and rendered as one flat `@for` —
 * the first column's cell adds the indent (`depth * 1.25rem` padding) and
 * the expand/collapse toggle, every other column renders exactly like
 * `DataTable`'s own.
 *
 * **Expand/collapse state lives in a `Map<TreeTableNode<T>, boolean>`
 * signal on this component**, not mutated onto the node objects themselves
 * (unlike a mutate-in-place approach some tree-table implementations take)
 * — this component doesn't own the consumer's data, only which of it is
 * currently visible.
 *
 * **Scope cut for v1**: no sorting, filtering, pagination, or row
 * selection — each of `DataTable`'s own features that don't have an
 * obviously "correct" meaning once rows have a hierarchy (does sorting
 * reorder siblings within each level, or flatten the whole tree by column
 * value regardless of parent/child? does "select all" mean every visible
 * row, or the whole tree including collapsed branches?) rather than a
 * mechanical port of DataTable's existing logic. This release focuses on
 * getting the flattening/indent/expand mechanics right first; each of
 * those can layer on top of `visibleRows` later without an API break.
 *
 * **`columnResizable` + `virtualScroll`, reopening documented cuts**
 *. `columnResizable` works in the existing real
 * `<table>` unchanged — a drag handle on each `<th>`'s trailing edge
 * (same `setPointerCapture` + template-bound `pointermove`/`pointerup`/
 * `pointercancel` pattern `DialogShellComponent`'s own resize handle
 * already uses) writes into a `Map<TableColumnComponent, number>` of
 * pixel widths, applied via `[style.width.px]` same as the existing
 * `col.width()` input already was.
 *
 * **`virtualScroll` deliberately does NOT reuse the real `<table>`
 * markup at all** — `DataTableComponent`'s own class doc explains why it
 * has no virtual scrolling in the first place: combining a real `<table>`
 * with CDK's transform-based virtualization is exactly the known-bug
 * combination it cites avoiding (#18917, #17529). Rather than inheriting
 * that same risk here, `virtualScroll` switches to a from-scratch CSS
 * Grid row layout (`display: grid`, one shared `grid-template-columns`
 * string computed once and applied identically to the header and every
 * row) — the same technique production virtualized data grids generally
 * use instead of a real `<table>` for exactly this reason. A shared
 * `grid-template-columns` also happens to be exactly what virtualizing
 * requires anyway: with only a handful of rows ever in the DOM, per-row
 * content-based column sizing has no stable meaning, so every column
 * needs a definite track size regardless (an explicit `columnResizable`
 * width in pixels, or a `minmax(120px, 1fr)` fallback that still shares
 * remaining space reasonably for a column with no explicit width).
 * Keyboard nav (`focusRow`) has to branch for this mode: `rowElements()`
 * only reflects whichever rows are *currently rendered* by
 * `CdkVirtualForOf`, not the full `visibleRows()` list, so a large index
 * jump (e.g. `End` on a long table) needs `scrollToIndex()` first, then
 * (same fix `TreeComponent`'s own `virtualScroll` needed, verified live
 * against a real browser via Playwright there — jsdom renders zero CDK
 * virtual-scroll rows, so this class of bug is invisible to Jest alone)
 * re-querying and re-focusing the target row on every frame for a short
 * window, since CDK can take more than one frame to settle its rendered
 * range on a large jump and may swap out the element a first-frame
 * `focus()` already landed on.
 *
 * **`editMode: 'cell'`** — the exact same shape
 * `DataTableComponent` already established (`editable`/`editTemplate` on
 * `TableColumnComponent`, double-click to enter edit, the consumer's own
 * template decides when to call `onSave(value)`/`onCancel()`), just keyed
 * by node identity instead of row identity — see that file's own doc for
 * the full reasoning, not repeated here. The first column's indent/
 * expand-toggle chrome stays visible either way; only the value portion
 * swaps between the display and edit templates.
 *
 * **`frozen`/`alignFrozen`** on `TableColumnComponent`
 * — see that file's own doc for why this is plain CSS `position: sticky`
 * with a declaratively-computed offset, not a
 * `ResizeObserver`-driven imperative recomputation. Each frozen column's `left`/`right` offset is the sum of the
 * *other* same-side frozen columns' own pixel widths ahead of it —
 * reusing `columnStyleWidth()`, the exact same signal `columnResizable`
 * already writes into, so live-resizing a frozen column already
 * reactively repositions any other frozen column next to it, for free.
 * A frozen column with no explicit `width` (and never resized) falls
 * back to `MIN_COLUMN_WIDTH_PX` for its offset contribution — a
 * documented best-effort, not a hard requirement, since an exact
 * fallback width has no single correct guess. **Any `frozen` column
 * forces `table-fixed` in `<table>` mode** (`hasFrozenColumn`, same
 * mechanism `columnResizable` already uses) — an auto-layout table is
 * free to shrink a column below its declared `width` to fit the
 * container, which would silently desync the offsets above from what's
 * actually rendered.
 */
@Component({
  selector: 'med-tree-table',
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent, PaginatorComponent, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ng-template #cellValue let-row="row" let-col="col" let-rowIdx="rowIdx">
      @if (isEditingCell(row.node, col)) {
        <ng-container
          [ngTemplateOutlet]="col.editTemplate()!"
          [ngTemplateOutletContext]="{ $implicit: row.node.data, onSave: saveEdit(row.node, col), onCancel: cancelEdit(row.node, col) }"
        />
      } @else if (col.cellTemplate(); as t) {
        <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: row.node.data, rowIndex: rowIdx }" />
      } @else {
        {{ cellText(row.node.data, col) }}
      }
    </ng-template>

    @if (virtualScroll()) {
      <div [class]="wrapperClass()">
        <div class="grid border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50" [style.grid-template-columns]="gridTemplateColumns()" role="row">
          @for (col of columns(); track col.field()) {
            <div class="relative px-3 py-2.5 font-semibold text-surface-700 dark:text-surface-200" [class]="frozenHeaderCellClass(col)" [style]="frozenStyle(col)" role="columnheader">
              {{ col.header() }}
              @if (columnResizable()) {
                <span
                  class="absolute inset-y-0 right-0 w-1 cursor-col-resize touch-none select-none hover:bg-brand-300 dark:hover:bg-brand-600"
                  aria-hidden="true"
                  (pointerdown)="onColumnResizeStart($event, col)"
                  (pointermove)="onColumnResizeMove($event)"
                  (pointerup)="onColumnResizeEnd()"
                  (pointercancel)="onColumnResizeEnd()"
                ></span>
              }
            </div>
          }
        </div>
        <cdk-virtual-scroll-viewport [itemSize]="virtualScrollItemSize()" class="h-96 w-full" role="tree" [attr.aria-label]="ariaLabel()">
          @if (visibleRows().length === 0) {
            <div class="px-3 py-8 text-center text-surface-500 dark:text-surface-400">{{ emptyLabel() }}</div>
          }
          <div
            #rowEl
            *cdkVirtualFor="let row of visibleRows(); trackBy: trackRow; let rowIdx = index"
            class="group grid border-b border-surface-200 last:border-b-0 hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-inset focus-visible:ring-brand-500 dark:border-surface-700 dark:hover:bg-surface-800/50 dark:focus-visible:ring-brand-400"
            [style.grid-template-columns]="gridTemplateColumns()"
            [style.height.px]="virtualScrollItemSize()"
            [attr.data-row-index]="rowIdx"
            [tabIndex]="tabIndexFor(rowIdx)"
            role="row"
            [attr.aria-level]="row.depth + 1"
            [attr.aria-posinset]="row.posinset"
            [attr.aria-setsize]="row.setsize"
            [attr.aria-expanded]="hasChildren(row.node) ? isExpanded(row.node) : null"
            (focus)="onRowFocus(rowIdx)"
            (keydown)="onRowKeydown($event, rowIdx)"
          >
            @for (col of columns(); track col.field(); let first = $first) {
              <div
                class="flex items-center px-3 py-2.5 text-surface-900 dark:text-surface-50"
                [class]="frozenCellClass(col)"
                [style]="frozenStyle(col)"
                (dblclick)="onCellDblClick($event, row.node, col)"
              >
                @if (first) {
                  <span class="inline-flex items-center gap-1" [style.padding-left.rem]="row.depth * 1.25">
                    @if (hasChildren(row.node)) {
                      <button
                        type="button"
                        class="shrink-0 rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                        [attr.aria-expanded]="isExpanded(row.node)"
                        [attr.aria-label]="isExpanded(row.node) ? collapseLabel() : expandLabel()"
                        (click)="toggleExpanded(row.node)"
                      >
                        <med-icon name="chevron-down" variant="mini" class="size-3.5" [class]="isExpanded(row.node) ? '' : '-rotate-90'" />
                      </button>
                    } @else {
                      <span class="size-4 shrink-0"></span>
                    }
                    <ng-container [ngTemplateOutlet]="cellValue" [ngTemplateOutletContext]="{ row: row, col: col, rowIdx: rowIdx }" />
                  </span>
                } @else {
                  <ng-container [ngTemplateOutlet]="cellValue" [ngTemplateOutletContext]="{ row: row, col: col, rowIdx: rowIdx }" />
                }
              </div>
            }
          </div>
        </cdk-virtual-scroll-viewport>
      </div>
    } @else {
      <div [class]="wrapperClass()">
        <table class="w-full border-collapse text-left text-sm" [class.table-fixed]="columnResizable() || hasFrozenColumn()" [attr.aria-label]="ariaLabel()">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50">
              @for (col of columns(); track col.field()) {
                <th
                  scope="col"
                  [style.width]="columnStyleWidth(col)"
                  class="relative px-3 py-2.5 font-semibold text-surface-700 dark:text-surface-200"
                  [class]="frozenHeaderCellClass(col)"
                  [class.cursor-pointer]="col.sortable()"
                  [style]="frozenStyle(col)"
                  [attr.aria-sort]="ariaSortFor(col)"
                  (click)="onHeaderClick(col, $event)"
                >
                  {{ col.header() }}
                  @if (columnResizable()) {
                    <span
                      class="absolute inset-y-0 right-0 w-1 cursor-col-resize touch-none select-none hover:bg-brand-300 dark:hover:bg-brand-600"
                      aria-hidden="true"
                      (click)="$event.stopPropagation()"
                      (pointerdown)="onColumnResizeStart($event, col)"
                      (pointermove)="onColumnResizeMove($event)"
                      (pointerup)="onColumnResizeEnd()"
                      (pointercancel)="onColumnResizeEnd()"
                    ></span>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of pagedRows(); track row.node; let rowIdx = $index) {
              <tr
                #rowEl
                class="group border-b border-surface-200 last:border-b-0 hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-inset focus-visible:ring-brand-500 dark:border-surface-700 dark:hover:bg-surface-800/50 dark:focus-visible:ring-brand-400"
                [class.bg-brand-50]="isSelected(row.node)"
                [class.dark:bg-brand-500/10]="isSelected(row.node)"
                [class.cursor-pointer]="selectionMode() !== null"
                [tabIndex]="tabIndexFor(rowIdx)"
                [attr.aria-level]="row.depth + 1"
                [attr.aria-posinset]="row.posinset"
                [attr.aria-setsize]="row.setsize"
                [attr.aria-expanded]="hasChildren(row.node) ? isExpanded(row.node) : null"
                [attr.aria-selected]="selectionMode() ? isSelected(row.node) : null"
                (click)="onRowClick(row.node)"
                (focus)="onRowFocus(rowIdx)"
                (keydown)="onRowKeydown($event, rowIdx)"
              >
                @for (col of columns(); track col.field(); let first = $first) {
                  <td class="px-3 py-2.5 text-surface-900 dark:text-surface-50" [class]="frozenCellClass(col)" [style]="frozenStyle(col)" (dblclick)="onCellDblClick($event, row.node, col)">
                    @if (first) {
                      <span class="inline-flex items-center gap-1" [style.padding-left.rem]="row.depth * 1.25">
                        @if (hasChildren(row.node)) {
                          <button
                            type="button"
                            class="shrink-0 rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                            [attr.aria-expanded]="isExpanded(row.node)"
                            [attr.aria-label]="isExpanded(row.node) ? collapseLabel() : expandLabel()"
                            (click)="toggleExpanded(row.node)"
                          >
                            <med-icon name="chevron-down" variant="mini" class="size-3.5" [class]="isExpanded(row.node) ? '' : '-rotate-90'" />
                          </button>
                        } @else {
                          <span class="size-4 shrink-0"></span>
                        }
                        <ng-container [ngTemplateOutlet]="cellValue" [ngTemplateOutletContext]="{ row: row, col: col, rowIdx: rowIdx }" />
                      </span>
                    } @else {
                      <ng-container [ngTemplateOutlet]="cellValue" [ngTemplateOutletContext]="{ row: row, col: col, rowIdx: rowIdx }" />
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns().length" class="px-3 py-8 text-center text-surface-500 dark:text-surface-400">{{ emptyLabel() }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (paginator() && visibleRows().length > 0) {
        <med-paginator class="mt-3 block" [totalRecords]="visibleRows().length" [(rows)]="pageSize" [rowsPerPageOptions]="rowsPerPageOptions()" [(first)]="first" />
      }
    }
  `,
})
export class TreeTableComponent<T> {
  readonly value = input<readonly TreeTableNode<T>[]>([]);
  readonly ariaLabel = input<string | null>(null);
  readonly emptyLabel = input('No results found');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly expandLabel = input('Expand');
  readonly collapseLabel = input('Collapse');
  /** Drag the trailing edge of a `<th>` to resize it — works in both rendering modes. */
  readonly columnResizable = input(false, { transform: booleanAttribute });
  /** Switches to a CSS Grid + `CdkVirtualScrollViewport` rendering path instead of a real `<table>` — see class doc. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input(36, { transform: numberAttribute });
  /** A column opts in with `editable`/`editTemplate` on `TableColumnComponent` — see class doc. */
  readonly editMode = input<'cell' | null>(null);
  readonly selectionMode = input<'single' | 'multiple' | null>(null);
  readonly selection = model<TreeTableNode<T> | readonly TreeTableNode<T>[] | null>(null);
  readonly sortMode = input<TableSortMode>('single');
  readonly sortField = model<string | null>(null);
  readonly sortOrder = model<TableSortOrder>(null);
  readonly multiSortMeta = model<readonly TableSortMeta[]>([]);
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly rows = input(10, { transform: numberAttribute });
  /** The page size in effect: follows `rows()`, and the paginator's "rows per page" select writes to it, so the visible slice follows the user's choice. */
  protected readonly pageSize = linkedSignal(() => this.rows());
  readonly rowsPerPageOptions = input<readonly number[] | null>(null);
  readonly first = model(0);
  readonly class = input('', { alias: 'class' });

  readonly editComplete = output<{ readonly node: TreeTableNode<T>; readonly field: string; readonly value: unknown }>();
  readonly editCancel = output<{ readonly node: TreeTableNode<T>; readonly field: string }>();
  readonly nodeSelect = output<TreeTableNode<T>>();
  readonly nodeUnselect = output<TreeTableNode<T>>();

  protected readonly columns = contentChildren(TableColumnComponent);

  /** Replaced (not mutated) on every toggle, so `visibleRows` — a `computed()` — actually re-runs; a signal only notifies subscribers on its own `.set()`/`.update()`, never on a plain object/Map mutation. */
  private readonly expandOverrides = signal<ReadonlyMap<TreeTableNode<T>, boolean>>(new Map());

  /** Roving tabindex across body rows (Wave 2 fix — rows previously carried no `tabindex`/keyboard model at all beyond the native toggle `<button>`). */
  private readonly rovingRowIndex = signal(0);

  private readonly rowElements = viewChildren<ElementRef<HTMLElement>>('rowEl');
  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  private readonly columnWidths = signal<ReadonlyMap<TableColumnComponent, number>>(new Map());
  private resizeStart: { pointerX: number; width: number; column: TableColumnComponent } | null = null;

  private readonly editingCell = signal<{ node: TreeTableNode<T>; field: string } | null>(null);

  protected readonly wrapperClass = computed(() => mergeClasses('w-full overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700', this.class()));

  protected readonly gridTemplateColumns = computed(() => this.columns().map((col) => this.columnStyleWidth(col) ?? DEFAULT_GRID_COLUMN_WIDTH).join(' '));

  protected readonly sortedNodes = computed<readonly TreeTableNode<T>[]>(() => {
    const metas =
      this.sortMode() === 'multiple'
        ? this.multiSortMeta()
        : this.sortField() && this.sortOrder()
          ? [{ field: this.sortField()!, order: this.sortOrder()! }]
          : [];
    if (metas.length === 0) {
      return this.value();
    }
    const compare = (a: TreeTableNode<T>, b: TreeTableNode<T>): number => {
      for (const meta of metas) {
        const dir = meta.order === 'desc' ? -1 : 1;
        const va = (a.data as Record<string, unknown>)[meta.field];
        const vb = (b.data as Record<string, unknown>)[meta.field];
        if (va === vb) {
          continue;
        }
        if (va == null) {
          return -1 * dir;
        }
        if (vb == null) {
          return 1 * dir;
        }
        const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
        if (cmp !== 0) {
          return cmp * dir;
        }
      }
      return 0;
    };
    const sortTree = (nodes: readonly TreeTableNode<T>[]): readonly TreeTableNode<T>[] =>
      [...nodes]
        .sort(compare)
        .map((node) => (node.children?.length ? { ...node, children: sortTree(node.children) } : node));
    return sortTree(this.value());
  });

  protected readonly visibleRows = computed<readonly VisibleRow<T>[]>(() => {
    const overrides = this.expandOverrides();
    const result: VisibleRow<T>[] = [];
    const isExpanded = (node: TreeTableNode<T>) => overrides.get(node) ?? node.expanded !== false;
    const walk = (nodes: readonly TreeTableNode<T>[], depth: number) => {
      nodes.forEach((node, i) => {
        result.push({ node, depth, posinset: i + 1, setsize: nodes.length });
        if (node.children?.length && isExpanded(node)) {
          walk(node.children, depth + 1);
        }
      });
    };
    walk(this.sortedNodes(), 0);
    return result;
  });

  protected readonly pagedRows = computed<readonly VisibleRow<T>[]>(() => {
    const rows = this.visibleRows();
    if (!this.paginator()) {
      return rows;
    }
    const start = Math.max(0, this.first());
    return rows.slice(start, start + Math.max(1, this.pageSize()));
  });

  protected isSelected(node: TreeTableNode<T>): boolean {
    const sel = this.selection();
    if (this.selectionMode() === 'single') {
      return sel === node;
    }
    return Array.isArray(sel) && (sel as readonly TreeTableNode<T>[]).includes(node);
  }

  protected onRowClick(node: TreeTableNode<T>): void {
    const mode = this.selectionMode();
    if (!mode) {
      return;
    }
    if (mode === 'single') {
      if (this.selection() === node) {
        return;
      }
      this.selection.set(node);
      this.nodeSelect.emit(node);
      return;
    }
    const current = Array.isArray(this.selection()) ? (this.selection() as readonly TreeTableNode<T>[]) : [];
    if (current.includes(node)) {
      this.selection.set(current.filter((n) => n !== node));
      this.nodeUnselect.emit(node);
    } else {
      this.selection.set([...current, node]);
      this.nodeSelect.emit(node);
    }
  }

  protected ariaSortFor(col: TableColumnComponent): string | null {
    if (!col.sortable()) {
      return null;
    }
    if (this.sortMode() === 'multiple') {
      const found = this.multiSortMeta().find((m) => m.field === col.field());
      return found ? (found.order === 'asc' ? 'ascending' : 'descending') : 'none';
    }
    if (this.sortField() === col.field() && this.sortOrder()) {
      return this.sortOrder() === 'asc' ? 'ascending' : 'descending';
    }
    return 'none';
  }

  protected onHeaderClick(col: TableColumnComponent, event: MouseEvent): void {
    if (!col.sortable()) {
      return;
    }
    const field = col.field();
    if (this.sortMode() === 'multiple' && event.shiftKey) {
      const current = this.multiSortMeta();
      const idx = current.findIndex((m) => m.field === field);
      if (idx === -1) {
        this.multiSortMeta.set([...current, { field, order: 'asc' }]);
      } else if (current[idx].order === 'asc') {
        this.multiSortMeta.set(current.map((m, i) => (i === idx ? { field, order: 'desc' } : m)));
      } else {
        this.multiSortMeta.set(current.filter((_, i) => i !== idx));
      }
      return;
    }
    const nextOrder: TableSortOrder = this.sortField() === field ? (this.sortOrder() === 'asc' ? 'desc' : this.sortOrder() === 'desc' ? null : 'asc') : 'asc';
    this.sortField.set(nextOrder === null ? null : field);
    this.sortOrder.set(nextOrder);
    if (this.sortMode() === 'multiple') {
      this.multiSortMeta.set(nextOrder === null ? [] : [{ field, order: nextOrder }]);
    }
  }

  /** Forces `table-fixed` in `<table>` mode, same as `columnResizable` already does — an auto-layout table is free to shrink a column below its declared `width` to fit the container, which would silently desync the sticky offsets `frozenStyle()` computes from that same declared width. */
  protected readonly hasFrozenColumn = computed(() => this.columns().some((col) => col.frozen()));

  protected hasChildren(node: TreeTableNode<T>): boolean {
    return (node.children?.length ?? 0) > 0;
  }

  protected isExpanded(node: TreeTableNode<T>): boolean {
    return this.expandOverrides().get(node) ?? node.expanded !== false;
  }

  protected toggleExpanded(node: TreeTableNode<T>): void {
    const next = new Map(this.expandOverrides());
    next.set(node, !this.isExpanded(node));
    this.expandOverrides.set(next);
  }

  protected cellText(data: T, col: TableColumnComponent): string {
    const raw = (data as Record<string, unknown>)[col.field()];
    return raw === null || raw === undefined ? '' : String(raw);
  }

  protected isEditingCell(node: TreeTableNode<T>, col: TableColumnComponent): boolean {
    const editing = this.editingCell();
    return editing !== null && editing.node === node && editing.field === col.field();
  }

  protected onCellDblClick(event: MouseEvent, node: TreeTableNode<T>, col: TableColumnComponent): void {
    if (this.editMode() !== 'cell' || !col.editable() || !col.editTemplate()) {
      return;
    }
    // Same reasoning DataTableComponent's own onCellDblClick documents: a
    // dblclick is preceded by two real click events the row's own
    // (focus)/toggle button may already have reacted to — this only stops
    // the dblclick itself bubbling further.
    event.stopPropagation();
    this.editingCell.set({ node, field: col.field() });
  }

  /** Bound once per render for the currently-editing cell only (guarded by `isEditingCell()` in the template) — same as `DataTableComponent`'s own. */
  protected saveEdit(node: TreeTableNode<T>, col: TableColumnComponent): (value: unknown) => void {
    return (value: unknown) => {
      this.editComplete.emit({ node, field: col.field(), value });
      this.editingCell.set(null);
    };
  }

  protected cancelEdit(node: TreeTableNode<T>, col: TableColumnComponent): () => void {
    return () => {
      this.editCancel.emit({ node, field: col.field() });
      this.editingCell.set(null);
    };
  }

  /**
   * Inline style object for a `frozen` column's sticky positioning, or `null` for a non-frozen one
   * — see class doc for why this is plain CSS `position: sticky` with a declaratively-computed
   * offset.
   */
  protected frozenStyle(col: TableColumnComponent): Record<string, string> | null {
    if (!col.frozen()) {
      return null;
    }
    const cols = this.columns();
    const idx = cols.indexOf(col);
    const align = col.alignFrozen();
    let offset = 0;
    if (align === 'right') {
      for (let i = idx + 1; i < cols.length; i++) {
        if (cols[i].frozen() && cols[i].alignFrozen() === 'right') {
          offset += this.frozenColumnPx(cols[i]);
        }
      }
      return { position: 'sticky', right: `${offset}px`, 'z-index': '1' };
    }
    for (let i = 0; i < idx; i++) {
      if (cols[i].frozen() && cols[i].alignFrozen() === 'left') {
        offset += this.frozenColumnPx(cols[i]);
      }
    }
    return { position: 'sticky', left: `${offset}px`, 'z-index': '1' };
  }

  /** A frozen column's own width contribution to a neighboring frozen column's offset — falls back to `MIN_COLUMN_WIDTH_PX` when unset/unparseable, see class doc. */
  private frozenColumnPx(col: TableColumnComponent): number {
    const style = this.columnStyleWidth(col);
    const parsed = style ? parseFloat(style) : NaN;
    return Number.isFinite(parsed) ? parsed : MIN_COLUMN_WIDTH_PX;
  }

  /** Opaque background (so scrolled-under content doesn't show through) + a boundary border on the scroll-facing edge. `group-hover` mirrors the row's own `hover:bg-surface-50` — a plain inherited background wouldn't reliably paint through a sticky cell in table layout. */
  protected frozenCellClass(col: TableColumnComponent): string {
    if (!col.frozen()) {
      return '';
    }
    return col.alignFrozen() === 'right'
      ? 'bg-surface-0 group-hover:bg-surface-50 border-l border-surface-200 dark:bg-surface-800 dark:group-hover:bg-surface-800/50 dark:border-surface-700'
      : 'bg-surface-0 group-hover:bg-surface-50 border-r border-surface-200 dark:bg-surface-800 dark:group-hover:bg-surface-800/50 dark:border-surface-700';
  }

  protected frozenHeaderCellClass(col: TableColumnComponent): string {
    if (!col.frozen()) {
      return '';
    }
    return col.alignFrozen() === 'right'
      ? 'bg-surface-50 border-l border-surface-200 dark:bg-surface-800/50 dark:border-surface-700'
      : 'bg-surface-50 border-r border-surface-200 dark:bg-surface-800/50 dark:border-surface-700';
  }

  protected trackRow(_index: number, row: VisibleRow<T>): TreeTableNode<T> {
    return row.node;
  }

  /** An explicit resized width always wins; otherwise falls back to the column's own static `width()` string (`<table>` mode only reads this — grid mode's `gridTemplateColumns` substitutes its own fallback track size instead when this is `null`). */
  protected columnStyleWidth(column: TableColumnComponent): string | null {
    const resized = this.columnWidths().get(column);
    if (resized !== undefined) {
      return `${resized}px`;
    }
    return column.width();
  }

  protected onColumnResizeStart(event: PointerEvent, column: TableColumnComponent): void {
    if (!this.columnResizable()) {
      return;
    }
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    const width = handle.parentElement!.getBoundingClientRect().width;
    this.resizeStart = { pointerX: event.clientX, width, column };
  }

  protected onColumnResizeMove(event: PointerEvent): void {
    if (!this.resizeStart) {
      return;
    }
    const width = Math.max(MIN_COLUMN_WIDTH_PX, this.resizeStart.width + (event.clientX - this.resizeStart.pointerX));
    const next = new Map(this.columnWidths());
    next.set(this.resizeStart.column, width);
    this.columnWidths.set(next);
  }

  protected onColumnResizeEnd(): void {
    this.resizeStart = null;
  }

  /** Only the roving row is in the Tab order (`0`); every other row is `-1` and reached via Arrow keys — same single-tab-stop model `DockComponent`'s toolbar uses. */
  protected tabIndexFor(rowIndex: number): number {
    return this.effectiveRovingRowIndex() === rowIndex ? 0 : -1;
  }

  /** A row can be focused directly (Tab landing on it) without going through `onRowKeydown` — keep the roving tab stop in sync either way. */
  protected onRowFocus(rowIndex: number): void {
    this.rovingRowIndex.set(rowIndex);
  }

  /** Falls back to the last row still in range if a collapse shrank `visibleRows` out from under the roving index. */
  private effectiveRovingRowIndex(): number {
    const count = this.visibleRows().length;
    if (count === 0) {
      return 0;
    }
    return Math.min(this.rovingRowIndex(), count - 1);
  }

  /**
   * Row-level treegrid keyboard model (Wave 2 fix — previously only the
   * expand/collapse `<button>` was keyboard-reachable, with no navigation
   * between rows at all). Up/Down move the roving tab stop by one visible
   * row; Right expands a collapsed parent or steps into its first child;
   * Left collapses an expanded parent or steps out to its own parent row;
   * Home/End jump to the first/last visible row. Deliberately row-level,
   * not full 2-D cell navigation — TreeTable has no per-cell interaction
   * (see the component's own scope-cut doc), so there is nothing for
   * column-wise Left/Right to mean beyond expand/collapse.
   */
  protected onRowKeydown(event: KeyboardEvent, rowIndex: number): void {
    const rows = this.visibleRows();
    const row = rows[rowIndex];
    if (!row) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusRow(rowIndex + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.focusRow(rowIndex - 1);
        return;
      case 'Home':
        event.preventDefault();
        this.focusRow(0);
        return;
      case 'End':
        event.preventDefault();
        this.focusRow(rows.length - 1);
        return;
      case 'ArrowRight':
        if (!this.hasChildren(row.node)) {
          return;
        }
        event.preventDefault();
        if (!this.isExpanded(row.node)) {
          this.toggleExpanded(row.node);
        } else {
          this.focusRow(rowIndex + 1);
        }
        return;
      case 'ArrowLeft': {
        if (this.hasChildren(row.node) && this.isExpanded(row.node)) {
          event.preventDefault();
          this.toggleExpanded(row.node);
          return;
        }
        const parentIndex = this.parentRowIndex(rowIndex);
        if (parentIndex !== null) {
          event.preventDefault();
          this.focusRow(parentIndex);
        }
        return;
      }
    }
  }

  private focusRow(targetIndex: number): void {
    const rows = this.visibleRows();
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return;
    }
    this.rovingRowIndex.set(targetIndex);
    if (this.virtualScroll()) {
      this.focusVirtualRowAt(targetIndex);
    } else {
      this.rowElements()[targetIndex]?.nativeElement.focus();
    }
  }

  /**
   * `rowElements()` only reflects the rows `CdkVirtualForOf` currently has
   * rendered, not the full `visibleRows()` list — a large index jump needs
   * `scrollToIndex()` first, then repeated re-focus attempts across
   * several frames, since CDK can take more than one frame to settle its
   * rendered range and may swap out the element a first-frame `focus()`
   * already landed on. See class doc's "virtualScroll" section — verified
   * live via Playwright against the real showcase, not just Jest/jsdom
   * (which renders zero CDK virtual-scroll rows and so can't exercise
   * this at all).
   */
  private focusVirtualRowAt(index: number): void {
    const vp = this.viewport();
    vp?.scrollToIndex(index, 'auto');
    this.pollFocusVirtualRow(index, 40);
  }

  private pollFocusVirtualRow(index: number, framesRemaining: number): void {
    if (framesRemaining <= 0) {
      return;
    }
    requestAnimationFrame(() => {
      this.viewport()
        ?.elementRef.nativeElement.querySelector<HTMLElement>(`[data-row-index="${index}"]`)
        ?.focus();
      this.pollFocusVirtualRow(index, framesRemaining - 1);
    });
  }

  /** The nearest preceding row at exactly one shallower depth — rows are in document order, so that's always the direct parent. */
  private parentRowIndex(rowIndex: number): number | null {
    const rows = this.visibleRows();
    const depth = rows[rowIndex].depth;
    for (let i = rowIndex - 1; i >= 0; i--) {
      if (rows[i].depth < depth) {
        return i;
      }
    }
    return null;
  }
}
