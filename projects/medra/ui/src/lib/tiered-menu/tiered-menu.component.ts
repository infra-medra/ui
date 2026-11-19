import { ChangeDetectionStrategy, Component, OnDestroy, booleanAttribute, inject, input, output } from '@angular/core';
import { MENU_PANEL_CLASS } from '../menu/menu-panel.component';
import { MenuItem } from '../menu/menu.types';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { TieredMenuPanelComponent } from './tiered-menu-panel.component';
import { TieredMenuItem } from './tiered-menu.types';

let nextTieredMenuId = 0;

/**
 * TieredMenu primitive (Tier 3): same declared-once, imperatively-toggled
 * shape as `MenuComponent` — `<med-tiered-menu #menu [items]="items" />
 * <button (click)="menu.toggle($event.currentTarget)">` — but items can
 * nest arbitrarily deep (`TieredMenuItem.items`), cascading sideways
 * (`TieredMenuPanelComponent`) instead of Menubar's capped one-level
 * dropdown or Menu's flat list.
 *
 * **`popup` (added 2026-09-08)**: default `true` keeps the
 * exact behavior above (host `hidden`, nothing rendered until `open()`/
 * `toggle()`). `popup=false` renders `TieredMenuPanelComponent` — the same
 * component every submenu at every depth already is — directly and always
 * visible in the host's own template instead: a persistent sidebar-style
 * menu whose *submenus* still cascade as flyout overlays on hover/click
 * (unchanged, that's `TieredMenuPanelComponent`'s own behavior regardless
 * of who renders the root), only the root itself stops being a popup.
 * `TieredMenuPanelComponent.autoFocus` (`false` here) is what makes that
 * safe — without it, an always-visible menu would steal keyboard focus
 * from the rest of the page on render, the same way a just-opened popup
 * correctly does but a persistent inline menu must not. `toggle()`/
 * `open()`/`close()`/`isOpen` remain popup-only; calling them while
 * `popup=false` is a no-op (`isOpen` is always `false` — nothing is ever
 * "closed" about an inline menu, mirroring how PanelMenu has no
 * open/close concept of its own either).
 */
@Component({
  selector: 'med-tiered-menu',
  standalone: true,
  imports: [TieredMenuPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "popup() ? 'hidden' : 'block'" },
  template: `
    @if (!popup()) {
      <med-tiered-menu-panel [panelId]="panelElementId" [items]="items()" [autoFocus]="false" (itemActivated)="itemSelect.emit($event)" />
    }
  `,
})
export class TieredMenuComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextTieredMenuId++;
  protected readonly panelElementId = `med-tiered-menu-panel-${this.instanceId}`;

  readonly items = input<readonly TieredMenuItem[]>([]);
  readonly popup = input(true, { transform: booleanAttribute });
  readonly itemSelect = output<MenuItem>();

  private handle: OverlayHandle<TieredMenuPanelComponent, void> | null = null;

  get isOpen(): boolean {
    return this.handle !== null;
  }

  toggle(origin: HTMLElement): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(origin);
    }
  }

  open(origin: HTMLElement): void {
    if (!this.popup() || this.isOpen) {
      return;
    }

    const handle = this.overlayService.openConnected<TieredMenuPanelComponent, void>(origin, TieredMenuPanelComponent, {
      panelClass: MENU_PANEL_CLASS,
    });
    handle.componentRef.setInput('panelId', this.panelElementId);
    handle.componentRef.setInput('items', this.items());
    this.handle = handle;

    handle.componentRef.instance.itemActivated.subscribe((item: MenuItem) => {
      this.itemSelect.emit(item);
      handle.close();
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());
    // No parent panel to collapse back into at the root — ArrowLeft here is a no-op.

    handle.closed$.subscribe(() => {
      this.handle = null;
    });
  }

  close(): void {
    this.handle?.close();
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }
}
