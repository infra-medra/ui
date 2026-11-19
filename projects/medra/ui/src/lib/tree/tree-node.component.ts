import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, linkedSignal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { TreeHost } from './tree.tokens';
import { TreeNode } from './tree.types';

/**
 * One node of a `TreeComponent` — recurses into itself for each child,
 * same self-referencing standalone-component technique
 * `OrgChartNodeComponent` already established (see that file's doc for why
 * Angular supports a standalone component listing itself in its own
 * `imports`, and for why expand/collapse is local `linkedSignal` state
 * rather than a shadow map on the root component).
 *
 * The row itself is a `<div role="button">` re-implementation, not a real
 * `<button>`, when selectable — same trade-off `OrgChartNodeComponent`'s
 * own box already documents: it has to nest a real `<button>` (the
 * expand/collapse toggle), and a `<button>` can't nest another `<button>`.
 *
 * **`filterable` support**: `visibleChildren()`/`effectiveExpanded()` —
 * see `TreeComponent`'s own class doc for the full design. `effectiveExpanded`
 * (not the raw `expanded` signal) drives both the rendered `<ul>` and every
 * ARIA/visual reflection of it (the toggle button's icon/label,
 * `aria-expanded`), since those all have to agree with what's actually in
 * the DOM; only the keydown handler's own *mutations* of `expanded` stay
 * keyed off the real (non-forced) preference, so clearing the filter always
 * restores exactly the collapse state the user had before searching.
 */
