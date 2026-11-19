import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { MenuRouterLinkDirective } from '../menu/menu-router-link.directive';
import { visibleItems } from '../menu/menu-visibility';
import { TieredMenuItem } from '../tiered-menu/tiered-menu.types';

/**
 * One node of `<med-panel-menu>`'s tree — recursive (lists itself in its
 * own `imports`, the standard Angular pattern for a tree component), one
 * instance per `TieredMenuItem` (reused as-is: same recursive
 * `label`/`icon`/`disabled`/`separator`/`command`/`items` shape TieredMenu
 * already has, just rendered inline as an expand/collapse disclosure list
 * instead of cascading flyout overlays).
 *
 * Plain native `<button aria-expanded>` disclosure semantics, not a full
 * ARIA "Tree View" (`role="tree"`/`treeitem`, arrow-key roving focus,
 * single-selection model) — a navigation menu of links/actions doesn't
 * really have "selection" the way a tree of, say, file-system nodes does,
 * and a real `<button>` already gets Tab/Enter/Space for free, same
 * "native semantics over custom widget" reasoning already used for
 * Accordion's own header buttons. Each level indents via `level`
 * (incremented by the parent for its own children), not nested nesting
 * measured from the DOM.
 *
 * **Expanded state lifted to the root (2026-09-08**: this
 * node no longer owns a private `expanded` signal — `expandedItems` (the
 * shared `Set<TieredMenuItem>` `PanelMenuComponent.expandedItems` owns) is
 * passed down unchanged at every recursion level, and `expanded()` is just
 * a membership check against it. A click doesn't mutate anything locally
 * either — it emits `toggleRequested`, which bubbles up node by node (each
 * level re-emits its child's event, same "bubble by re-emitting" shape
 * `activated` already used) until `PanelMenuComponent` sees it and flips
 * membership in its own model. This is what makes programmatic expand/
 * collapse (including `collapseAll()`) possible from outside the tree.
 */
@Component({
  selector: 'med-panel-menu-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, PanelMenuNodeComponent, MenuRouterLinkDirective],
  template: `
    @if (item().separator) {
      <li role="separator" class="my-1 h-px bg-surface-200 dark:bg-surface-700" [style.marginInlineStart.rem]="level() * 1.25"></li>
    } @else if (hasChildren()) {
      <li>
        <button
          type="button"
          [disabled]="item().disabled"
          [attr.aria-expanded]="expanded()"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-surface-900 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:text-surface-50 dark:hover:bg-surface-800"
          [style.paddingInlineStart.rem]="0.5 + level() * 1.25"
          (click)="toggle()"
        >
          <med-icon name="chevron-right" variant="mini" [class]="chevronClass()" />
          @if (item().icon) {
            <med-icon [name]="item().icon!" variant="mini" class="size-4 shrink-0" />
          }
          <span class="flex-1 truncate">{{ item().label }}</span>
        </button>
        @if (expanded()) {
          <ul>
            @for (child of shownChildren(); track $index) {
              <med-panel-menu-node
                [item]="child"
                [level]="level() + 1"
                [expandedItems]="expandedItems()"
                (activated)="activated.emit($event)"
                (toggleRequested)="toggleRequested.emit($event)"
              />
            }
          </ul>
        }
      </li>
    } @else if (item().routerLink !== undefined && !item().disabled) {
      <li>
        <a
          [medMenuRouterLink]="item()"
          [target]="item().target ?? null"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-surface-900 hover:bg-surface-100 aria-[current=page]:text-brand-600 dark:text-surface-50 dark:hover:bg-surface-800 dark:aria-[current=page]:text-brand-400"
          [style.paddingInlineStart.rem]="0.5 + 1.25 + level() * 1.25"
          (click)="activate()"
        >
          @if (item().icon) {
            <med-icon [name]="item().icon!" variant="mini" class="size-4 shrink-0" />
          }
          <span class="min-w-0 flex-1 truncate">{{ item().label }}</span>
          @if (item().badge) {
            <span class="shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item().badge }}</span>
          }
        </a>
      </li>
    } @else if (item().url && !item().disabled) {
      <li>
        <a
          [href]="item().url!"
          [target]="item().target ?? null"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-surface-900 hover:bg-surface-100 dark:text-surface-50 dark:hover:bg-surface-800"
          [style.paddingInlineStart.rem]="0.5 + 1.25 + level() * 1.25"
          (click)="activate()"
        >
          @if (item().icon) {
            <med-icon [name]="item().icon!" variant="mini" class="size-4 shrink-0" />
          }
          <span class="min-w-0 flex-1 truncate">{{ item().label }}</span>
          @if (item().badge) {
            <span class="shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item().badge }}</span>
          }
        </a>
      </li>
    } @else {
      <li>
        <button
          type="button"
          [disabled]="item().disabled"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-surface-900 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:text-surface-50 dark:hover:bg-surface-800"
          [style.paddingInlineStart.rem]="0.5 + 1.25 + level() * 1.25"
          (click)="activate()"
        >
          @if (item().icon) {
            <med-icon [name]="item().icon!" variant="mini" class="size-4 shrink-0" />
          }
          <span class="min-w-0 flex-1 truncate">{{ item().label }}</span>
          @if (item().badge) {
            <span class="shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item().badge }}</span>
          }
        </button>
      </li>
    }
  `,
})
export class PanelMenuNodeComponent {
  readonly item = input.required<TieredMenuItem>();
  readonly level = input(0);
  readonly expandedItems = input.required<ReadonlySet<TieredMenuItem>>();

  readonly activated = output<TieredMenuItem>();
  readonly toggleRequested = output<TieredMenuItem>();

  /** Children without the `visible: false` entries — same objects, so `expandedItems` identity is untouched. */
  protected readonly shownChildren = computed(() => visibleItems(this.item().items ?? []));

  protected readonly expanded = computed(() => this.expandedItems().has(this.item()));

  protected hasChildren(): boolean {
    return !!this.item().items && this.item().items!.length > 0;
  }

  protected readonly chevronClass = computed(() => (this.expanded() ? 'size-3.5 shrink-0 rotate-90 transition-transform' : 'size-3.5 shrink-0 transition-transform'));

  protected toggle(): void {
    if (!this.item().disabled) {
      this.toggleRequested.emit(this.item());
    }
  }

  protected activate(): void {
    const item = this.item();
    if (item.disabled) {
      return;
    }
    item.command?.();
    this.activated.emit(item);
  }
}
