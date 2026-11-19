import { SelectOption } from './select.types';

/** Field names (or a predicate) that tell the Select how to read the consumer's own option objects. */
export interface SelectOptionMapping {
  /** Field read as the option label. */
  readonly optionLabel: string;
  /** Field read as the option value. */
  readonly optionValue: string;
  /** Field name holding a boolean, or a predicate over the consumer's option object, marking it disabled. */
  readonly optionDisabled: string | ((option: any) => boolean); // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Field read as a group's header label; `null` falls back to `optionLabel`. */
  readonly optionGroupLabel?: string | null;
  /** Field holding a group's child options; `null` means the list is flat. */
  readonly optionGroupChildren?: string | null;
}

/** The mapping that reproduces the original `SelectOption` shape (`label`, `value`, `disabled`). */
export const DEFAULT_SELECT_OPTION_MAPPING: SelectOptionMapping = {
  optionLabel: 'label',
  optionValue: 'value',
  optionDisabled: 'disabled',
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function read(item: any, field: string): unknown {
  return item == null ? undefined : item[field];
}

/**
 * Normalizes the consumer's option objects into the internal flat
 * `SelectOption<T>` list the panel renders. Each result keeps the original
 * object in `source`.
 */
export function normalizeSelectOptions<T>(options: readonly any[], mapping: SelectOptionMapping): SelectOption<T>[] {
  const { optionLabel, optionValue, optionDisabled, optionGroupLabel, optionGroupChildren } = mapping;

  const toOption = (item: any, groupLabel?: string): SelectOption<T> => {
    const disabled = typeof optionDisabled === 'function' ? optionDisabled(item) : read(item, optionDisabled);
    const group = groupLabel ?? read(item, 'group');
    return {
      label: String(read(item, optionLabel) ?? ''),
      value: read(item, optionValue) as T,
      disabled: disabled === undefined ? undefined : !!disabled,
      group: group === undefined || group === null ? undefined : String(group),
      source: item,
    };
  };

  if (!optionGroupChildren) {
    return options.map((item) => toOption(item));
  }

  // Nested groups are flattened into the flat `group` label the panel already understands.
  return options.flatMap((groupItem) => {
    const label = String(read(groupItem, optionGroupLabel ?? optionLabel) ?? '');
    const children = read(groupItem, optionGroupChildren);
    return Array.isArray(children) ? children.map((child) => toOption(child, label)) : [];
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Whether two option values are the same choice: identical, or — when `dataKey`
 * names a field — objects that carry the same value in that field.
 */
export function isSameOptionValue(a: unknown, b: unknown, dataKey: string | null): boolean {
  if (a === b) {
    return true;
  }
  if (!dataKey || a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  const keyA = (a as Record<string, unknown>)[dataKey];
  return keyA !== undefined && keyA === (b as Record<string, unknown>)[dataKey];
}
