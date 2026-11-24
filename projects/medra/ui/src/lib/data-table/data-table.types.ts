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

/**
 * Compares two rows for ascending order: a negative number when `a` comes first, a positive one when `b` does, `0` when they tie.
 * Given to a column's `sortCompare` input; `T` defaults to `any` so a typed row comparator is accepted without a cast.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableSortCompare<T = any> = (a: T, b: T) => number;

/** Emitted by `lazyLoad` (`DataTableComponent`'s `lazy` mode) — everything a server-side data source needs to fetch the right page. */
export interface TableLazyLoadEvent {
  readonly first: number;
  readonly rows: number;
  readonly sortField: string | null;
  readonly sortOrder: TableSortOrder;
  /** Resolved `sortBy` property (or `sortField`) for single-column sort. */
  readonly sortBy: string | null;
  readonly multiSortMeta: readonly TableSortMeta[];
  /** Multi-sort metadata with each entry's `field` resolved to its column's `sortBy` (or `field`). */
  readonly multiSortByMeta: readonly TableSortMeta[];
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
 * Match mode of a column filter rule. Text: `contains`, `notContains`, `startsWith`, `endsWith`, `equals`, `notEquals`, `in`.
 * Numeric: `equals`, `notEquals`, `lt`, `lte`, `gt`, `gte`, `between`, `in`.
 * Date: `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`, `between`, `in`.
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
  | 'dateAfter'
  | 'between'
  | 'in';

/** Scalar value used by a single-value column filter rule or as an element of `between` / `in`. */
export type TableFilterScalar = string | number | Date | null;

/** Value stored in a {@link TableColumnFilter}: a scalar for standard modes, `[min, max]` for `between`, or an allowed-values list for `in`. */
export type TableFilterValue = TableFilterScalar | readonly TableFilterScalar[];

/** A rule applied to one column: a match mode and the value to compare cells against. A `null`, empty or `NaN` value makes the rule inactive. */
export interface TableColumnFilter {
  readonly matchMode: TableFilterMatchMode;
  readonly value: TableFilterValue;
}

/** How multiple rules on the same column combine: `'and'` requires every active rule to match; `'or'` requires at least one. */
export type TableColumnFilterOperator = 'and' | 'or';

/** Multi-rule filter group for a column: combines `rules` with `'and'` or `'or'`. */
export interface TableColumnFilterGroup {
  readonly operator: TableColumnFilterOperator;
  readonly rules: readonly TableColumnFilter[];
}

/** How per-column filters are presented: `'menu'` (popover funnel in headers, default) or `'row'` (inline filter row below headers). */
export type TableFilterDisplay = 'menu' | 'row';

/** Template context passed to a column's `<ng-template #filter>` in both `'menu'` and `'row'` filter modes. */
export interface TableColumnFilterTemplateContext {
  readonly $implicit: TableFilterValue;
  readonly filter: (value: TableFilterValue, matchMode?: TableFilterMatchMode) => void;
  readonly clear: () => void;
  readonly matchMode: TableFilterMatchMode;
}

/** Active column filter rules or rule groups, keyed by column `field`. */
export type TableColumnFilters = Readonly<Record<string, TableColumnFilter | TableColumnFilterGroup>>;

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
