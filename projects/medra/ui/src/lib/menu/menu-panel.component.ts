import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, TemplateRef, booleanAttribute, computed, input, output, signal, viewChild } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { IconComponent } from '../icon/icon.component';
import { ConnectedOverlayOrigin, OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { selectOptionVariants } from '../select/select.styles';
import { MenuRouterLinkDirective } from './menu-router-link.directive';
import { visibleGroups, visibleItems } from './menu-visibility';
import { MenuItem, MenuItemGroup } from './menu.types';

export const MENU_PANEL_CLASS = [
  'rounded-lg',
  'border',
  'border-surface-200',
  'bg-surface-0',
  'shadow-overlay-lg',
  'overflow-hidden',
  'dark:border-surface-700',
  'dark:bg-surface-800',
];

/**
 * Shared by Menu, Menubar (each submenu button in a Menubar opens one of
 * these too), and SplitButton, so the `OverlayService.openConnected()` +
 * `setInput()` bootstrapping isn't duplicated between them (ContextMenu
 * moved to `TieredMenuPanelComponent` once it grew cascading submenus,
 *
 * exclusionElement flexibility ContextMenu required, but those parameters
 * stay for whichever future consumer anchors to something other than a
 * plain trigger element). `origin` accepts a bare viewport point (not just
 * an element) for exactly that reason; `positions`/`exclusionElement`
 * likewise.
 */
export function openMenuPanel(
  overlayService: OverlayService,
  origin: ConnectedOverlayOrigin,
  items: readonly MenuItem[] | readonly MenuItemGroup[],
  panelId: string,
  positions?: ConnectedPosition[],
  exclusionElement?: HTMLElement,
): OverlayHandle<MenuPanelComponent, void> {
  const handle = overlayService.openConnected<MenuPanelComponent, void>(origin, MenuPanelComponent, {
    panelClass: MENU_PANEL_CLASS,
    positions,
    exclusionElement,
  });
  handle.componentRef.setInput('panelId', panelId);
  handle.componentRef.setInput('items', items);
  return handle;
}

/**
 * Internal overlay content for Menu (not part of the public API — consumers
 * only ever see `<med-menu>`). Reuses `selectOptionVariants` (row
 * active/disabled classes) from Select — the same visual "row in a floating
 * list" need, just `role="menuitem"` here instead of `role="option"`.
 *
 * `aria-activedescendant` keyboard-nav pattern (ARIA APG "Menu Button"),
 * same mechanics as SelectPanelComponent but simpler: no filter, no
 * multi-pick, and every activation (Enter/Space/click) always closes the
 * menu — plus separators, which Select's options never had.
 *
 * **`autoFocus`, grouping**. `autoFocus` (default `true`)
 * mirrors `TieredMenuPanelComponent`'s own input of the same name, added
 * for the identical reason: `MenuComponent`'s new `popup=false` inline mode
 * renders this panel always-visible, and an always-visible menu must not
 * steal keyboard focus from the rest of the page on render the way a
 * just-opened popup correctly does.
 *
 * **Grouping**: `items()` accepts either a flat `readonly MenuItem[]`
 * (unchanged) or a `readonly MenuItemGroup[]` — every top-level entry a
 * `{ label, items }` group
 * `hasSubMenu()` check (never a mix of both shapes at the top level).
 * `groups()` normalizes both shapes into the same internal structure (a
 * single unlabeled group when ungrouped, so the render path and keyboard
 * navigation never need to branch on which shape was passed) and flattens
 * a single running index across every group's items — Home/End/Arrow
 * keys move across group boundaries exactly, groups
 * are purely a visual/labeling grouping, not a separate keyboard scope.
 */
@Component({
  selector: 'med-menu-panel',
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent, MenuRouterLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (startTemplate(); as t) {
      <div class="border-b border-surface-200 px-3 py-2 dark:border-surface-700">
        <ng-container [ngTemplateOutlet]="t" />
      </div>
    }
    <ul
      #list
      role="menu"
      tabindex="-1"
      class="min-w-40 py-1 focus:outline-none"
      [attr.aria-activedescendant]="activeItemId()"
      (keydown)="onKeydown($event)"
    >
      @for (group of groups(); track $index) {
        @if (group.label) {
          <li role="none" class="px-3 py-1.5 text-xs font-semibold text-surface-500 dark:text-surface-400">{{ group.label }}</li>
        }
        @for (entry of group.items; track entry.flatIndex) {
          @if (entry.item.separator) {
            <li role="separator" class="my-1 h-px bg-surface-200 dark:bg-surface-700"></li>
          } @else {
            <li
              [id]="itemId(entry.flatIndex)"
              role="menuitem"
              [attr.aria-disabled]="entry.item.disabled ? 'true' : null"
              [class]="rowClass(entry.item, entry.flatIndex)"
              (pointerdown)="onItemPointerDown($event, entry.item)"
              (pointerenter)="onItemPointerEnter(entry.flatIndex, entry.item)"
            >
              @if (itemTemplate(); as t) {
                <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: entry.item }" />
              } @else {
                @if (entry.item.icon) {
                  <med-icon [name]="entry.item.icon" variant="mini" class="size-4 shrink-0" />
                }
                @if (entry.item.routerLink !== undefined) {
                  <a [medMenuRouterLink]="entry.item" [target]="entry.item.target ?? null" class="min-w-0 flex-1 truncate" (click)="onLinkClick(entry.item)">{{ entry.item.label }}</a>
                } @else if (entry.item.url) {
                  <a [href]="entry.item.url" [target]="entry.item.target ?? null" class="min-w-0 flex-1 truncate">{{ entry.item.label }}</a>
                } @else {
                  <span class="min-w-0 flex-1 truncate">{{ entry.item.label }}</span>
                }
                @if (entry.item.badge) {
                  <span class="ml-auto shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ entry.item.badge }}</span>
                }
              }
            </li>
          }
        }
      }
    </ul>
    @if (endTemplate(); as t) {
      <div class="border-t border-surface-200 px-3 py-2 dark:border-surface-700">
        <ng-container [ngTemplateOutlet]="t" />
      </div>
    }
  `,
})
export class MenuPanelComponent implements AfterViewInit {
  readonly panelId = input.required<string>();
  readonly items = input<readonly MenuItem[] | readonly MenuItemGroup[]>([]);
  readonly autoFocus = input(true, { transform: booleanAttribute });
  readonly startTemplate = input<TemplateRef<unknown> | null>(null);
  readonly endTemplate = input<TemplateRef<unknown> | null>(null);
  readonly itemTemplate = input<TemplateRef<unknown> | null>(null);

  readonly itemActivated = output<MenuItem>();
  readonly closeRequested = output<void>();

  protected readonly activeIndex = signal(-1);

  private readonly listRef = viewChild.required<ElementRef<HTMLUListElement>>('list');

  protected readonly groups = computed(() => {
    const raw = this.items();
    const isGrouped = raw.some((entry) => 'items' in entry);
    // `visible: false` items are dropped before indexing, so a hidden item never takes a flat index and keyboard navigation never lands on it.
    const source: readonly MenuItemGroup[] = isGrouped ? visibleGroups(raw as readonly MenuItemGroup[]) : [{ label: '', items: visibleItems(raw as readonly MenuItem[]) }];
    let flatIndex = 0;
    return source.map((group) => ({
      label: group.label,
      items: group.items.map((item) => ({ item, flatIndex: flatIndex++ })),
    }));
  });

  protected readonly flatItems = computed(() => this.groups().flatMap((group) => group.items.map((entry) => entry.item)));

  protected readonly activeItemId = computed(() => {
    const index = this.activeIndex();
    return index >= 0 ? this.itemId(index) : null;
  });

  ngAfterViewInit(): void {
    this.activeIndex.set(this.firstEnabledIndex());
    if (this.autoFocus()) {
      this.listRef().nativeElement.focus();
    }
  }

  protected itemId(index: number): string {
    return `${this.panelId()}-item-${index}`;
  }

  protected rowClass(item: MenuItem, index: number): string {
    return selectOptionVariants({ active: index === this.activeIndex(), disabled: !!item.disabled });
  }

  protected onItemPointerDown(event: Event, item: MenuItem): void {
    // A `routerLink` item activates on the `<a>`'s own click (see `onLinkClick`): activating on pointerdown would close the popup — and remove the `<a>` — before the click that navigates ever happens.
    if (item.routerLink !== undefined && !item.disabled) {
      return;
    }
    event.preventDefault(); // keep focus on the menu instead of it jumping to the <li>
    if (!item.disabled) {
      this.activate(item);
    }
  }

  protected onItemPointerEnter(index: number, item: MenuItem): void {
    if (!item.disabled) {
      this.activeIndex.set(index);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.lastEnabledIndex());
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateCurrent();
        break;
      case 'Tab':
        // No preventDefault: closeRequested() synchronously refocuses the
        // trigger (see OverlayService.close()), so the browser's own
        // still-pending Tab action then moves focus on from there.
        this.closeRequested.emit();
        break;
    }
  }

  private activateCurrent(): void {
    const item = this.flatItems()[this.activeIndex()];
    if (item && !item.disabled && !item.separator) {
      if (item.routerLink !== undefined) {
        // Focus stays on the list (aria-activedescendant), so Enter must click the item's own `<a>` to navigate through the same path as a mouse click.
        this.listRef().nativeElement.querySelector<HTMLAnchorElement>(`[id="${this.itemId(this.activeIndex())}"] a`)?.click();
      } else {
        this.activate(item);
      }
    }
  }

  protected onLinkClick(item: MenuItem): void {
    if (!item.disabled) {
      this.activate(item);
    }
  }

  private activate(item: MenuItem): void {
    item.command?.();
    this.itemActivated.emit(item);
  }

  private enabledIndexes(): number[] {
    return this.flatItems()
      .map((item, index) => (item.disabled || item.separator ? -1 : index))
      .filter((index) => index !== -1);
  }

  private firstEnabledIndex(): number {
    return this.enabledIndexes()[0] ?? -1;
  }

  private lastEnabledIndex(): number {
    const enabled = this.enabledIndexes();
    return enabled[enabled.length - 1] ?? -1;
  }

  private moveActive(step: 1 | -1): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    const currentPosition = enabled.indexOf(this.activeIndex());
    const nextPosition =
      currentPosition === -1 ? (step === 1 ? 0 : enabled.length - 1) : (currentPosition + step + enabled.length) % enabled.length;
    this.activeIndex.set(enabled[nextPosition]);
  }
}
