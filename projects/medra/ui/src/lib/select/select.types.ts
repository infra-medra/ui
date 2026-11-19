/**
 * One item in a Select/MultiSelect list. Shared between both components (and
 * reused by Listbox/AutoComplete — see those files).
 *
 * `group`, when set, is rendered as a non-interactive header above the first option carrying that
 * label — a flat/consecutive scheme so grouping doesn't require a second parallel option shape:
 * sort/filter the flat `options` array by group first and the panel does the rest.
 */
export interface SelectOption<T = unknown> {
  readonly label: string;
  readonly value: T;
  readonly disabled?: boolean;
  readonly group?: string;
  /** The consumer's original object this option was normalized from, when the Select maps custom fields. */
  readonly source?: unknown;
}

/** How the filter compares the typed text with an option's text: the whole text is compared, case-insensitively. */
export type SelectFilterMatchMode = 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals';

/** Payload of `optionSelected`: the value of the option the user picked. */
export interface SelectChangeEvent<T = unknown> {
  readonly value: T;
}

/** Payload of `filtered`: the text currently typed in the panel's filter box. */
export interface SelectFilterEvent {
  readonly filter: string;
}

/** Context of the `#value` template: the chosen value is the implicit value, the normalized option is `option`. */
export interface SelectValueContext<T = unknown> {
  $implicit: T;
  option: SelectOption<T>;
}

/** Context of the `#option` template: the option is the implicit value, `selected` tells whether it is the chosen one. */
export interface SelectOptionContext<T = unknown> {
  $implicit: SelectOption<T>;
  selected: boolean;
}

/** What `options` accepts: the `SelectOption` shape, or any objects read through the `option*` mapping inputs. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectOptionsInput<T = unknown> = readonly SelectOption<T>[] | readonly Record<string, any>[];

/** What `optionDisabled` accepts: a field name on the consumer's option object, or a predicate over it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectOptionDisabled = string | ((option: any) => boolean);
