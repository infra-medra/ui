import { ChangeDetectionStrategy, Component, OnDestroy, TemplateRef, booleanAttribute, contentChild, inject, input, output } from '@angular/core';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { MenuPanelComponent, openMenuPanel } from './menu-panel.component';
import { MenuItem, MenuItemGroup } from './menu.types';

let nextMenuId = 0;

/**
 * Menu primitive (Tier 1): a popup list of commands, declared once in the
 * template and controlled imperatively by whatever trigger opens it —
 * `<med-menu #menu [items]="items" /><button (click)="menu.toggle($event.currentTarget)">`
 * — rather than Angular Material's `matMenuTriggerFor` directive-pair
 * pattern. Simpler: no extra directive class, and `<med-menu>` behaves like
 * any other overlay-backed primitive in this library (Select, Tooltip):
 * one component owns both its own state and the `OverlayService` call.
 * The host is `hidden` (`display: none`) since `<med-menu>` itself is never
 * part of the visible layout — only its overlay panel is, once opened.
 *
 * **`popup`**: default `true` keeps the exact behavior
 * above. `popup=false` renders `MenuPanelComponent` directly and always
 * visible in the host's own template instead — a persistent sidebar-style
 * menu, same shape `TieredMenuComponent`'s own `popup`
 * already established; `MenuPanelComponent.autoFocus` (`false` here) is
 * what makes that safe, for the identical reason documented there.
 * `toggle()`/`open()`/`close()`/`isOpen` remain popup-only; calling them
 * while `popup=false` is a no-op.
 *
 * **Grouping**: `items` accepts `readonly MenuItemGroup[]` in addition to
 * the existing flat `readonly MenuItem[]` — see `MenuPanelComponent`'s own
 * doc for the rendering/keyboard-nav details, identical in both `popup`
 * modes since both paths render the same panel.
 */
@Component({
  selector: 'med-menu',
  standalone: true,
  imports: [MenuPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "popup() ? 'hidden' : 'block'" },
  template: `
    @if (!popup()) {
      <med-menu-panel
        [panelId]="panelElementId"
        [items]="items()"
        [autoFocus]="false"
        [startTemplate]="startTemplate() ?? null"
        [endTemplate]="endTemplate() ?? null"
        [itemTemplate]="itemTemplate() ?? null"
        (itemActivated)="itemSelect.emit($event)"
      />
    }
  `,
})
export class MenuComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextMenuId++;
  protected readonly panelElementId = `med-menu-panel-${this.instanceId}`;

  readonly items = input<readonly MenuItem[] | readonly MenuItemGroup[]>([]);
  readonly popup = input(true, { transform: booleanAttribute });
  readonly itemSelect = output<MenuItem>();

  protected readonly startTemplate = contentChild('start', { read: TemplateRef });
  protected readonly endTemplate = contentChild('end', { read: TemplateRef });
  protected readonly itemTemplate = contentChild('item', { read: TemplateRef });

  private handle: OverlayHandle<MenuPanelComponent, void> | null = null;

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

    const handle = openMenuPanel(this.overlayService, origin, this.items(), this.panelElementId);
    handle.componentRef.setInput('startTemplate', this.startTemplate() ?? null);
    handle.componentRef.setInput('endTemplate', this.endTemplate() ?? null);
    handle.componentRef.setInput('itemTemplate', this.itemTemplate() ?? null);
    this.handle = handle;

    handle.componentRef.instance.itemActivated.subscribe((item: MenuItem) => {
      this.itemSelect.emit(item);
      handle.close();
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());

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
