import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, linkedSignal, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { OrgChartHost } from './organization-chart.tokens';
import { OrgChartNode } from './organization-chart.types';

/** Connector line above a child `<li>`: only the segment between siblings is drawn, never past the outermost children (the classic pure-CSS org-chart technique). */
function connectorClass(first: boolean, last: boolean): string {
  if (first && last) {
    return 'hidden';
  }
  if (first) {
    return 'left-1/2 right-0';
  }
  if (last) {
    return 'left-0 right-1/2';
  }
  return 'inset-x-0';
}

/**
 * One node of an `OrganizationChartComponent` tree — recurses into itself
 * for each child, same self-referencing standalone-component technique any
 * recursive tree UI needs (Angular explicitly supports a standalone
 * component listing itself in its own `imports`).
 *
 * **Expand/collapse is local, per-instance state** (`linkedSignal`, seeded
 * from `node().expanded` but independently toggleable afterward), not a
 * shadow map keyed by node identity on the top-level component: because a
 * child node's identity change already remounts this component fresh
 * (`@for` in the parent tracks by the node object itself), there's no
 * cross-render state to lose by keeping `expanded` this simple.
 *
 * **The node box is a `<div role="button">` re-implementation, not a real
 * `<button>`**, when `selectable` — same trade-off `SelectComponent`'s
 * trigger already documents: it has to contain a real nested `<button>`
 * (the expand/collapse toggle), and a `<button>` can't nest another
 * `<button>`.
 *
 * **Arrow-key navigation (Wave 2 fix — 2026-08-19)**: unlike `TreeNodeComponent`
 * (a vertical list, where Up/Down/Home/End walk the whole flattened visible
 * tree), an org chart is genuinely 2-D — one box above, its children laid
 * out in a horizontal row below — so the natural mapping follows that
 * layout instead of Tree's: `ArrowUp` moves to the node's own parent,
 * `ArrowDown` moves to its first (selectable) child — expanding the node
 * first if it's collapsed, mirroring Tree's `ArrowRight`-expands-then-moves
 * two-step — and `ArrowLeft`/`ArrowRight`/`Home`/`End` move among the
 * current node's *siblings* rather than the whole chart, since there is no
 * single flattened order across branches for Home/End to jump to the "start"
 * or "end" of. Each node still has no direct reference to its parent or
 * siblings, so navigation is resolved the same way Tree's own doc comment
 * explains: DOM queries scoped with `:scope >` against the nearest
 * structural ancestor (the enclosing `<li>`/`<ul>` pair, or — for the
 * parent — the nearest ancestor `<med-org-chart-node>`), rather than
 * threading parent/sibling references through the recursive component tree.
 * Every query additionally scopes to `[role="button"]` boxes, which only
 * selectable nodes render, so a `selectable: false` node (e.g. a vacant
 * position) is transparently skipped as a navigation target — consistent
 * with it never being reachable by Tab either.
 *
 * Tab order itself is unchanged from the original v1 scope cut: every
 * selectable node remains independently Tab-reachable (no roving tabindex),
 * same trade-off `Dock`'s toolbar deliberately does NOT make here — an org
 * chart is browsed non-linearly (jumping straight to a distant box is
 * common), so collapsing it to one Tab stop would cost more than it saves.
 */
