import { TemplateRef } from '@angular/core';
import { TreeNode, TreeSelectionMode } from './tree.types';

/**
 * Coordinator `TreeNodeComponent` reaches up to via DI (`inject(TreeHost)`)
 * — same reverse-direction shape `OrgChartHost`/`AccordionHost`/
 * `SplitterHost` already established in this library (see any of their own
 * docs for why an abstract class avoids a circular import between the host
 * and the leaf component). Selection lives on the top-level
 * `TreeComponent` (one `selection` model for the whole tree), while the
 * click/toggle that changes it happens deep inside whichever recursively-
 * nested `TreeNodeComponent` the user actually interacted with.
 */
export abstract class TreeHost {
  abstract mode(): TreeSelectionMode;
  abstract isSelected(node: TreeNode): boolean;
  abstract toggleSelect(node: TreeNode): void;
  /** Current search text (`''` when `filterable` is off, or the box is empty). */
  abstract filterText(): string;
  /** Whether `node` should render at all: no active filter, `node` itself matches, or a descendant of it does (so the path down to a match stays reachable). */
  abstract nodeVisible(node: TreeNode): boolean;
  /** The projected `[medTreeNodeTemplate]` for this node's own `type` (falling back to the default one), or `null` if neither exists — see `TreeComponent`'s own doc. */
  abstract getTemplateForNode(node: TreeNode): TemplateRef<{ $implicit: TreeNode }> | null;
  abstract draggableNodes(): boolean;
  abstract droppableNodes(): boolean;
  abstract onNodeDragStart(node: TreeNode): void;
  abstract onNodeDrop(node: TreeNode): void;
}