@Component({
  selector: 'med-tree-node',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet, TreeNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      #rowEl
      [class]="rowClass()"
      [attr.role]="isSelectable() ? 'treeitem' : null"
      [attr.tabindex]="isSelectable() ? 0 : null"
      [attr.aria-expanded]="hasChildren() ? effectiveExpanded() : null"
      [attr.aria-level]="isSelectable() ? level() : null"
      [attr.aria-setsize]="isSelectable() ? setsize() : null"
      [attr.aria-posinset]="isSelectable() ? posinset() : null"
      [attr.aria-selected]="mode() === 'single' || mode() === 'multiple' ? isSelected() : null"
      [attr.aria-checked]="mode() === 'checkbox' ? isSelected() : null"
      [attr.draggable]="draggableNodes() ? 'true' : null"
      (click)="onSelect()"
      (keydown)="onKeydown($event)"
      (dragstart)="onDragStart($event)"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
    >
      @if (hasChildren()) {
        <button
          type="button"
          class="shrink-0 rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
          [attr.aria-expanded]="effectiveExpanded()"
          [attr.aria-label]="effectiveExpanded() ? collapseLabel() : expandLabel()"
          (click)="toggleExpanded($event)"
        >
          <med-icon name="chevron-down" variant="mini" class="size-3.5" [class]="effectiveExpanded() ? '' : '-rotate-90'" />
        </button>
      } @else {
        <span class="size-4 shrink-0"></span>
      }
      @if (mode() === 'checkbox') {
        <span [class]="checkboxBoxClass()" aria-hidden="true">
          @if (isSelected()) {
            <med-icon name="check" variant="solid" class="size-3" />
          }
        </span>
      }
      @if (nodeTemplate(); as t) {
        <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: node() }" />
      } @else {
        @if (node().icon; as icon) {
          <med-icon [name]="icon" variant="mini" class="size-4 shrink-0 text-surface-500 dark:text-surface-400" />
        }
        <span class="truncate">{{ node().label }}</span>
      }
    </div>

    @if (hasChildren() && effectiveExpanded()) {
      <ul class="pl-5" role="group">
        @for (child of visibleChildren(); track child; let i = $index) {
          <li>
            <med-tree-node
              [node]="child"
              [expandLabel]="expandLabel()"
              [collapseLabel]="collapseLabel()"
              [level]="level() + 1"
              [posinset]="i + 1"
              [setsize]="visibleChildren().length"
            />
          </li>
        }
      </ul>
    }
  `,
})
export class TreeNodeComponent {
  private readonly host = inject(TreeHost);

  readonly node = input.required<TreeNode>();
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly expandLabel = input('Expand');
  readonly collapseLabel = input('Collapse');
  /** ARIA treeitem depth/position (Wave 2 fix — upgraded from role="button" rows with no tree semantics at all). 1-based, matching `aria-level`'s own convention. */
  readonly level = input.required<number>();
  readonly posinset = input.required<number>();
  readonly setsize = input.required<number>();

  protected readonly expanded = linkedSignal(() => this.node().expanded !== false);
  protected readonly draggableNodes = computed(() => this.host.draggableNodes());
  /** `true` while a filter is active and forcing this node open — see class doc. Never mutates `expanded` itself. */
  protected readonly effectiveExpanded = computed(() => this.host.filterText().trim() !== '' || this.expanded());
  protected readonly visibleChildren = computed(() => (this.node().children ?? []).filter((child) => this.host.nodeVisible(child)));
  protected readonly nodeTemplate = computed(() => this.host.getTemplateForNode(this.node()));

  /**
   * Deliberately not `checkboxBoxVariants` (Checkbox's own decorative-box
   * CVA) as-is: that one is driven entirely by a real sibling
   * `<input class="peer">`'s native `:checked`/`:indeterminate` state via
   * the `peer-checked:*`/`peer-indeterminate:*` Tailwind variants — there's
   * no real checkbox `<input>` here (selection is driven by the row's own
   * click/keydown, the same as `single`/`multiple` mode), so those variants
   * would never match anything and the box would silently never fill,
   * leaving the white checkmark icon invisible against its own
   * never-painted background. This computes the same filled/unfilled look
   * directly off `isSelected()` instead.
   */
  protected readonly checkboxBoxClass = computed(() =>
    mergeClasses(
      'pointer-events-none inline-flex size-4 shrink-0 items-center justify-center rounded-sm border-2 text-white transition-colors duration-(--transition-duration-base)',
      this.isSelected() ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400' : 'border-surface-300 bg-transparent dark:border-surface-600',
    ),
  );

  protected readonly hasChildren = computed(() => (this.node().children?.length ?? 0) > 0);
  protected readonly mode = computed(() => this.host.mode());
  protected readonly isSelectable = computed(() => this.mode() !== null && this.node().selectable !== false);
  protected readonly isSelected = computed(() => this.host.isSelected(this.node()));

  protected readonly rowClass = computed(() =>
    mergeClasses(
      'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-(--transition-duration-base)',
      this.isSelected() && this.mode() !== 'checkbox' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-surface-900 dark:text-surface-50',
      this.isSelectable() ? 'cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800' : '',
      this.isSelectable()
        ? 'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400'
        : '',
    ),
  );

  protected onSelect(): void {
    if (this.isSelectable()) {
      this.host.toggleSelect(this.node());
    }
  }

  protected onDragStart(event: Event): void {
    if (!this.host.draggableNodes()) {
      return;
    }
    event.stopPropagation();
    this.host.onNodeDragStart(this.node());
  }

  protected onDragOver(event: Event): void {
    if (!this.host.droppableNodes()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  protected onDrop(event: Event): void {
    if (!this.host.droppableNodes()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.host.onNodeDrop(this.node());
  }

  private readonly rowRef = viewChild.required<ElementRef<HTMLElement>>('rowEl');

  /**
   * Up/Down/Left/Right/Home/End (Wave 2 fix — previously only Enter/Space
   * existed; the row had `role="button"` with no tree keyboard model at
   * all). Left/Right (collapse/expand) are purely local to this node's own
   * `expanded` state. Up/Down/Home/End move focus across the *whole*
   * visible tree, which spans an unknown number of sibling
   * `TreeNodeComponent` instances this node has no direct reference to —
   * resolved via a DOM query against the nearest `[role="tree"]` ancestor
   * rather than restructuring the recursive component architecture to
   * centralize `expanded` state (each node's `expanded` is deliberately
   * local, see the component's own doc comment): querying
   * `[role="treeitem"]` already only returns *rendered* rows, and a
   * collapsed node's children are never rendered (`@if (hasChildren() &&
   * expanded())`), so the query naturally reflects visible order with no
   * extra filtering needed.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isSelectable()) {
      return;
    }
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.host.toggleSelect(this.node());
        return;
      case 'ArrowRight':
        event.preventDefault();
        if (this.hasChildren()) {
          if (!this.effectiveExpanded()) {
            this.expanded.set(true);
          } else {
            this.focusRelative(1);
          }
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.hasChildren() && this.effectiveExpanded()) {
          this.expanded.set(false);
        } else {
          this.focusAncestorRow();
        }
        return;
      case 'ArrowDown':
        event.preventDefault();
        this.focusRelative(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.focusRelative(-1);
        return;
      case 'Home':
        event.preventDefault();
        this.focusEdge('first');
        return;
      case 'End':
        event.preventDefault();
        this.focusEdge('last');
        return;
    }
  }

  protected toggleExpanded(event: Event): void {
    event.stopPropagation();
    this.expanded.update((value) => !value);
  }

  private visibleRows(): HTMLElement[] {
    const tree = this.rowRef().nativeElement.closest('[role="tree"]');
    return tree ? Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]')) : [];
  }

  private focusRelative(step: 1 | -1): void {
    const rows = this.visibleRows();
    const current = this.rowRef().nativeElement;
    const index = rows.indexOf(current);
    if (index === -1) {
      return;
    }
    rows[index + step]?.focus();
  }

  private focusEdge(edge: 'first' | 'last'): void {
    const rows = this.visibleRows();
    (edge === 'first' ? rows[0] : rows[rows.length - 1])?.focus();
  }

  private focusAncestorRow(): void {
    // The parent node's own row `<div role="treeitem">` is a *direct* child
    // of the parent `TreeNodeComponent`'s host element (`<med-tree-node>`),
    // the same element that directly contains the `<ul role="group">` this
    // node's `<li>` lives inside — `:scope >` (not a plain descendant
    // selector) is what keeps this from matching a *deeper* treeitem
    // (e.g. this node's own row) instead of the actual parent's.
    const group = this.rowRef().nativeElement.closest('ul[role="group"]');
    const parentHost = group?.parentElement;
    const ancestorRow = parentHost?.querySelector<HTMLElement>(':scope > [role="treeitem"]');
    ancestorRow?.focus();
  }
}
