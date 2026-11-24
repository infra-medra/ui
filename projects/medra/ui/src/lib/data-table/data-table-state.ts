import { FILTER_MODES_BY_TYPE } from './data-table-column-filter';
import {
  TableColumnFilter,
  TableColumnFilterGroup,
  TableColumnFilters,
  TableFilterMatchMode,
  TableFilterScalar,
  TableFilterType,
  TableSortMeta,
  TableSortOrder,
} from './data-table.types';

/** Upper bound for restored column width in pixels (M-03). */
export const MAX_COLUMN_WIDTH_PX = 10000;
/** Upper bound for unique collapsed row group names restored from storage (M-03). */
export const MAX_COLLAPSED_ROW_GROUPS = 1000;
/** Upper bound for restored global filter length in characters (M-03). */
export const MAX_GLOBAL_FILTER_LENGTH = 1000;
/** Upper bound for restored text column filter length in characters (M-03). */
export const MAX_COLUMN_FILTER_LENGTH = 1000;
/** Upper bound for restored rules per column in a filter group (L-014). */
export const MAX_COLUMN_FILTER_RULES = 20;
/** Upper bound for restored items in an `in` column filter array (L-014). */
export const MAX_COLUMN_FILTER_IN_ITEMS = 200;
/** Upper bound for restored `rows` when `rowsPerPageOptions` is unset or empty (M-03). */
export const MAX_PAGE_SIZE = 1000;

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'toString']);

/** Column metadata required by the pure stored-state parser. */
export interface StoredColumnDescriptor {
  readonly field: string;
  readonly filterType: TableFilterType;
}

/** Context passed to {@link parseStoredTableState} from the table's declared columns and options. */
export interface StoredTableStateContext {
  readonly columns: readonly StoredColumnDescriptor[];
  readonly rowsPerPageOptions?: readonly number[] | null;
}

