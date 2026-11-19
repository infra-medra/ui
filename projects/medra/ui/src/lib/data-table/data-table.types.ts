export type TableSortOrder = 'asc' | 'desc' | null;
export type TableSelectionMode = 'single' | 'multiple' | null;
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
