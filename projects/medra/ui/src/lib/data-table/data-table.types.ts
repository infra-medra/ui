export type TableSortOrder = 'asc' | 'desc' | null;
/** Cell padding and text size of a `med-data-table`. */
export type TableSize = 'sm' | 'default' | 'lg';

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
