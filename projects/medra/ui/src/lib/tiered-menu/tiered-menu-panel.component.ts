import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, booleanAttribute, computed, inject, input, output, signal, viewChild, viewChildren } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { IconComponent } from '../icon/icon.component';
import { ConnectedOverlayOrigin, OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { selectOptionVariants } from '../select/select.styles';
import { MENU_PANEL_CLASS } from '../menu/menu-panel.component';
import { MenuRouterLinkDirective } from '../menu/menu-router-link.directive';
import { visibleItems } from '../menu/menu-visibility';
import { TieredMenuItem } from './tiered-menu.types';

let nextTieredPanelId = 0;

/**
 * A submenu always opens flush against the side of the item that triggered
 * it, never below like a top-level `DEFAULT_CONNECTED_POSITIONS` panel —
 * `end`→`start` is the "cascade to the right" case (the common one),
 * flipping to `start`→`end` (cascade left) when it doesn't fit; same
 * fallback-list technique ContextMenu's own `CONTEXT_MENU_POSITIONS`
 * override already established via `OverlayService.openConnected()`'s
 * `positions` option.
 */
const SUBMENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 2 },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -2 },
];

/**
 * Recursive submenu panel for TieredMenu — deliberately its own component,
 * not a reuse (even a modified one) of `MenuPanelComponent`: that component
 * is shared unchanged by Menu, Menubar, and ContextMenu today, and giving
 * it cascading-submenu behavior none of those three need would risk all
 * three for one new consumer. The row-rendering/keyboard-nav overlap this
 * duplicates is modest next to that risk.
 *
 * Each instance opens at most one child submenu of its own (via this same
 * component, `OverlayService.openConnected()`), so the whole tree is just
 * a chain of independently-opened connected overlays, not one deeply
 * nested template. That chain closes itself for free: `ngOnDestroy` closes
 * this panel's own child handle (if any), so destroying any ancestor
 * (Angular tears down a `ComponentRef` on `OverlayRef.dispose()`) cascades
 * the close all the way down through everyone's `ngOnDestroy`, with no
 * manual bookkeeping needed beyond that one line at each level.
 *
 * A leaf `itemActivated` bubbles *up* instead (each level re-emits its
 * child's event) until `TieredMenuComponent` sees it and closes the root —
 * the same cascade-via-`ngOnDestroy` then closes everything below it.
 * `closeRequested` (Tab) bubbles the same way. `collapseRequested`
 * (ArrowLeft) does not bubble past one level — the immediate parent closes
 * just that one child and returns focus to the item that opened it, per
 * the ARIA APG submenu keyboard model.
 *
 * **Typeahead**: typing a printable character moves `activeIndex` to the first enabled,
 * non-separator item whose label starts with the accumulated buffer (case-insensitive), clearing
 * that buffer after 500ms of no further keystrokes — simplified to always search from the start of
 * the list rather than cyclically from the current `activeIndex`, matching the same simplification
 * this library's `SelectPanelComponent.setActiveByPrefix()` already established for the identical
 * class of search. A miss leaves `activeIndex` untouched. Genuinely useful for
 * `TieredMenuComponent` too (both consumers share this one panel), not ContextMenu-specific.
 */