/** Validated subset of keys recovered from stored table state. */
export interface ParsedStoredTableState {
  readonly first?: number;
  readonly sortField?: string | null;
  readonly sortOrder?: TableSortOrder;
  readonly expandedRowKeys?: Record<string, boolean>;
  readonly columnFilters?: TableColumnFilters;
  readonly columnOrder?: readonly string[];
  readonly columnWidths?: ReadonlyMap<string, number>;
  readonly columnVisibility?: Readonly<Record<string, boolean>>;
  readonly collapsedRowGroups?: readonly string[];
  readonly globalFilter?: string;
  readonly multiSortMeta?: readonly TableSortMeta[];
  readonly rows?: number;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeKey(key: string): boolean {
  return !FORBIDDEN_KEYS.has(key) && !Object.hasOwn(Object.prototype, key);
}

function isSortOrder(value: unknown): value is TableSortOrder {
  return value === 'asc' || value === 'desc' || value === null;
}

function parseFirst(raw: Record<string, unknown>): number | undefined {
  if (!Object.hasOwn(raw, 'first')) return undefined;
  const value = raw['first'];
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

function parseSort(
  raw: Record<string, unknown>,
  fields: ReadonlySet<string>,
): { sortField?: string | null; sortOrder?: TableSortOrder } {
  if (Object.hasOwn(raw, 'sortField')) {
    const field = raw['sortField'];
    const validField = field === null || (typeof field === 'string' && fields.has(field));
    if (!validField) {
      // Unknown or invalid sortField invalidates sortOrder as well (D-03).
      return {};
    }
    const result: { sortField?: string | null; sortOrder?: TableSortOrder } = { sortField: field };
    if (Object.hasOwn(raw, 'sortOrder') && isSortOrder(raw['sortOrder'])) {
      result.sortOrder = raw['sortOrder'];
    }
    return result;
  }
  if (Object.hasOwn(raw, 'sortOrder') && isSortOrder(raw['sortOrder'])) {
    return { sortOrder: raw['sortOrder'] };
  }
  return {};
}

function parseExpandedRowKeys(raw: Record<string, unknown>): Record<string, boolean> | undefined {
  if (!Object.hasOwn(raw, 'expandedRowKeys')) return undefined;
  const stored = raw['expandedRowKeys'];
  if (!isPlainRecord(stored)) return undefined;
  const result: Record<string, boolean> = Object.create(null);
  for (const key of Object.keys(stored)) {
    if (isSafeKey(key) && Object.hasOwn(stored, key) && stored[key] === true) {
      result[key] = true;
    }
  }
  return result;
}

function parseStoredFilterScalar(value: unknown, filterType: TableFilterType): TableFilterScalar | undefined {
  if (filterType === 'text') {
    return typeof value === 'string' && value.length <= MAX_COLUMN_FILTER_LENGTH ? value : undefined;
  }
  if (filterType === 'numeric') {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string' && value.length <= MAX_COLUMN_FILTER_LENGTH) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

function parseStoredFilterRule(entry: unknown, filterType: TableFilterType): TableColumnFilter | null {
  if (!isPlainRecord(entry)) {
    return null;
  }
  const matchMode = Object.hasOwn(entry, 'matchMode') ? entry['matchMode'] : undefined;
  if (typeof matchMode !== 'string' || !FILTER_MODES_BY_TYPE[filterType].includes(matchMode as TableFilterMatchMode)) {
    return null;
  }
  const mode = matchMode as TableFilterMatchMode;
  const value = Object.hasOwn(entry, 'value') ? entry['value'] : undefined;

  if (mode === 'between') {
    if (!Array.isArray(value) || value.length !== 2) {
      return null;
    }
    const parsedBounds: TableFilterScalar[] = [];
    for (const bound of value) {
      if (bound === null) {
        parsedBounds.push(null);
      } else {
        const parsed = parseStoredFilterScalar(bound, filterType);
        if (parsed === undefined) {
          return null;
        }
        parsedBounds.push(parsed);
      }
    }
    return { matchMode: mode, value: parsedBounds };
  }

  if (mode === 'in') {
    if (!Array.isArray(value)) {
      return null;
    }
    const items: TableFilterScalar[] = [];
    for (const rawItem of value.slice(0, MAX_COLUMN_FILTER_IN_ITEMS)) {
      const parsed = parseStoredFilterScalar(rawItem, filterType);
      if (parsed !== undefined) {
        items.push(parsed);
      }
    }
    return { matchMode: mode, value: items };
  }

  const scalar = parseStoredFilterScalar(value, filterType);
  return scalar === undefined ? null : { matchMode: mode, value: scalar };
}

/**
 * Keeps each stored rule or rule group whose field is a declared column and whose match modes and values fit that
 * column's `filterType` and explicit security bounds (`MAX_COLUMN_FILTER_RULES`, `MAX_COLUMN_FILTER_IN_ITEMS`,
 * `MAX_COLUMN_FILTER_LENGTH`, finite numbers, valid dates). Anything else is dropped.
 */
export function parseStoredColumnFilters(
  stored: unknown,
  columns: readonly StoredColumnDescriptor[],
): TableColumnFilters {
  const rules: Record<string, TableColumnFilter | TableColumnFilterGroup> = Object.create(null);
  if (!isPlainRecord(stored)) {
    return rules;
  }
  for (const col of columns) {
    if (!isSafeKey(col.field) || !Object.hasOwn(stored, col.field)) {
      continue;
    }
    const entry = stored[col.field];
    if (!isPlainRecord(entry)) {
      continue;
    }
    if (Object.hasOwn(entry, 'rules')) {
      const operator = Object.hasOwn(entry, 'operator') ? entry['operator'] : undefined;
      const rawRules = entry['rules'];
      if ((operator !== 'and' && operator !== 'or') || !Array.isArray(rawRules)) {
        continue;
      }
      const parsedGroupRules: TableColumnFilter[] = [];
      for (const rawRule of rawRules.slice(0, MAX_COLUMN_FILTER_RULES)) {
        const parsedRule = parseStoredFilterRule(rawRule, col.filterType);
        if (parsedRule) {
          parsedGroupRules.push(parsedRule);
        }
      }
      if (parsedGroupRules.length > 0) {
        rules[col.field] = { operator, rules: parsedGroupRules };
      }
      continue;
    }

    const parsed = parseStoredFilterRule(entry, col.filterType);
    if (parsed) {
      rules[col.field] = parsed;
    }
  }
  return rules;
}

function parseColumnOrder(raw: Record<string, unknown>, fields: ReadonlySet<string>): readonly string[] | undefined {
  if (!Object.hasOwn(raw, 'columnOrder')) return undefined;
  const stored = raw['columnOrder'];
  if (!Array.isArray(stored)) return undefined;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of stored) {
    if (typeof item === 'string' && fields.has(item) && !seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

function parseColumnWidths(
  raw: Record<string, unknown>,
  columns: readonly StoredColumnDescriptor[],
): ReadonlyMap<string, number> | undefined {
  if (!Object.hasOwn(raw, 'columnWidths')) return undefined;
  const stored = raw['columnWidths'];
  if (!isPlainRecord(stored)) return undefined;
  const widths = new Map<string, number>();
  for (const col of columns) {
    if (!isSafeKey(col.field) || !Object.hasOwn(stored, col.field)) continue;
    const width = stored[col.field];
    if (typeof width === 'number' && Number.isFinite(width) && width > 0 && width <= MAX_COLUMN_WIDTH_PX) {
      widths.set(col.field, width);
    }
  }
  return widths;
}

function parseColumnVisibility(
  raw: Record<string, unknown>,
  columns: readonly StoredColumnDescriptor[],
): Readonly<Record<string, boolean>> | undefined {
  if (!Object.hasOwn(raw, 'columnVisibility')) return undefined;
  const stored = raw['columnVisibility'];
  if (!isPlainRecord(stored)) return undefined;
  const visibility: Record<string, boolean> = Object.create(null);
  for (const col of columns) {
    if (!isSafeKey(col.field) || !Object.hasOwn(stored, col.field)) continue;
    const value = stored[col.field];
    if (typeof value === 'boolean') {
      visibility[col.field] = value;
    }
  }
  return visibility;
}

function parseCollapsedRowGroups(raw: Record<string, unknown>): readonly string[] | undefined {
  if (!Object.hasOwn(raw, 'collapsedRowGroups')) return undefined;
  const stored = raw['collapsedRowGroups'];
  if (!Array.isArray(stored)) return undefined;
  const seen = new Set<string>();
  for (const item of stored) {
    if (typeof item === 'string' && !seen.has(item)) {
      seen.add(item);
      if (seen.size >= MAX_COLLAPSED_ROW_GROUPS) {
        break;
      }
    }
  }
  return Array.from(seen);
}

function parseGlobalFilter(raw: Record<string, unknown>): string | undefined {
  if (!Object.hasOwn(raw, 'globalFilter')) return undefined;
  const stored = raw['globalFilter'];
  return typeof stored === 'string' && stored.length <= MAX_GLOBAL_FILTER_LENGTH ? stored : undefined;
}

function parseMultiSortMeta(
  raw: Record<string, unknown>,
  fields: ReadonlySet<string>,
): readonly TableSortMeta[] | undefined {
  if (!Object.hasOwn(raw, 'multiSortMeta')) return undefined;
  const stored = raw['multiSortMeta'];
  if (!Array.isArray(stored)) return undefined;
  const seen = new Set<string>();
  const result: TableSortMeta[] = [];
  for (const entry of stored) {
    if (!isPlainRecord(entry)) continue;
    if (!Object.hasOwn(entry, 'field') || !Object.hasOwn(entry, 'order')) continue;
    const field = entry['field'];
    const order = entry['order'];
    if (typeof field !== 'string' || !fields.has(field) || seen.has(field)) continue;
    if (order !== 'asc' && order !== 'desc') continue;
    seen.add(field);
    result.push({ field, order });
  }
  return result;
}

function parseRows(
  raw: Record<string, unknown>,
  options: readonly number[] | null | undefined,
): number | undefined {
  if (!Object.hasOwn(raw, 'rows')) return undefined;
  const value = raw['rows'];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    return undefined;
  }
  if (options && options.length > 0) {
    if (!options.includes(value)) {
      return undefined;
    }
  } else if (value > MAX_PAGE_SIZE) {
    return undefined;
  }
  return value;
}

/**
 * Validates and extracts each persisted `med-data-table` key independently from untrusted JSON data.
 * Invalid, out-of-bounds, or undeclared-column entries are omitted without blocking valid keys.
 */
export function parseStoredTableState(raw: unknown, ctx: StoredTableStateContext): ParsedStoredTableState {
  if (!isPlainRecord(raw)) {
    return {};
  }
  const fields = new Set(ctx.columns.map((c) => c.field).filter(isSafeKey));
  const result: {
    first?: number;
    sortField?: string | null;
    sortOrder?: TableSortOrder;
    expandedRowKeys?: Record<string, boolean>;
    columnFilters?: TableColumnFilters;
    columnOrder?: readonly string[];
    columnWidths?: ReadonlyMap<string, number>;
    columnVisibility?: Readonly<Record<string, boolean>>;
    collapsedRowGroups?: readonly string[];
    globalFilter?: string;
    multiSortMeta?: readonly TableSortMeta[];
    rows?: number;
  } = {};

  const first = parseFirst(raw);
  if (first !== undefined) result.first = first;

  const sort = parseSort(raw, fields);
  if ('sortField' in sort) result.sortField = sort.sortField;
  if ('sortOrder' in sort) result.sortOrder = sort.sortOrder;

  const expandedRowKeys = parseExpandedRowKeys(raw);
  if (expandedRowKeys !== undefined) result.expandedRowKeys = expandedRowKeys;

  if (Object.hasOwn(raw, 'columnFilters') && isPlainRecord(raw['columnFilters'])) {
    result.columnFilters = parseStoredColumnFilters(raw['columnFilters'], ctx.columns);
  }

  const columnOrder = parseColumnOrder(raw, fields);
  if (columnOrder !== undefined) result.columnOrder = columnOrder;

  const columnWidths = parseColumnWidths(raw, ctx.columns);
  if (columnWidths !== undefined) result.columnWidths = columnWidths;

  const columnVisibility = parseColumnVisibility(raw, ctx.columns);
  if (columnVisibility !== undefined) result.columnVisibility = columnVisibility;

  const collapsedRowGroups = parseCollapsedRowGroups(raw);
  if (collapsedRowGroups !== undefined) result.collapsedRowGroups = collapsedRowGroups;

  const globalFilter = parseGlobalFilter(raw);
  if (globalFilter !== undefined) result.globalFilter = globalFilter;

  const multiSortMeta = parseMultiSortMeta(raw, fields);
  if (multiSortMeta !== undefined) result.multiSortMeta = multiSortMeta;

  const rows = parseRows(raw, ctx.rowsPerPageOptions);
  if (rows !== undefined) result.rows = rows;

  return result;
}
