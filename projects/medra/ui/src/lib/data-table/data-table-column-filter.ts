import { TableColumnFilter, TableColumnFilterGroup, TableFilterMatchMode, TableFilterType } from './data-table.types';

/** Match modes of each filter type, in the canonical order the menu offers them; the first is the type's default. */
export const FILTER_MODES_BY_TYPE: Readonly<Record<TableFilterType, readonly TableFilterMatchMode[]>> = {
  text: ['contains', 'notContains', 'startsWith', 'endsWith', 'equals', 'notEquals', 'in'],
  numeric: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte', 'between', 'in'],
  date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter', 'between', 'in'],
};

/**
 * Modes a column offers: those of its type in canonical order, intersected with `restrict` when set. An empty
 * intersection falls back to the type's default mode alone.
 */
export function offeredMatchModes(
  type: TableFilterType,
  restrict: readonly TableFilterMatchMode[] | null,
): readonly TableFilterMatchMode[] {
  const all = FILTER_MODES_BY_TYPE[type];
  if (!restrict) return all;
  const kept = all.filter((mode) => restrict.includes(mode));
  return kept.length > 0 ? kept : [all[0]];
}

/** Mode preselected in the menu: `preferred` when offered, else the type's default when offered, else the first offered. */
export function preselectedMatchMode(
  type: TableFilterType,
  offered: readonly TableFilterMatchMode[],
  preferred: TableFilterMatchMode | null,
): TableFilterMatchMode {
  if (preferred && offered.includes(preferred)) return preferred;
  const typeDefault = FILTER_MODES_BY_TYPE[type][0];
  return offered.includes(typeDefault) ? typeDefault : offered[0];
}

function isScalarActive(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'number' && Number.isNaN(value)) return false;
  if (value instanceof Date && Number.isNaN(value.getTime())) return false;
  return true;
}

/** A rule is active only when its value (or at least one `between` bound / non-empty `in` list) is present; an inactive rule matches every row. */
export function isRuleActive(rule: TableColumnFilter | null | undefined): rule is TableColumnFilter {
  if (!rule) return false;
  const { matchMode, value } = rule;
  if (matchMode === 'between') {
    return Array.isArray(value) && value.length >= 2 && (isScalarActive(value[0]) || isScalarActive(value[1]));
  }
  if (matchMode === 'in') {
    return Array.isArray(value) && value.length > 0;
  }
  if (Array.isArray(value)) return false;
  return isScalarActive(value);
}

/** Calendar-day key (`year * 10000 + month * 100 + day`) in the local time zone, or `null` when the value is not a date. */
function dayKey(value: unknown): number | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.getFullYear() * 10000 + (value.getMonth() + 1) * 100 + value.getDate();
  }
  if (typeof value !== 'string') return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) return Number(dateOnly[1]) * 10000 + Number(dateOnly[2]) * 100 + Number(dateOnly[3]);
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return dayKey(new Date(value));
  return null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function matchesText(cell: unknown, rule: TableColumnFilter): boolean {
  const text = (cell === null || cell === undefined ? '' : String(cell)).toLowerCase();
  if (rule.matchMode === 'in') {
    if (!Array.isArray(rule.value)) return false;
    return rule.value.some((item) => (item === null || item === undefined ? '' : String(item)).toLowerCase() === text);
  }
  const needle = String(rule.value).toLowerCase();
  switch (rule.matchMode) {
    case 'contains':
      return text.includes(needle);
    case 'notContains':
      return !text.includes(needle);
    case 'startsWith':
      return text.startsWith(needle);
    case 'endsWith':
      return text.endsWith(needle);
    case 'equals':
      return text === needle;
    case 'notEquals':
      return text !== needle;
    default:
      return false;
  }
}

