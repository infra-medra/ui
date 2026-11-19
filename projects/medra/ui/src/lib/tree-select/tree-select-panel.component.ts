import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { TreeComponent } from '../tree/tree.component';
import { TreeNode } from '../tree/tree.types';

/** `Array.isArray()`'s negative branch doesn't reliably narrow a `readonly T[]` union member out in TypeScript (a known limitation with readonly arrays) — an explicit type predicate does. */
function isSingleNode(value: TreeNode | readonly TreeNode[]): value is TreeNode {
  return !Array.isArray(value);
}

/**
 * Internal overlay content for TreeSelect (not part of the public API —
 * consumers only ever see `<med-tree-select>`). Just `TreeComponent` itself
 * in `selectionMode="single"`, translating its `(selectionChange)` into a
 * one-shot `nodeSelected` event: `TreeComponent` was already a complete,
 * independent picker UI (expand/collapse, keyboard activation, the
 * `selectable: false` per-node opt-out), so wrapping it here needed no new
 * interaction logic of its own — same "compose an existing primitive
 * rather than rebuild it" reasoning `GalleriaComponent` already applied to
 * `ImageComponent`.
 *
 * **`filterable`, reopening a documented cut**. `TreeComponent` already grew a `filterable` search box + match/
 * force-expand logic for its own item — this just forwards to it
 * unchanged, the same "compose an existing primitive" reasoning the rest
 * of this file's doc already gives for reusing `TreeComponent` at all.
 *
 * **`loading`** replaces `TreeComponent` entirely with a
 * spinner row while true — same "loading state supersedes content, not
 * layered on top of it" shape `SelectPanelComponent`'s own `loading`
 * already uses, added here rather than on `TreeComponent` itself since
 * only the combobox panel case needs it for now.
 */
@Component({
  selector: 'med-tree-select-panel',
  standalone: true,
  imports: [TreeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    @if (loading()) {
      <div class="flex items-center gap-2 px-3 py-4 text-sm text-surface-400 dark:text-surface-500">
        <med-icon name="arrow-path" variant="mini" class="size-4 shrink-0 animate-spin" />
        <span>{{ loadingLabel() }}</span>
      </div>
    } @else {
      <med-tree [value]="options()" selectionMode="single" [filterable]="filterable()" [filterPlaceholder]="filterPlaceholder()" class="max-h-72 overflow-y-auto p-1" (selectionChange)="onSelectionChange($event)" />
    }
  `,
})
export class TreeSelectPanelComponent {
  readonly options = input<readonly TreeNode[]>([]);
  readonly filterable = input(false);
  readonly filterPlaceholder = input('Search');
  readonly loading = input(false);
  readonly loadingLabel = input('Loading...');
  readonly nodeSelected = output<TreeNode>();

  protected onSelectionChange(selection: TreeNode | readonly TreeNode[] | null): void {
    if (selection && isSingleNode(selection)) {
      this.nodeSelected.emit(selection);
    }
  }
}
