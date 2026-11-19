export interface TreeTableNode<T> {
  readonly data: T;
  readonly children?: readonly TreeTableNode<T>[];
  /** Initial expand state for this node's children. Default `true`. */
  readonly expanded?: boolean;
}