@Component({
  selector: 'med-org-chart-node',
  standalone: true,
  imports: [IconComponent, OrgChartNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col items-center">
      <div
        #boxEl
        [class]="nodeBoxClass()"
        [attr.role]="isSelectable() ? 'button' : null"
        [attr.tabindex]="isSelectable() ? 0 : null"
        [attr.aria-pressed]="isSelectable() && mode() !== 'checkbox' ? isSelected() : null"
        [attr.aria-checked]="isSelectable() && mode() === 'checkbox' ? (isIndeterminate() ? 'mixed' : isSelected()) : null"
        (click)="onSelect()"
        (keydown)="onKeydown($event)"
      >
        @if (mode() === 'checkbox' && isSelectable()) {
          <span [class]="checkboxBoxClass()" aria-hidden="true">
            @if (isSelected()) {
              <med-icon name="check" variant="solid" class="size-3" />
            } @else if (isIndeterminate()) {
              <med-icon name="minus" variant="solid" class="size-3" />
            }
          </span>
        }
        <span class="truncate">{{ node().label }}</span>
        @if (hasChildren()) {
          <button
            type="button"
            class="ml-1 shrink-0 rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            [attr.aria-expanded]="expanded()"
            [attr.aria-label]="expanded() ? collapseLabel() : expandLabel()"
            (click)="toggleExpanded($event)"
          >
            <med-icon name="chevron-down" variant="mini" class="size-3.5" [class]="expanded() ? '' : '-rotate-90'" />
          </button>
        }
      </div>

      @if (hasChildren() && expanded()) {
        <div class="h-4 w-px bg-surface-300 dark:bg-surface-600"></div>
        <ul class="relative flex">
          @for (child of node().children; track child; let first = $first; let last = $last) {
            <li class="relative flex flex-col items-center px-4">
              <div class="absolute top-0 h-px bg-surface-300 dark:bg-surface-600" [class]="connectorClassFor(first, last)"></div>
              <div class="h-4 w-px bg-surface-300 dark:bg-surface-600"></div>
              <med-org-chart-node [node]="child" />
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class OrgChartNodeComponent {
  private readonly host = inject(OrgChartHost);

  readonly node = input.required<OrgChartNode>();
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly expandLabel = input('Expand');
  readonly collapseLabel = input('Collapse');

  protected readonly expanded = linkedSignal(() => this.node().expanded !== false);

  protected readonly hasChildren = computed(() => (this.node().children?.length ?? 0) > 0);
  protected readonly isSelectable = computed(() => this.host.mode() !== null && this.node().selectable !== false);
  protected readonly isSelected = computed(() => this.host.isSelected(this.node()));
  protected readonly mode = computed(() => this.host.mode());
  protected readonly isIndeterminate = computed(() => this.host.isIndeterminate(this.node()));

  protected readonly nodeBoxClass = computed(() =>
    mergeClasses(
      'flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors duration-(--transition-duration-base)',
      this.isSelected() && this.mode() !== 'checkbox'
        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-300'
        : 'border-surface-200 bg-surface-0 text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-50',
      this.isSelectable() ? 'cursor-pointer hover:border-surface-300 dark:hover:border-surface-600' : '',
      this.isSelectable()
        ? 'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400'
        : '',
      this.node().class ?? '',
    ),
  );

  /**
   * Deliberately not `checkboxBoxVariants` (Checkbox's own decorative-box
   * CVA) as-is — same reasoning `TreeNodeComponent.checkboxBoxClass` already
   * documents: there's no real `<input>` here for `peer-checked:*`/
   * `peer-indeterminate:*` to match against (selection is driven by the
   * box's own click/keydown), so this computes the filled/unfilled/
   * indeterminate look directly off `isSelected()`/`isIndeterminate()`.
   */
  protected readonly checkboxBoxClass = computed(() =>
    mergeClasses(
      'pointer-events-none inline-flex size-4 shrink-0 items-center justify-center rounded-sm border-2 text-white transition-colors duration-(--transition-duration-base)',
      this.isSelected() || this.isIndeterminate()
        ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400'
        : 'border-surface-300 bg-transparent dark:border-surface-600',
    ),
  );

  protected connectorClassFor(first: boolean, last: boolean): string {
    return connectorClass(first, last);
  }

  protected onSelect(): void {
    if (this.isSelectable()) {
      this.host.toggleSelect(this.node());
    }
  }

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
      case 'ArrowDown':
        event.preventDefault();
        if (this.hasChildren()) {
          if (!this.expanded()) {
            this.setExpanded(true);
          } else {
            this.focusFirstChild();
          }
        }
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.focusParent();
        return;
      case 'ArrowRight':
        event.preventDefault();
        this.focusSibling(1);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusSibling(-1);
        return;
      case 'Home':
        event.preventDefault();
        this.focusSiblingEdge('first');
        return;
      case 'End':
        event.preventDefault();
        this.focusSiblingEdge('last');
        return;
    }
  }

  protected toggleExpanded(event: Event): void {
    event.stopPropagation();
    this.setExpanded(!this.expanded());
  }

  private setExpanded(value: boolean): void {
    this.expanded.set(value);
    this.host.reportExpandedChange(this.node(), value);
  }

  private readonly boxRef = viewChild.required<ElementRef<HTMLElement>>('boxEl');

  /**
   * Every selectable sibling box, in document order — scoped to the `<ul>`
   * that directly contains this node's own `<li>` (not the whole chart), via
   * the same `:scope >` trick `TreeNodeComponent.focusAncestorRow()` already
   * documents. The root node has no enclosing `<li>` (it's rendered directly
   * by `OrganizationChartComponent`, not inside a child `<ul>`), so this
   * naturally returns `[]` for it — the root has no siblings, matching the
   * `ArrowLeft`/`ArrowRight`/`Home`/`End` no-op that already implies.
   */
  private siblingBoxes(): HTMLElement[] {
    const li = this.boxRef().nativeElement.closest('li');
    const ul = li?.parentElement;
    return ul ? Array.from(ul.querySelectorAll<HTMLElement>(':scope > li > med-org-chart-node > div > [role="button"]')) : [];
  }

  private focusSibling(step: 1 | -1): void {
    const boxes = this.siblingBoxes();
    const index = boxes.indexOf(this.boxRef().nativeElement);
    if (index === -1) {
      return;
    }
    boxes[index + step]?.focus();
  }

  private focusSiblingEdge(edge: 'first' | 'last'): void {
    const boxes = this.siblingBoxes();
    (edge === 'first' ? boxes[0] : boxes[boxes.length - 1])?.focus();
  }

  /** First selectable child box, in document order, within this node's own children `<ul>` (only rendered while `expanded()`). */
  private focusFirstChild(): void {
    const ul = this.boxRef().nativeElement.parentElement?.querySelector<HTMLElement>(':scope > ul');
    const firstChildBox = ul?.querySelector<HTMLElement>(':scope > li > med-org-chart-node > div > [role="button"]');
    firstChildBox?.focus();
  }

  /**
   * The parent node's own box. This node's `<li>` lives inside the parent's
   * children `<ul>`, which is itself a direct child of the parent
   * `OrgChartNodeComponent`'s own root `<div class="flex flex-col
   * items-center">` — so `closest('med-org-chart-node')` starting from that
   * `<ul>` (not from this node's own host, which would match itself) lands
   * on the parent's host element, whose direct-child box is one more
   * `:scope >` step down.
   */
  private focusParent(): void {
    const li = this.boxRef().nativeElement.closest('li');
    const ul = li?.parentElement;
    const parentHost = ul?.closest('med-org-chart-node');
    const parentBox = parentHost?.querySelector<HTMLElement>(':scope > div > [role="button"]');
    parentBox?.focus();
  }
}
