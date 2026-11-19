import { CascadeSelectOption } from './cascade-select.types';

/** Which consumer field each part of a node is read from — see the mapping inputs of `CascadeSelectComponent`. */
export interface CascadeSelectMapping {
  readonly label: string;
  readonly value: string;
  /** Label field of a node that has children; `null` falls back to `label`. */
  readonly groupLabel: string | null;
  /** One field name for every level, or one per level (the last one repeats for deeper levels). */
  readonly children: string | readonly string[];
  /** A field name, or a function that flags a node as disabled. */
  readonly disabled: string | ((option: any) => boolean);
}

function childrenOf(raw: any, mapping: CascadeSelectMapping, level: number): readonly any[] | null {
  const keys = typeof mapping.children === 'string' ? [mapping.children] : mapping.children;
  const key = keys[Math.min(level, keys.length - 1)];
  const children = key === undefined ? undefined : raw?.[key];
  return Array.isArray(children) && children.length > 0 ? children : null;
}

function isDisabled(raw: any, mapping: CascadeSelectMapping): boolean {
  return typeof mapping.disabled === 'function' ? !!mapping.disabled(raw) : !!raw?.[mapping.disabled];
}

/** Turns the consumer's own nodes into the internal tree (`label`, `value`, `disabled`, `children`) every other part of the component reads. */
export function normalizeOptions<T>(raw: readonly any[], mapping: CascadeSelectMapping, level = 0): readonly CascadeSelectOption<T>[] {
  return raw.map((node) => {
    const children = childrenOf(node, mapping, level);
    const labelKey = children && mapping.groupLabel ? mapping.groupLabel : mapping.label;
    return {
      label: String(node?.[labelKey] ?? ''),
      value: node?.[mapping.value] as T | undefined,
      disabled: isDisabled(node, mapping),
      children: children ? normalizeOptions<T>(children, mapping, level + 1) : undefined,
    };
  });
}
