import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, contentChild, contentChildren, input, linkedSignal, model, output } from '@angular/core';
import { TableColumnAlign, TableFilterMatchMode, TableFilterType, TableSortCompare } from './data-table.types';

/**
 * Pure column *metadata*, declared as a content child of `<med-data-table>` (`<med-table-column
 * field="name" header="Name" sortable />`) — same "children declared directly in the consumer's
 * template" precedent Tabs/Accordion/SplitterPanel already established, rather than a `columns`
 * data-array input. Renders nothing itself (`host: { class: 'hidden' }`, same convention
 * Menu/Drawer use for a component that's only ever read by its parent, never displayed at its own
 * declaration site): `DataTableComponent` reads the whole `contentChildren(TableColumnComponent)`
 * list to drive its own `<thead>`/`<tbody>` entirely from its own template — there's no click or
 * other event that needs to bubble back up from inside a column the way Accordion's header click
 * does, so unlike `AccordionHost`, no DI coordinator is needed here at all.
 *
 * `field` is a plain `string` key into each row (`row[field]`), not
 * `keyof T` — `DataTableComponent<T>` stays fully generic while this
 * component itself isn't, so there's no generic parameter here to constrain
 * against; the same relaxation this library already accepts for
 * `DataViewComponent`'s `sortComparator` staying a plain function rather
 * than a field-name API.
 *
 * An optional projected `<ng-template let-row let-rowIndex="rowIndex">`
 * replaces the default `row[field]` text rendering for that column (a
 * formatted currency value, a Tag/Badge, a row of action buttons, ...).
 *
 * **`editable` + a second named template (`#editTemplate`)**, for `DataTableComponent`'s
 * `editMode="cell"`). `contentChild(TemplateRef)` alone only ever resolves the *first* matching
 * `<ng-template>`, so telling the display template apart from the edit one needs a second,
 * explicitly-named query (`contentChild('editTemplate', { read: TemplateRef })`) rather than a
 * second bare `contentChild(TemplateRef)` — the consumer marks their own edit template with a
 * `#editTemplate` reference variable (`<ng-template #editTemplate let-row let-onSave="onSave"
 * let-onCancel="onCancel">`), the same plain Angular idiom this library otherwise doesn't need
 * since every other component so far has only ever needed one projected template per content-child
 * slot.
 *
 * **Named `#header`, `#footer` and custom sorting.** A `<ng-template #header>` replaces the `header` text in the
 * column's header cell; the `header` text stays the plain-text name used by filter labels, move announcements, stacked
 * labels and CSV export. `footer` text or a `<ng-template #footer>` fills the column's footer cell, and the template
 * wins when both are set; it receives every filtered and sorted row across all pages as `$implicit`. `sortBy` names
 * the row property to compare, and `sortCompare` gives a full ascending comparator that takes precedence over it. The
 * table reads these inputs in `DataTableComponent`, which renders the header and footer cells.
 *
 * **`frozen`/`alignFrozen`** keep a column in view while the table scrolls horizontally, in `DataTableComponent` and
 * `TreeTableComponent` alike. Deliberately **not** computed imperatively with pixel offsets (a `ResizeObserver`
 * plus a window `resize` listener would recompute them, the shape behind the known "doesn't
 * recompute when the layout changes" bug): each table derives every frozen column's `left`/`right` offset
 * declaratively from the column widths and applies plain CSS `position: sticky`, so the browser handles
 * stickiness natively with no JS recomputation loop.
 */
@Component({
  selector: 'med-table-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: ``,
})
export class TableColumnComponent {
  readonly field = input.required<string>();
  readonly header = input('');
  readonly sortable = input(false, { transform: booleanAttribute });
  /**
   * Name of the row property that sorting by this column compares, when it is not the `field`. The sort state, events and
   * persisted state still name the column by its `field`.
   */
  readonly sortBy = input<string | null>(null);
  /**
   * Compares two rows for ascending order when sorting by this column; takes precedence over `sortBy`. A descending sort reverses
   * its result. Ignored in `lazy` mode, where the application sorts.
   */
  readonly sortCompare = input<TableSortCompare | null>(null);
  readonly align = input<TableColumnAlign>('left');
  readonly width = input<string | null>(null);
  readonly editable = input(false, { transform: booleanAttribute });
  readonly frozen = input(false, { transform: booleanAttribute });
  /** Emits when the table updates the column's frozen state during cross-boundary column reorder, enabling `[(frozen)]`. */
  readonly frozenChange = output<boolean>();
  /** Effective frozen state used by `DataTableComponent`; resets whenever the `frozen` input changes. */
  readonly isFrozen = linkedSignal(() => this.frozen());
  /** Frozen edge alignment (`'left'` or `'right'`), two-way bindable via `[(alignFrozen)]`. */
  readonly alignFrozen = model<'left' | 'right'>('left');
  /** Merges consecutive rows on the displayed page that share the same raw cell value in this column via `rowspan`. */
  readonly merge = input(false, { transform: booleanAttribute });