function matchesNumeric(cell: unknown, rule: TableColumnFilter): boolean {
  if (typeof cell !== 'number' || !Number.isFinite(cell)) return false;
  if (rule.matchMode === 'between') {
    if (!Array.isArray(rule.value) || rule.value.length < 2) return false;
    const [minRaw, maxRaw] = rule.value;
    if (isScalarActive(minRaw)) {
      const min = toFiniteNumber(minRaw);
      if (min === null || cell < min) return false;
    }
    if (isScalarActive(maxRaw)) {
      const max = toFiniteNumber(maxRaw);
      if (max === null || cell > max) return false;
    }
    return true;
  }
  if (rule.matchMode === 'in') {
    if (!Array.isArray(rule.value)) return false;
    return rule.value.some((item) => {
      const n = toFiniteNumber(item);
      return n !== null && n === cell;
    });
  }
  const target = Number(rule.value);
  switch (rule.matchMode) {
    case 'equals':
      return cell === target;
    case 'notEquals':
      return cell !== target;
    case 'lt':
      return cell < target;
    case 'lte':
      return cell <= target;
    case 'gt':
      return cell > target;
    case 'gte':
      return cell >= target;
    default:
      return false;
  }
}

function matchesDate(cell: unknown, rule: TableColumnFilter): boolean {
  const day = dayKey(cell);
  if (day === null) return false;
  if (rule.matchMode === 'between') {
    if (!Array.isArray(rule.value) || rule.value.length < 2) return false;
    const [minRaw, maxRaw] = rule.value;
    if (isScalarActive(minRaw)) {
      const minDay = dayKey(minRaw);
      if (minDay === null || day < minDay) return false;
    }
    if (isScalarActive(maxRaw)) {
      const maxDay = dayKey(maxRaw);
      if (maxDay === null || day > maxDay) return false;
    }
    return true;
  }
  if (rule.matchMode === 'in') {
    if (!Array.isArray(rule.value)) return false;
    return rule.value.some((item) => {
      const d = dayKey(item);
      return d !== null && d === day;
    });
  }
  const target = dayKey(rule.value);
  if (target === null) return false;
  switch (rule.matchMode) {
    case 'dateIs':
      return day === target;
    case 'dateIsNot':
      return day !== target;
    case 'dateBefore':
      return day < target;
    case 'dateAfter':
      return day > target;
    default:
      return false;
  }
}

/** Type guard distinguishing a multi-rule {@link TableColumnFilterGroup} from a single {@link TableColumnFilter}. */
export function isFilterGroup(
  entry: TableColumnFilter | TableColumnFilterGroup | null | undefined,
): entry is TableColumnFilterGroup {
  return typeof entry === 'object' && entry !== null && Array.isArray((entry as TableColumnFilterGroup).rules);
}

/** Whether a single rule or multi-rule group contains at least one active rule. */
export function isColumnFilterEntryActive(
  entry: TableColumnFilter | TableColumnFilterGroup | null | undefined,
): boolean {
  if (!entry) return false;
  if (isFilterGroup(entry)) {
    return entry.rules.some((rule) => isRuleActive(rule));
  }
  return isRuleActive(entry);
}

/** Whether `cell` passes `rule` for a column of `type`. An inactive rule matches every cell. */
export function matchesColumnFilter(cell: unknown, rule: TableColumnFilter, type: TableFilterType): boolean {
  if (!isRuleActive(rule)) return true;
  switch (type) {
    case 'numeric':
      return matchesNumeric(cell, rule);
    case 'date':
      return matchesDate(cell, rule);
    default:
      return matchesText(cell, rule);
  }
}

/**
 * Whether `cell` passes a column's single rule or multi-rule group for `type`.
 * Inactive rules are ignored; an `'and'` group requires all active rules to match, `'or'` requires at least one.
 */
export function matchesColumnFilterEntry(
  cell: unknown,
  entry: TableColumnFilter | TableColumnFilterGroup | null | undefined,
  type: TableFilterType,
): boolean {
  if (!entry) return true;
  if (!isFilterGroup(entry)) return matchesColumnFilter(cell, entry, type);
  const activeRules = entry.rules.filter(isRuleActive);
  if (activeRules.length === 0) return true;
  if (entry.operator === 'or') {
    return activeRules.some((rule) => matchesColumnFilter(cell, rule, type));
  }
  return activeRules.every((rule) => matchesColumnFilter(cell, rule, type));
}