@Component({
  selector: 'med-tiered-menu-panel',
  standalone: true,
  imports: [IconComponent, MenuRouterLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ul
      #list
      role="menu"
      tabindex="-1"
      class="min-w-48 py-1 focus:outline-none"
      [attr.aria-activedescendant]="activeItemId()"
      (keydown)="onKeydown($event)"
    >
      @for (item of shownItems(); track $index; let i = $index) {
        @if (item.separator) {
          <li role="separator" class="my-1 h-px bg-surface-200 dark:bg-surface-700"></li>
        } @else {
          <li
            #itemEl
            [id]="itemId(i)"
            role="menuitem"
            [attr.aria-disabled]="item.disabled ? 'true' : null"
            [attr.aria-haspopup]="hasChildren(item) ? 'menu' : null"
            [attr.aria-expanded]="hasChildren(item) ? openIndex() === i : null"
            [class]="rowClass(item, i)"
            (pointerdown)="onItemPointerDown($event, item, i)"
            (pointerenter)="onItemPointerEnter(i, item)"
            (pointerleave)="onItemPointerLeave()"
          >
            @if (item.icon) {
              <med-icon [name]="item.icon" variant="mini" class="size-4 shrink-0" />
            }
            @if (item.routerLink !== undefined && !hasChildren(item)) {
              <a [medMenuRouterLink]="item" [target]="item.target ?? null" class="min-w-0 flex-1 truncate" (click)="onLinkClick(item)">{{ item.label }}</a>
            } @else if (item.url && !hasChildren(item)) {
              <a [href]="item.url" [target]="item.target ?? null" class="min-w-0 flex-1 truncate">{{ item.label }}</a>
            } @else {
              <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
            }
            @if (item.badge) {
              <span class="shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item.badge }}</span>
            }
            @if (hasChildren(item)) {
              <med-icon name="chevron-right" variant="mini" class="size-3.5 shrink-0" />
            }
          </li>
        }
      }
    </ul>
  `,
})
export class TieredMenuPanelComponent implements AfterViewInit, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextTieredPanelId++;

  readonly panelId = input.required<string>();
  readonly items = input<readonly TieredMenuItem[]>([]);
  /** `false` for `TieredMenuComponent`'s inline (`popup=false`) root panel — an always-visible menu shouldn't steal focus from the rest of the page on render, unlike a just-opened popup. Default `true` preserves every existing popup/submenu instance's behavior unchanged. */
  readonly autoFocus = input(true, { transform: booleanAttribute });

  /** `items()` without the `visible: false` entries. Every index below (active row, open submenu, typeahead) refers to this list, so a hidden item is never reachable. */
  protected readonly shownItems = computed(() => visibleItems(this.items()));

  readonly itemActivated = output<TieredMenuItem>();
  readonly closeRequested = output<void>();
  readonly collapseRequested = output<void>();

  protected readonly activeIndex = signal(-1);
  protected readonly openIndex = signal<number | null>(null);

  private readonly listRef = viewChild.required<ElementRef<HTMLUListElement>>('list');
  private readonly itemRefs = viewChildren<ElementRef<HTMLLIElement>>('itemEl');
  private handle: OverlayHandle<TieredMenuPanelComponent, void> | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private searchBuffer = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

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

  ngOnDestroy(): void {
    this.clearHoverTimer();
    this.clearSearchTimeout();
    this.closeSubmenu();
  }

  protected hasChildren(item: TieredMenuItem): boolean {
    return !!item.items && item.items.length > 0;
  }

  protected itemId(index: number): string {
    return `${this.panelId()}-item-${index}`;
  }

  protected rowClass(item: TieredMenuItem, index: number): string {
    return selectOptionVariants({ active: index === this.activeIndex(), disabled: !!item.disabled });
  }

  protected onItemPointerDown(event: Event, item: TieredMenuItem, index: number): void {
    // A leaf `routerLink` item activates on the `<a>`'s own click (see `onLinkClick`): activating on pointerdown would close the menu — and remove the `<a>` — before the click that navigates ever happens.
    if (item.routerLink !== undefined && !item.disabled && !this.hasChildren(item)) {
      this.activeIndex.set(index);
      return;
    }
    event.preventDefault(); // keep focus on the list instead of it jumping to the <li>
    if (item.disabled) {
      return;
    }
    this.activeIndex.set(index);
    if (this.hasChildren(item)) {
      // Never toggle-closed on click: hover has very likely already opened
      // it (the same 150ms delay a click waits out just by moving the
      // mouse there first), so a click on an already-open parent must
      // leave it open, not slam it shut while the user is navigating in.
      this.openSubmenuAt(index);
    } else {
      this.activate(item);
    }
  }

  protected onItemPointerEnter(index: number, item: TieredMenuItem): void {
    if (item.disabled) {
      return;
    }
    this.activeIndex.set(index);
    this.clearHoverTimer();
    if (this.hasChildren(item)) {
      this.hoverTimer = setTimeout(() => this.openSubmenuAt(index), 150);
    } else {
      this.closeSubmenu();
    }
  }

  protected onItemPointerLeave(): void {
    this.clearHoverTimer();
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
      case 'ArrowRight':
        event.preventDefault();
        this.openActiveSubmenu();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.collapseRequested.emit();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateCurrent();
        break;
      case 'Tab':
        this.closeRequested.emit();
        break;
      default:
        this.onTypeaheadKey(event);
        break;
    }
  }

  /** See class doc's "Typeahead" section. Ignores modifier-combo keypresses (Ctrl/Alt/Meta) so browser/OS shortcuts routed through this list aren't swallowed as search characters. */
  private onTypeaheadKey(event: KeyboardEvent): void {
    if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    this.searchBuffer += event.key;
    const index = this.findPrefixMatchIndex(this.searchBuffer);
    if (index !== -1) {
      event.preventDefault();
      this.activeIndex.set(index);
    }
    this.clearSearchTimeout();
    this.searchTimeout = setTimeout(() => {
      this.searchBuffer = '';
      this.searchTimeout = null;
    }, 500);
  }

  private findPrefixMatchIndex(text: string): number {
    const normalized = text.toLowerCase();
    return this.shownItems().findIndex((item) => !item.separator && !item.disabled && item.label?.toLowerCase().startsWith(normalized));
  }

  private clearSearchTimeout(): void {
    if (this.searchTimeout !== null) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }

  private activateCurrent(): void {
    const item = this.shownItems()[this.activeIndex()];
    if (!item || item.disabled || item.separator) {
      return;
    }
    if (this.hasChildren(item)) {
      this.openActiveSubmenu();
    } else if (item.routerLink !== undefined) {
      // Focus stays on the list (aria-activedescendant), so Enter must click the item's own `<a>` to navigate through the same path as a mouse click.
      this.listRef().nativeElement.querySelector<HTMLAnchorElement>(`[id="${this.itemId(this.activeIndex())}"] a`)?.click();
    } else {
      this.activate(item);
    }
  }

  protected onLinkClick(item: TieredMenuItem): void {
    if (!item.disabled) {
      this.activate(item);
    }
  }

  private activate(item: TieredMenuItem): void {
    item.command?.();
    this.itemActivated.emit(item);
  }

  /** Opens the active item's submenu if it has one — the child's own `ngAfterViewInit` (unchanged, same as `MenuPanelComponent`'s) already focuses it and seeds its `activeIndex`, so nothing further is needed here. */
  private openActiveSubmenu(): void {
    const index = this.activeIndex();
    const item = this.shownItems()[index];
    if (item && this.hasChildren(item)) {
      this.openSubmenuAt(index);
    }
  }

  private openSubmenuAt(index: number): void {
    if (this.openIndex() === index) {
      return;
    }
    this.closeSubmenu();
    const item = this.shownItems()[index];
    const origin = this.itemRefs()[index];
    if (!item || !origin) {
      return;
    }

    const handle = this.overlayService.openConnected<TieredMenuPanelComponent, void>(origin as ConnectedOverlayOrigin, TieredMenuPanelComponent, {
      panelClass: MENU_PANEL_CLASS,
      positions: SUBMENU_POSITIONS,
      restoreFocus: false, // the parent panel (still open) manages focus itself on collapse, not the overlay machinery
    });
    handle.componentRef.setInput('panelId', `${this.panelId()}-sub-${index}`);
    handle.componentRef.setInput('items', item.items);
    this.handle = handle;
    this.openIndex.set(index);

    handle.componentRef.instance.itemActivated.subscribe((activated) => this.itemActivated.emit(activated));
    handle.componentRef.instance.closeRequested.subscribe(() => this.closeRequested.emit());
    handle.componentRef.instance.collapseRequested.subscribe(() => {
      this.closeSubmenu();
      this.listRef().nativeElement.focus();
    });

    handle.closed$.subscribe(() => {
      if (this.handle === handle) {
        this.handle = null;
        this.openIndex.set(null);
      }
    });
  }

  private closeSubmenu(): void {
    this.handle?.close();
  }

  private clearHoverTimer(): void {
    if (this.hoverTimer !== null) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  private firstEnabledIndex(): number {
    return this.enabledIndexes()[0] ?? -1;
  }

  private lastEnabledIndex(): number {
    const enabled = this.enabledIndexes();
    return enabled[enabled.length - 1] ?? -1;
  }

  private enabledIndexes(): number[] {
    return this.shownItems()
      .map((item, index) => (item.disabled || item.separator ? -1 : index))
      .filter((index) => index !== -1);
  }

  private moveActive(step: 1 | -1): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    const currentPosition = enabled.indexOf(this.activeIndex());
    const nextPosition = currentPosition === -1 ? (step === 1 ? 0 : enabled.length - 1) : (currentPosition + step + enabled.length) % enabled.length;
    this.activeIndex.set(enabled[nextPosition]);
  }
}
