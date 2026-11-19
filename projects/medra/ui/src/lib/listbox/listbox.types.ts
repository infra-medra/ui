/** Payload of `selectionChanged`: the new value of the list and the option that was toggled or chosen. */
export interface ListboxChangeEvent<T = unknown> {
  /** The new value: the chosen value in single mode, the list of chosen values in multiple mode. */
  readonly value: T | readonly T[] | null;
  /** The value of the option the user toggled or chose; `null` when "Select all" changed many options at once. */
  readonly itemValue: T | null;
}

/** Payload of `optionClicked` and `optionDoubleClicked`: the value of the option and the DOM event. */
export interface ListboxOptionEvent<T = unknown> {
  readonly value: T;
  readonly originalEvent: MouseEvent;
}

/** Payload of `selectAllChanged`: whether "Select all" marked options (`true`) or cleared them (`false`). */
export interface ListboxSelectAllEvent {
  readonly checked: boolean;
}
