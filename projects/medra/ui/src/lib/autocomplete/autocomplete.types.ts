import { SelectOption } from '../select/select.types';

/** Context of the `#item` template of `med-autocomplete`: the suggestion is the implicit value. */
export interface AutocompleteItemContext<T = unknown> {
  $implicit: SelectOption<T>;
  /** Position of the suggestion in the `suggestions` list. */
  index: number;
}

/** Context of the `#group` template of `med-autocomplete`: the group label is the implicit value. */
export interface AutocompleteGroupContext {
  $implicit: string;
}
