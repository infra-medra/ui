/** A node in a CascadeSelect tree. Only leaves (no `children`) carry a real `value` — picking a leaf is what actually resolves this control's value; intermediate levels exist purely to narrow down to one. */
export interface CascadeSelectOption<T> {
  readonly label: string;
  readonly value?: T;
  readonly disabled?: boolean;
  readonly children?: readonly CascadeSelectOption<T>[];
}

/** Payload of `CascadeSelectComponent.optionSelected`: the picked leaf's value and the labels of the path that led to it. */
export interface CascadeSelectSelectEvent<T> {
  readonly value: T;
  readonly path: readonly string[];
}

/** Payload of `CascadeSelectComponent.groupOpened`: the opened node's value (`undefined` when the node has none) and the labels of its path. */
export interface CascadeSelectGroupEvent<T> {
  readonly value: T | undefined;
  readonly path: readonly string[];
}

/** Context of the `#value` template: the chosen value (`$implicit`) and the labels of the path that led to it. */
export interface CascadeSelectValueContext<T> {
  readonly $implicit: T;
  readonly path: readonly string[];
}

/** Context of the `#option` template: the normalized node (`$implicit`), the labels of its ancestors and whether it has children. */
export interface CascadeSelectOptionContext<T> {
  readonly $implicit: CascadeSelectOption<T>;
  readonly path: readonly string[];
  readonly hasChildren: boolean;
}
