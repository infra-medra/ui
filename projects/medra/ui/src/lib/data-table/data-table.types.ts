export type TableSortOrder = 'asc' | 'desc' | null;
/** Cell padding and text size of a `med-data-table`. */
export type TableSize = 'sm' | 'default' | 'lg';
/** Loading presentation of a `med-data-table`: overlay spinner or skeleton rows. */
export type TableLoadingMode = 'spinner' | 'skeleton';

export type TableSelectionMode = 'single' | 'multiple' | 'radio' | null;
export type TableColumnAlign = 'left' | 'center' | 'right';
export type TableSortMode = 'single' | 'multiple';

export interface TableSortMeta {
  readonly field: string;
  readonly order: TableSortOrder;
}

/** Emitted by `lazyLoad` (`DataTableComponent`'s `lazy` mode) — everything a server-side data source needs to fetch the right page. */
export interface TableLazyLoadEvent {
  readonly first: number;
  readonly rows: number;
  readonly sortField: string | null;
  readonly sortOrder: TableSortOrder;
  readonly multiSortMeta: readonly TableSortMeta[];
  readonly filter: string;
  /** Active column filter rules keyed by field; the data source applies them, since a lazy table does not filter `value` itself. */
  readonly columnFilters: TableColumnFilters;
}

/** Emitted by `rowReorder` (`DataTableComponent`'s `reorderable`) — indices into `value()`, not the currently displayed (sorted/filtered/paged) view. */
export interface TableRowReorderEvent {
  readonly dragIndex: number;
  readonly dropIndex: number;
}

/** Emitted by `colReorder` (`DataTableComponent`) when the user moves a column — indices into the full declared-column order, hidden columns included. */
export interface TableColumnReorderEvent {
  readonly dragIndex: number;
  readonly dropIndex: number;
  /** Field names of every column in the new order. */
  readonly columns: readonly string[];
}

/** Emitted by `rowEditComplete` (`DataTableComponent`) when the user saves a row in `editMode="row"`. */
export interface TableRowEditEvent<T = unknown> {
  readonly row: T;
  /** The value of each editable field, keyed by field name, as given by its edit template. */
  readonly values: Readonly<Record<string, unknown>>;
}

/** Value type of a column filter; decides the control in the filter menu and the match modes offered. */
export type TableFilterType = 'text' | 'numeric' | 'date';

/**
 * Match mode of a column filter rule. Text: `contains`, `notContains`, `startsWith`, `endsWith`, `equals`, `notEquals`.
 * Numeric: `equals`, `notEquals`, `lt`, `lte`, `gt`, `gte`. Date: `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`.
 */
export type TableFilterMatchMode =
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'dateIs'
  | 'dateIsNot'
  | 'dateBefore'
  | 'dateAfter';

/** A rule applied to one column: a match mode and the value to compare cells against. A `null`, empty or `NaN` value makes the rule inactive. */
export interface TableColumnFilter {
  readonly matchMode: TableFilterMatchMode;
  readonly value: string | number | Date | null;
}

/** Active column filter rules, keyed by column `field`. */
export type TableColumnFilters = Readonly<Record<string, TableColumnFilter>>;

/** Cell selection coordinate stored in `selection` and emitted by `cellSelect`/`cellUnselect` when `cellSelection` is active. */
export interface TableCellSelection<T = unknown> {
  readonly row: T;
  readonly field: string;
}

/** Emitted by `contextMenuSelect` (`DataTableComponent`) when a context menu is invoked on a body row. */
export interface TableContextMenuSelectEvent<T = unknown> {
  readonly originalEvent: Event;
  readonly row: T;
  readonly field?: string;
}