  /** Updates the effective frozen state and edge alignment, emitting change outputs only when they differ. */
  applyFrozenState(frozen: boolean, alignFrozen: 'left' | 'right'): void {
    if (this.isFrozen() !== frozen) {
      this.isFrozen.set(frozen);
      this.frozenChange.emit(frozen);
    }
    if (this.alignFrozen() !== alignFrozen) {
      this.alignFrozen.set(alignFrozen);
    }
  }
  /**
   * Text shown before each of this column's cells while the table is stacked. Unset, the column's `header` is used; with neither,
   * the cells show no label. The table adds no text of its own.
   */
  readonly stackLabel = input<string | null>(null);
  /**
   * Shows or hides the column. While `false` the table renders no header, body or footer cell for it and leaves it out of
   * column spans, frozen offsets and CSV export; its sort state, filter matching and resized width are kept, so setting it
   * back to `true` restores the column as it was.
   *
   * This input (and any value restored from persisted state) is presentation only, not access control. A column a user must
   * not see has to be omitted from the template and its data omitted from `value`, rather than declared `visible="false"`.
   */
  readonly visible = input(true, { transform: booleanAttribute });
  /** Emits when the table changes the column's visibility from stored state, enabling `[(visible)]`. */
  readonly visibleChange = output<boolean>();
  /** Effective column visibility used by the table; resets whenever the `visible` input changes, and can be overridden on restore. */
  readonly isVisible = linkedSignal(() => this.visible());

  /** Applies a visibility value restored from persisted state, emitting `visibleChange` only when it differs. */
  applyRestoredVisibility(next: boolean): void {
    if (this.isVisible() === next) {
      return;
    }
    this.isVisible.set(next);
    this.visibleChange.emit(next);
  }
  /**
   * Whether the user can move this column by dragging its header or with Alt+ArrowLeft/Right on the focused header.
   * Set it to `false` to pin the column's position; other columns cannot be dropped onto it either.
   */
  readonly reorderable = input(true, { transform: booleanAttribute });
  /** Adds a funnel button to the header that opens a filter menu for this column. */
  readonly columnFilter = input(false, { transform: booleanAttribute });
  /** Value type of the column's filter: decides the value control and the match modes offered. */
  readonly filterType = input<TableFilterType>('text');
  /** Match mode preselected in the filter menu when it is offered; defaults to the first mode of the type. */
  readonly filterMatchMode = input<TableFilterMatchMode | null>(null);
  /** Restricts the offered match modes to those listed here that belong to `filterType`. */
  readonly filterMatchModes = input<readonly TableFilterMatchMode[] | null>(null);
  /** Explicit options offered by the UI when using the `in` match mode (each a value or `{ label, value }` option). */
  readonly filterOptions = input<readonly unknown[] | null>(null);
  /** Custom `#filter` template rendered in place of the default filter control in both `'row'` and `'menu'` filter modes. */
  readonly filterTemplate = contentChild('filter', { read: TemplateRef });

  /**
   * The projected `<ng-template #header>` that replaces the `header` text inside the column's header cell. The `header` text stays
   * the column's plain-text name wherever the table needs one (column filter labels, move announcements, stacked labels, CSV export).
   */
  readonly headerTemplate = contentChild('header', { read: TemplateRef });
  /**
   * Text of the column's footer cell, shown when the table renders a column footer row. A `#footer` template takes its place
   * when both are set. The table gives the template every row that passes the global filter and the column rules, in sorted order
   * across all pages (with `lazy`, the current `value`), as `$implicit`.
   */
  readonly footer = input<string | null>(null);
  /** The projected `<ng-template #footer>` that renders the column's footer cell. */
  readonly footerTemplate = contentChild('footer', { read: TemplateRef });
  /** Every `<ng-template>` projected directly into the column, in document order. */
  private readonly projectedTemplates = contentChildren(TemplateRef);
  /**
   * The projected `<ng-template>` that renders the body cells: the first one that is not a reserved named template, so an
   * unnamed template written after `#header` still renders the cells.
   */
  readonly cellTemplate = computed(() => {
    // Angular may hand out a new `TemplateRef` object per read, so templates are told apart by their anchor node.
    const reserved = new Set([this.headerTemplate(), this.footerTemplate(), this.editTemplate(), this.filterTemplate()].map((template) => template?.elementRef.nativeElement));
    return this.projectedTemplates().find((template) => !reserved.has(template.elementRef.nativeElement));
  });
  readonly editTemplate = contentChild('editTemplate', { read: TemplateRef });
}
