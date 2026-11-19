export interface TreeNode {
  readonly label: string;
  readonly icon?: string;
  readonly children?: readonly TreeNode[];
  /** Initial expand state for this node's children. Default `true`. */
  readonly expanded?: boolean;
  /** Opts this node out of selection even when `selectionMode` is set. Default `true`. */
  readonly selectable?: boolean;
  /**
   * Selects which projected `[medTreeNodeTemplate]` renders this node's
   * content instead of the plain icon/label — matched against that
   * directive's own value, falling back to the one with no value at all
   * (the default) when either this is unset or no template matches it. See
   * `TreeComponent`'s own doc.
   */
  readonly type?: string;
}

/**
 * `'checkbox'` renders a checkbox glyph instead of a highlighted row, but
 * is otherwise mechanically identical to `'multiple'` (each node toggles
 * independently) — see `TreeComponent`'s own doc for why cascading
 * parent/child selection is a v1 scope cut.
 */
export type TreeSelectionMode = 'single' | 'multiple' | 'checkbox' | null;
