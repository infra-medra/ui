import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, booleanAttribute, computed, contentChildren, numberAttribute, input, model, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { TreeNodeTemplateDirective } from './tree-node-template.directive';
import { TreeNodeComponent } from './tree-node.component';
import { TreeHost } from './tree.tokens';
import { TreeNode, TreeSelectionMode } from './tree.types';

/** A node matches if its own label does, or any descendant's does (so the path down to a match stays reachable). */
function nodeMatchesFilter(node: TreeNode, filterLower: string): boolean {
  if (node.label.toLowerCase().includes(filterLower)) {
    return true;
  }
  return (node.children ?? []).some((child) => nodeMatchesFilter(child, filterLower));
}

interface FlatTreeRow {
  readonly node: TreeNode;
  readonly level: number;
  readonly posinset: number;
  readonly setsize: number;
  readonly hasChildren: boolean;
}

/**
 * Tree primitive (Tier 4): a vertically indented hierarchy —
 * `value` is a flat `readonly TreeNode[]` of root nodes (unlike
 * `OrganizationChartComponent`'s single root, a tree commonly has several
 * top-level entries, e.g. multiple drives/root folders). Same recursive
 * self-referencing `TreeNodeComponent` + reverse-DI `TreeHost` selection
 * coordinator architecture `OrganizationChartComponent` already established
 * — see either file's own doc for the reasoning, which applies unchanged
 * here.
 *
 * **`selectionMode: 'checkbox'` is mechanically identical to `'multiple'`**
 * (each node's `selection` membership toggles independently) — it only
 * changes the row's visual (a checkbox glyph instead of a highlighted
 * background). **Scope cut for v1**: no cascading parent/child selection
 * (checking a parent auto-checking every descendant, an indeterminate
 * state for a partially-checked branch) — a real, common Tree feature, but
 * one that needs recomputing "are all/some of this node's descendants
 * selected" on every render, a meaningfully bigger feature than the toggle
 * mechanics themselves; layers on top of the existing `selection` array
 * shape without an API change. (`OrganizationChartComponent`'s own
 * `'checkbox'` mode *does* cascade — a deliberately separate decision, not
 * copied back here in this pass; see that component's doc.)
 *
 * **`filterable`, reopening a documented cut**. A plain substring match against `label`
 * (case-insensitive), centralized on `TreeHost.nodeVisible()`/`filterText()`
 * so both the recursive path (`TreeNodeComponent`) and the flat virtual-
 * scroll path below share one matching rule instead of two. A node renders
 * when no filter is active, it matches itself, or any descendant does (the
 * ancestor chain down to a match stays visible) — computed *before*
 * `@for`, not filtered inline with `@if` inside it, so `aria-posinset`/
 * `aria-setsize` count only the currently-visible siblings, not the full
 * unfiltered set. A node with a matching descendant force-expands while
 * filtering is active (`TreeNodeComponent.effectiveExpanded`) without
 * mutating its own `expanded` state — clearing the filter always restores
 * exactly whatever collapse state the user had before searching.
 *
 * **`virtualScroll`, reopening a documented cut**. A
 * genuinely different rendering path, not a toggle on the existing one:
 * the recursive `TreeNodeComponent` architecture (each node's `expanded`
 * is its own local `linkedSignal`) is fundamentally incompatible with
 * `CdkVirtualScrollViewport`, which needs one flat, indexable list of rows
 * to window over — same reasoning `VirtualScrollerComponent`'s own class
 * doc gives for wrapping CDK's implementation rather than reinventing
 * virtualization. When `virtualScroll()` is on, this component instead
 * flattens `value()` into `FlatTreeRow[]` (depth-first, only descending
 * into a node that's expanded — respecting the *same* `filterable` force-
 * expand as the recursive path) and renders that through
 * `cdk-virtual-scroll-viewport`, with expand/collapse state promoted to a
 * `Map` on this component (`expandedOverrides`) since there's no longer a
 * per-node component instance to hold it locally. `TreeNodeComponent`
 * itself is never instantiated in this mode. Keyboard nav mirrors the
 * recursive path's Up/Down/Left/Right/Home/End, but a virtualized target
 * row may not exist in the DOM yet — `scrollToIndex()` first, then a
 * `requestAnimationFrame` before querying/focusing it (same real-browser-
 * async pattern `DrawerComponent` already uses for its own enter
 * transition), an inherent, accepted trade-off of virtualizing a
 * real-focus (not activedescendant-based) roving-tabindex widget.
 * **`aria-setsize`/`aria-posinset` still communicate a row's true position
 * among its (possibly currently unrendered) siblings even though the DOM
 * can't literally contain them all at once — the same structural tension
 * `SelectPanelComponent`'s own virtualized `role="listbox"` already
 * accepts, not unique to Tree.**
 *
 * **Per-node/per-type templates**
 * `getTemplateForNode()` (verified in its source: a map from `node.type` to
 * a projected template, falling back to a `'default'` entry). Here that's
 * `[medTreeNodeTemplate]` — a directive on the `<ng-template>` itself
 * rather than a named `contentChild` per type (the idiom this library
 * otherwise uses for a fixed, known set of slots like `medCardHeader`),
 * since the set of `type` values is entirely consumer-defined and
 * open-ended, not something this component could enumerate in advance. A
 * matching template replaces only the icon/label portion of a row — the
 * expand toggle and (in `checkbox` mode) the checkbox glyph stay
 * unchanged — so a consumer's template is free to put a Badge, an Avatar,
 * a per-row action button, or anything else in that space. Both rendering
 * paths (the recursive `TreeNodeComponent` tree and the flat
 * `virtualScroll` rows) resolve through the same `getTemplateForNode()` on
 * `TreeHost`, so a consumer never has to think about which mode is active.
 */
