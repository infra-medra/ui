import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { visibleItems } from '../menu/menu-visibility';
import { MenuItem } from '../menu/menu.types';
import { TieredMenuItem } from '../tiered-menu/tiered-menu.types';
import { PanelMenuNodeComponent } from './panel-menu-node.component';

/**
 * PanelMenu primitive (Tier 3): an always-visible, inline expand/collapse
 * navigation tree — same recursive `TieredMenuItem[]` shape TieredMenu
 * takes (reused directly, not a new parallel type), rendered as nested
 * disclosure lists (`PanelMenuNodeComponent`) instead of TieredMenu's
 * cascading flyout overlays. Use PanelMenu for a persistent sidebar-style
 * navigation tree; use TieredMenu for a transient popup menu triggered from
 * a button.
 *
 * **Programmatic expand control + `collapseAll()` (added 2026-09-08, Onda
 * 5, item 13)**: `expandedItems` is a `model<ReadonlySet<TieredMenuItem>>`
 * — every currently-expanded node with children, by **object reference**,
 * not a stable string key (`MenuItem`/`TieredMenuItem` has no `id`/`key`
 * field). A consumer can bind `[(expandedItems)]` directly, or just call
 * `collapseAll()`/`expandAll()` via a template reference — e.g. auto-open
 * the section containing the active route on navigation. The reference-
 * identity trade-off is real and deliberate: rebuilding `items` as new
 * object literals on every change (rather than mutating/reusing the same
 * objects) would silently reset expand state, since a new object is never
 * `===` the old one the `Set` remembers. Documented, not hidden — the same
 * "known trade-off, not a bug" treatment already given to
 * `OrganizationChart`'s own local-state cut.
 */
@Component({
  selector: 'med-panel-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [PanelMenuNodeComponent],
  template: `
    <ul [attr.aria-label]="ariaLabel()">
      @for (item of shownItems(); track $index) {
        <med-panel-menu-node
          [item]="item"
          [expandedItems]="expandedItems()"
          (activated)="itemSelect.emit($event)"
          (toggleRequested)="onToggleRequested($event)"
        />
      }
    </ul>
  `,
})
export class PanelMenuComponent {
  readonly items = input<readonly TieredMenuItem[]>([]);
  readonly ariaLabel = input<string | null>(null);
  readonly itemSelect = output<MenuItem>();

  /** Root items without the `visible: false` entries — same objects, so `expandedItems` identity is untouched. */
  protected readonly shownItems = computed(() => visibleItems(this.items()));

  readonly expandedItems = model<ReadonlySet<TieredMenuItem>>(new Set());

  protected onToggleRequested(item: TieredMenuItem): void {
    this.expandedItems.update((current) => {
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }

  /** Collapses every node in the tree, at every depth. */
  collapseAll(): void {
    this.expandedItems.set(new Set());
  }

  /** Expands every node that has children, at every depth. */
  expandAll(): void {
    const all = new Set<TieredMenuItem>();
    const visit = (nodes: readonly TieredMenuItem[]) => {
      for (const node of nodes) {
        if (node.items && node.items.length > 0) {
          all.add(node);
          visit(node.items);
        }
      }
    };
    visit(this.items());
    this.expandedItems.set(all);
  }
}
