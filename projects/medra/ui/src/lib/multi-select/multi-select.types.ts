import { SelectOption } from '../select/select.types';

/** Payload of `selectionChanged`: the whole new list of chosen values and the option that was toggled. */
export interface MultiSelectChangeEvent<T = unknown> {
  /** The new list of chosen values. */
  readonly value: readonly T[];
  /** The value of the option that was toggled or removed; `null` when the field was cleared or "select all" was used. */
  readonly itemValue: T | null;
}

/** Payload of `chipRemoved`: the value of the option whose chip was removed. */
export interface MultiSelectChipRemoveEvent<T = unknown> {
  readonly value: T;
}

/** Payload of `selectAllChanged`: whether "select all" marked every enabled option (`true`) or unmarked them (`false`). */
export interface MultiSelectSelectAllEvent {
  readonly checked: boolean;
}

/** Context of the `#value` template (shown with `display="comma"`): the chosen values are the implicit value, the normalized chosen options are `options`. */
export interface MultiSelectValueContext<T = unknown> {
  $implicit: readonly T[];
  options: SelectOption<T>[];
}

/** Builds the accessible label of a chip's remove button from the label of its option. */
export type MultiSelectChipRemoveLabelFn = (optionLabel: string) => string;