@Component({
  selector: 'med-tree',
  standalone: true,
  imports: [TreeNodeComponent, IconComponent, NgTemplateOutlet, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  providers: [{ provide: TreeHost, useExisting: TreeComponent }],
  template: `
    @if (filterable()) {
      <input
        type="text"
        class="sticky top-0 z-10 mb-2 w-full rounded-md border border-surface-300 bg-surface-0 px-2 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-50 dark:placeholder:text-surface-500"
        [placeholder]="filterPlaceholder()"
        [attr.aria-label]="filterPlaceholder()"
        [value]="filterTextSignal()"
        (input)="filterTextSignal.set($any($event.target).value)"
      />
    }

    @if (virtualScroll()) {
      <cdk-virtual-scroll-viewport [itemSize]="virtualScrollItemSize()" [class]="viewportClass" role="tree" [attr.aria-multiselectable]="selectionMode() === 'multiple' || selectionMode() === 'checkbox' ? 'true' : null">
        <div
          *cdkVirtualFor="let row of flatRows(); trackBy: trackFlatRow; let i = index"
          [attr.data-tree-row-index]="i"
          [attr.role]="isRowSelectable(row.node) ? 'treeitem' : null"
          [attr.tabindex]="isRowSelectable(row.node) ? 0 : null"
          [attr.aria-expanded]="row.hasChildren ? isExpanded(row.node) : null"
          [attr.aria-level]="isRowSelectable(row.node) ? row.level : null"
          [attr.aria-setsize]="isRowSelectable(row.node) ? row.setsize : null"
          [attr.aria-posinset]="isRowSelectable(row.node) ? row.posinset : null"
          [attr.aria-selected]="selectionMode() === 'single' || selectionMode() === 'multiple' ? isSelected(row.node) : null"
          [attr.aria-checked]="selectionMode() === 'checkbox' ? isSelected(row.node) : null"
          [class]="flatRowClass(row.node)"
          [style.paddingLeft.px]="(row.level - 1) * 20"
          [style.height.px]="virtualScrollItemSize()"
          (click)="onFlatRowSelect(row.node)"
          (keydown)="onFlatRowKeydown($event, row, i)"
        >
          @if (row.hasChildren) {
            <button
              type="button"
              class="shrink-0 rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
              [attr.aria-expanded]="isExpanded(row.node)"
              [attr.aria-label]="isExpanded(row.node) ? collapseLabel() : expandLabel()"
              (click)="toggleFlatExpanded($event, row.node)"
            >
              <med-icon name="chevron-down" variant="mini" class="size-3.5" [class]="isExpanded(row.node) ? '' : '-rotate-90'" />
            </button>
          } @else {
            <span class="size-4 shrink-0"></span>
          }
          @if (selectionMode() === 'checkbox') {
            <span [class]="flatCheckboxBoxClass(row.node)" aria-hidden="true">
              @if (isSelected(row.node)) {
                <med-icon name="check" variant="solid" class="size-3" />
              }
            </span>
          }
          @if (getTemplateForNode(row.node); as t) {
            <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: row.node }" />
          } @else {
            @if (row.node.icon; as icon) {
              <med-icon [name]="icon" variant="mini" class="size-4 shrink-0 text-surface-500 dark:text-surface-400" />
            }
            <span class="truncate">{{ row.node.label }}</span>
          }
        </div>
      </cdk-virtual-scroll-viewport>
    } @else {
      <ul role="tree" [attr.aria-multiselectable]="selectionMode() === 'multiple' || selectionMode() === 'checkbox' ? 'true' : null">
        @for (node of visibleRoots(); track node; let i = $index) {
          <li>
            <med-tree-node [node]="node" [expandLabel]="expandLabel()" [collapseLabel]="collapseLabel()" [level]="1" [posinset]="i + 1" [setsize]="visibleRoots().length" />
          </li>
        }
      </ul>
    }
  `,
})
export class TreeComponent implements TreeHost {
  readonly value = input<readonly TreeNode[]>([]);
  readonly selectionMode = input<TreeSelectionMode>(null);
  readonly selection = model<TreeNode | readonly TreeNode[] | null>(null);
  /** Shows a search box above the tree; matching is a plain case-insensitive substring against `label`. */
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Search');
  /** Switches to a flattened, `CdkVirtualScrollViewport`-backed rendering path for large trees — see class doc. */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** Fixed row height in pixels, required by `CdkFixedSizeVirtualScroll` to compute scroll height without measuring real rows. */
  readonly virtualScrollItemSize = input(36, { transform: numberAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly expandLabel = input('Expand');
  readonly collapseLabel = input('Collapse');
  readonly draggableNodes = input(false, { transform: booleanAttribute });
  readonly droppableNodes = input(false, { transform: booleanAttribute });
  readonly propagateSelectionUp = input(true, { transform: booleanAttribute });
  readonly propagateSelectionDown = input(true, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  readonly nodeDrop = output<{ readonly dragNode: TreeNode; readonly dropNode: TreeNode }>();

  protected readonly filterTextSignal = signal('');
  private readonly expandedOverrides = signal<ReadonlyMap<TreeNode, boolean>>(new Map());
  private readonly viewport = viewChild(CdkVirtualScrollViewport);
  private draggedNode: TreeNode | null = null;

  private readonly nodeTemplates = contentChildren(TreeNodeTemplateDirective);
  private readonly nodeTemplateMap = computed(() => new Map(this.nodeTemplates().map((t) => [t.type(), t.templateRef])));

  protected readonly hostClass = computed(() => mergeClasses('block', this.class()));
  protected readonly viewportClass = 'h-96 w-full';

  protected readonly visibleRoots = computed(() => this.value().filter((node) => this.nodeVisible(node)));

  protected readonly flatRows = computed(() => {
    const rows: FlatTreeRow[] = [];
    this.flatten(this.value(), 1, rows);
    return rows;
  });

  private flatten(nodes: readonly TreeNode[], level: number, rows: FlatTreeRow[]): void {
    const visible = nodes.filter((node) => this.nodeVisible(node));
    visible.forEach((node, index) => {
      const hasChildren = (node.children?.length ?? 0) > 0;
      rows.push({ node, level, posinset: index + 1, setsize: visible.length, hasChildren });
      if (hasChildren && (this.isExpanded(node) || this.filterTextSignal().trim() !== '')) {
        this.flatten(node.children!, level + 1, rows);
      }
    });
  }

  mode(): TreeSelectionMode {
    return this.selectionMode();
  }

  filterText(): string {
    return this.filterTextSignal();
  }

  nodeVisible(node: TreeNode): boolean {
    const filter = this.filterTextSignal().trim().toLowerCase();
    return filter === '' || nodeMatchesFilter(node, filter);
  }

  getTemplateForNode(node: TreeNode): TemplateRef<{ $implicit: TreeNode }> | null {
    const templates = this.nodeTemplateMap();
    return templates.get(node.type ?? '') ?? templates.get('') ?? null;
  }

  isSelected(node: TreeNode): boolean {
    const sel = this.selection();
    return this.selectionMode() === 'single' ? sel === node : Array.isArray(sel) && (sel as readonly TreeNode[]).includes(node);
  }

  toggleSelect(node: TreeNode): void {
    if (this.selectionMode() === 'single') {
      if (this.selection() === node) {
        return;
      }
      this.selection.set(node);
      return;
    }
    const current = (this.selection() as readonly TreeNode[] | null) ?? [];
    const selectedSet = new Set<TreeNode>(current);
    const willSelect = !selectedSet.has(node);

    if (this.selectionMode() === 'checkbox') {
      const updateNodeAndDescendants = (target: TreeNode, select: boolean) => {
        if (select) {
          selectedSet.add(target);
        } else {
          selectedSet.delete(target);
        }
        if (this.propagateSelectionDown() && target.children) {
          for (const child of target.children) {
            updateNodeAndDescendants(child, select);
          }
        }
      };
      updateNodeAndDescendants(node, willSelect);

      if (this.propagateSelectionUp()) {
        this.syncParentsSelection(this.value(), selectedSet, node);
      }
      this.selection.set(Array.from(selectedSet));
      return;
    }

    this.selection.set(willSelect ? [...current, node] : current.filter((n) => n !== node));
  }

  onNodeDragStart(node: TreeNode): void {
    this.draggedNode = node;
  }

  onNodeDrop(dropNode: TreeNode): void {
    const dragNode = this.draggedNode;
    this.draggedNode = null;
    if (!dragNode || dragNode === dropNode) {
      return;
    }
    this.nodeDrop.emit({ dragNode, dropNode });
  }

  private syncParentsSelection(nodes: readonly TreeNode[], selectedSet: Set<TreeNode>, clickedNode: TreeNode): void {
    for (const parent of nodes) {
      if (!parent.children?.length) {
        continue;
      }
      this.syncParentsSelection(parent.children, selectedSet, clickedNode);
      if (parent === clickedNode && !this.propagateSelectionDown()) {
        continue;
      }
      const allChildrenSelected = parent.children.every((child) => selectedSet.has(child));
      if (allChildrenSelected) {
        selectedSet.add(parent);
      } else {
        selectedSet.delete(parent);
      }
    }
  }

  protected isRowSelectable(node: TreeNode): boolean {
    return this.selectionMode() !== null && node.selectable !== false;
  }

  protected isExpanded(node: TreeNode): boolean {
    return this.expandedOverrides().get(node) ?? node.expanded !== false;
  }

  protected trackFlatRow(_index: number, row: FlatTreeRow): TreeNode {
    return row.node;
  }

  protected flatRowClass(node: TreeNode): string {
    const selected = this.isSelected(node);
    const selectable = this.isRowSelectable(node);
    return mergeClasses(
      'flex items-center gap-1.5 px-2 text-sm transition-colors duration-(--transition-duration-base)',
      selected && this.selectionMode() !== 'checkbox' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-surface-900 dark:text-surface-50',
      selectable ? 'cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800' : '',
      selectable
        ? 'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400'
        : '',
    );
  }

  protected flatCheckboxBoxClass(node: TreeNode): string {
    return mergeClasses(
      'pointer-events-none inline-flex size-4 shrink-0 items-center justify-center rounded-sm border-2 text-white transition-colors duration-(--transition-duration-base)',
      this.isSelected(node) ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400' : 'border-surface-300 bg-transparent dark:border-surface-600',
    );
  }

  protected onFlatRowSelect(node: TreeNode): void {
    if (this.isRowSelectable(node)) {
      this.toggleSelect(node);
    }
  }

  protected toggleFlatExpanded(event: Event, node: TreeNode): void {
    event.stopPropagation();
    this.setExpanded(node, !this.isExpanded(node));
  }

  private setExpanded(node: TreeNode, expanded: boolean): void {
    const next = new Map(this.expandedOverrides());
    next.set(node, expanded);
    this.expandedOverrides.set(next);
  }

  protected onFlatRowKeydown(event: KeyboardEvent, row: FlatTreeRow, index: number): void {
    if (!this.isRowSelectable(row.node)) {
      return;
    }
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleSelect(row.node);
        return;
      case 'ArrowRight':
        event.preventDefault();
        if (row.hasChildren) {
          if (!this.isExpanded(row.node)) {
            this.setExpanded(row.node, true);
          } else {
            this.focusRowAt(index + 1);
          }
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (row.hasChildren && this.isExpanded(row.node)) {
          this.setExpanded(row.node, false);
        } else {
          this.focusRowAt(this.findParentRowIndex(index));
        }
        return;
      case 'ArrowDown':
        event.preventDefault();
        this.focusRowAt(index + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.focusRowAt(index - 1);
        return;
      case 'Home':
        event.preventDefault();
        this.focusRowAt(0);
        return;
      case 'End':
        event.preventDefault();
        this.focusRowAt(this.flatRows().length - 1);
        return;
    }
  }

  private findParentRowIndex(index: number): number {
    const rows = this.flatRows();
    const level = rows[index]?.level ?? 1;
    for (let i = index - 1; i >= 0; i--) {
      if (rows[i].level < level) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Scrolls the target row into the (possibly not-yet-rendered) viewport,
   * then focuses it — see class doc's "virtualScroll" section. A single
   * `requestAnimationFrame` isn't reliably enough: a large index jump makes
   * CDK settle its rendered range over more than one frame, sometimes
   * replacing the very row element a first-frame focus() already landed
   * on. Re-querying and re-focusing on every frame for a short window
   * means whichever frame turns out to be the *last* one that actually
   * swaps the element converges on the right, stable final focus — same
   * "real browser async needs more than one frame" territory
   * `DrawerComponent`'s own double-`requestAnimationFrame` already
   * documents, just needing more headroom here since CDK's own settling
   * isn't bounded to exactly two frames the way a CSS transition-start is.
   */
  private focusRowAt(index: number): void {
    const rows = this.flatRows();
    if (index < 0 || index >= rows.length) {
      return;
    }
    const vp = this.viewport();
    vp?.scrollToIndex(index, 'auto');
    this.pollFocusRow(index, 40);
  }

  private pollFocusRow(index: number, framesRemaining: number): void {
    if (framesRemaining <= 0) {
      return;
    }
    requestAnimationFrame(() => {
      this.viewport()
        ?.elementRef.nativeElement.querySelector<HTMLElement>(`[data-tree-row-index="${index}"]`)
        ?.focus();
      this.pollFocusRow(index, framesRemaining - 1);
    });
  }
}
