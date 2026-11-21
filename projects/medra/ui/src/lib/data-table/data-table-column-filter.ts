import { TableColumnFilter, TableFilterMatchMode, TableFilterType } from './data-table.types';

/** Match modes of each filter type, in the canonical order the menu offers them; the first is the type's default. */
export const FILTER_MODES_BY_TYPE: Readonly<Record<TableFilterType, readonly TableFilterMatchMode[]>> = {
  text: ['contains', 'notContains', 'startsWith', 'endsWith', 'equals', 'notEquals'],
  numeric: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'],
  date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter'],
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

/** A rule is active only when its value is not `null`, `''` or `NaN`; an inactive rule matches every row. */
export function isRuleActive(rule: TableColumnFilter | null | undefined): rule is TableColumnFilter {
  if (!rule) return false;
  const { value } = rule;
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'number' && Number.isNaN(value)) return false;
  if (value instanceof Date && Number.isNaN(value.getTime())) return false;
  return true;
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

function matchesText(cell: unknown, rule: TableColumnFilter): boolean {
  const text = (cell === null || cell === undefined ? '' : String(cell)).toLowerCase();
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
  const target = dayKey(rule.value);
  if (day === null || target === null) return false;
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
