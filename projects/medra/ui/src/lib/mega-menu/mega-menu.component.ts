import { ChangeDetectionStrategy, Component, OnDestroy, TemplateRef, computed, contentChild, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { MenuRouterLinkDirective } from '../menu/menu-router-link.directive';
import { visibleItems } from '../menu/menu-visibility';
import { MenuItem } from '../menu/menu.types';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { MegaMenuPanelComponent } from './mega-menu-panel.component';
import { MegaMenuItem } from './mega-menu.types';

let nextMegaMenuId = 0;

/**
 * MegaMenu primitive (Tier 3): a horizontal row of top-level commands, same
 * shape as Menubar, but the one that opens a panel does so as side-by-side
 * columns (`MegaMenuItem.columns`, via `MegaMenuPanelComponent`) instead of
 * Menubar's single flat dropdown list. A deliberately separate component
 * from Menubar rather than a generalization of it — Menubar isn't shared
 * infrastructure the way `MenuPanelComponent` is, but reshaping its working,
 * tested top-row logic to also support columns is a real behavior change to
 * an already-shipped component for one new caller's benefit, the same
 * "isolate the blast radius" call already made for `TieredMenuPanelComponent`
 * not touching `MenuPanelComponent`.
 *
 * **Scope reduction for v1**: no `ArrowLeft`/`ArrowRight` roving focus
 * between top-level buttons (same reasoning as Menubar's own cut — plain Tab
 * order already reaches each one); only within an *open* panel does the 2D
 * column/row keyboard model (`MegaMenuPanelComponent`, unchanged from
 * Menubar's "arrow keys apply only inside an open dropdown" precedent)
 * apply.
 *
 * **Responsive collapse (added 2026-09-08)**: same
 * hamburger-toggle technique as Menubar's own fix — below `sm`, the row
 * collapses behind a toggle button; `hidden`/`flex-col` (signal-driven)
 * vs. `sm:flex sm:flex-row` (unconditional) is CSS-only, no
 * `matchMedia`/resize listener, and the exact same `<li>` markup renders in
 * both states.
 *
 * **`#item`/`#start`/`#end`**: named slots. `#item` (`TemplateRef<{ $implicit: MegaMenuItem }>`)
 * replaces what used to be an internal, unreachable `#itemContent` template shared between this
 * component's own `<a>`/`<button>` branches — now the *default* rendering, used only when the
 * consumer doesn't project `#item` themselves. `#start`/`#end` (`TemplateRef<void>`) render
 * before/after the item row, only when projected — no wrapper box when absent.
 */
@Component({
  selector: 'med-mega-menu',
  standalone: true,
  imports: [ButtonDirective, IconComponent, NgTemplateOutlet, MenuRouterLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav class="flex flex-wrap items-center gap-2" [attr.aria-label]="ariaLabel()">
      <button
        type="button"
        class="rounded-md p-2 text-surface-600 hover:bg-surface-100 sm:hidden dark:text-surface-400 dark:hover:bg-surface-800"
        [attr.aria-expanded]="mobileOpen()"
        [attr.aria-controls]="mobileMenuId"
        [attr.aria-label]="mobileOpen() ? closeMenuLabel() : openMenuLabel()"
        (click)="mobileOpen.set(!mobileOpen())"
      >
        <med-icon [name]="mobileOpen() ? 'x-mark' : 'bars-3'" variant="mini" class="size-5" />
      </button>
      @if (startTemplate(); as tpl) {
        <div><ng-container [ngTemplateOutlet]="tpl" /></div>
      }
      <ul [id]="mobileMenuId" [class]="listClass()">
        @for (item of shownItems(); track $index; let i = $index) {
          <li>
            @if (!hasColumns(item) && item.routerLink !== undefined && !item.disabled) {
              <a #triggerEl medButton variant="text" severity="secondary" size="sm" [medMenuRouterLink]="item" class="aria-[current=page]:text-brand-600 dark:aria-[current=page]:text-brand-400" [target]="item.target ?? null" (click)="onTopItemClick(triggerEl, item, i)">
                <ng-container [ngTemplateOutlet]="itemTemplate() ?? defaultItemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
              </a>
            } @else if (!hasColumns(item) && item.url && !item.disabled) {
              <a #triggerEl medButton variant="text" severity="secondary" size="sm" [href]="item.url" [target]="item.target ?? null" (click)="onTopItemClick(triggerEl, item, i)">
                <ng-container [ngTemplateOutlet]="itemTemplate() ?? defaultItemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
              </a>
            } @else {
              <button
                #triggerEl
                medButton
                type="button"
                variant="text"
                severity="secondary"
                size="sm"
                [disabled]="item.disabled"
                [attr.aria-haspopup]="hasColumns(item) ? 'menu' : null"
                [attr.aria-expanded]="hasColumns(item) ? openIndex() === i : null"
                (click)="onTopItemClick(triggerEl, item, i)"
              >
                <ng-container [ngTemplateOutlet]="itemTemplate() ?? defaultItemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
                @if (hasColumns(item)) {
                  <med-icon name="chevron-down" variant="mini" class="size-3.5" />
                }
              </button>
            }
          </li>
        }
      </ul>
      @if (endTemplate(); as tpl) {
        <div><ng-container [ngTemplateOutlet]="tpl" /></div>
      }
    </nav>
    <ng-template #defaultItemContent let-item>
      @if (item.icon) {
        <med-icon [name]="item.icon" variant="mini" class="size-4" />
      }
      {{ item.label }}
      @if (item.badge) {
        <span class="rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item.badge }}</span>
      }
    </ng-template>
  `,
})
export class MegaMenuComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextMegaMenuId++;

  readonly items = input<readonly MegaMenuItem[]>([]);
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Mega menu');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly openMenuLabel = input('Open menu');
  readonly closeMenuLabel = input('Close menu');
  readonly itemSelect = output<MenuItem>();

  /** `items()` without the `visible: false` entries; the open panel's index refers to this list. */
  protected readonly shownItems = computed(() => visibleItems(this.items()));

  protected readonly itemTemplate = contentChild('item', { read: TemplateRef });
  protected readonly startTemplate = contentChild('start', { read: TemplateRef });
  protected readonly endTemplate = contentChild('end', { read: TemplateRef });

  protected readonly mobileMenuId = `med-mega-menu-${this.instanceId}-mobile`;
  protected readonly mobileOpen = signal(false);
  protected readonly listClass = computed(() =>
    (this.mobileOpen() ? 'flex flex-col items-stretch' : 'hidden') + ' gap-1 sm:flex sm:flex-row sm:items-center',
  );

  protected readonly openIndex = signal<number | null>(null);
  private handle: OverlayHandle<MegaMenuPanelComponent, void> | null = null;

  protected hasColumns(item: MegaMenuItem): boolean {
    return !!item.columns && item.columns.length > 0;
  }

  protected onTopItemClick(origin: HTMLElement, item: MegaMenuItem, index: number): void {
    if (item.disabled) {
      return;
    }
    if (!this.hasColumns(item)) {
      this.closePanel();
      this.mobileOpen.set(false);
      item.command?.();
      this.itemSelect.emit(item);
      return;
    }
    if (this.openIndex() === index) {
      this.closePanel();
      return;
    }
    this.closePanel();
    this.openPanel(origin, item.columns!, index);
  }

  ngOnDestroy(): void {
    this.closePanel();
  }

  private openPanel(origin: HTMLElement, columns: MegaMenuItem['columns'], index: number): void {
    const handle = this.overlayService.openConnected<MegaMenuPanelComponent, void>(origin, MegaMenuPanelComponent, {
      panelClass: ['rounded-lg', 'border', 'border-surface-200', 'bg-surface-0', 'shadow-overlay-lg', 'dark:border-surface-700', 'dark:bg-surface-800'],
    });
    handle.componentRef.setInput('panelId', `med-mega-menu-${this.instanceId}-panel-${index}`);
    handle.componentRef.setInput('columns', columns);
    this.handle = handle;
    this.openIndex.set(index);

    handle.componentRef.instance.itemActivated.subscribe((item: MenuItem) => {
      this.itemSelect.emit(item);
      handle.close();
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());

    handle.closed$.subscribe(() => {
      this.handle = null;
      this.openIndex.set(null);
    });
  }

  private closePanel(): void {
    this.handle?.close();
  }
}
