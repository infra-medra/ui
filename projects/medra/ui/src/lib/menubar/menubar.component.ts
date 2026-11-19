import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, TemplateRef, computed, contentChild, inject, input, output, signal, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { MenuPanelComponent, openMenuPanel } from '../menu/menu-panel.component';
import { MenuRouterLinkDirective } from '../menu/menu-router-link.directive';
import { visibleItems } from '../menu/menu-visibility';
import { MenuItem } from '../menu/menu.types';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { MenubarItem } from './menubar.types';

let nextMenubarId = 0;

/**
 * Menubar primitive (Tier 1): a horizontal row of top-level commands, some
 * of which open a one-level-deep dropdown (reusing `MenuPanelComponent` —
 * see `openMenuPanel()` in menu-panel.component.ts, shared with Menu).
 *
 * **`ArrowLeft`/`ArrowRight` roving tabindex (added 2026-09-08** between top-level items, the ARIA APG "Menubar" pattern's usual
 * keyboard model — same index-based roving-tabindex shape Paginator's own
 * toolbar already established (`tabIndexFor`/`onKeydown`, disabled items
 * skipped, wraps at both ends), just applied to a flat row instead of
 * Paginator's `[Prev, ...pages, Next]` slots. `Home`/`End` jump to the
 * first/last enabled item. Arrow keys only move focus between top-level
 * items — they don't also open a dropdown (that's still Enter/Space/click,
 * unchanged); once a dropdown *is* open, arrow-key navigation inside it is
 * still `MenuPanelComponent`'s own, untouched.
 *
 * **Responsive collapse (same date/item)**: below the `sm` breakpoint, the
 * row collapses behind a hamburger toggle button — CSS-only breakpoint
 * switching (`hidden`/`flex` driven by a signal below `sm`, `sm:flex`
 * unconditionally above it), not a JS `matchMedia`/resize listener, since
 * Tailwind's own responsive variants already express "always visible from
 * `sm` up, regardless of the toggle state" without one. The exact same
 * `<li>` markup renders in both states (mobile stacks it `flex-col`,
 * desktop keeps `flex-row`) — no separate mobile template to keep in sync.
 *
 * Also only one submenu level deep — see `MenubarItem`; can be layered on
 * later without an API change.
 */
@Component({
  selector: 'med-menubar',
  standalone: true,
  imports: [ButtonDirective, IconComponent, NgTemplateOutlet, MenuRouterLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav [attr.aria-label]="ariaLabel()" [attr.data-breakpoint]="breakpoint()" class="flex flex-wrap items-center gap-2">
      @if (startTemplate(); as t) {
        <div class="shrink-0">
          <ng-container [ngTemplateOutlet]="t" />
        </div>
      }
      <button
        type="button"
        [class]="hamburgerClass()"
        [attr.aria-expanded]="mobileOpen()"
        [attr.aria-controls]="mobileMenuId"
        [attr.aria-label]="mobileOpen() ? closeMenuLabel() : openMenuLabel()"
        (click)="mobileOpen.set(!mobileOpen())"
      >
        <med-icon [name]="mobileOpen() ? 'x-mark' : 'bars-3'" variant="mini" class="size-5" />
      </button>
      <ul [id]="mobileMenuId" [class]="listClass()">
        @for (item of shownItems(); track $index; let i = $index) {
          <li>
            @if (!hasChildren(item) && item.routerLink !== undefined && !item.disabled) {
              <a
                #triggerEl
                medButton
                variant="text"
                severity="secondary"
                size="sm"
                [medMenuRouterLink]="item"
                class="aria-[current=page]:text-brand-600 dark:aria-[current=page]:text-brand-400"
                [target]="item.target ?? null"
                [tabIndex]="tabIndexFor(i)"
                (click)="onTopItemClick(triggerEl, item, i)"
                (focus)="onFocus(i)"
                (keydown)="onKeydown($event, i)"
              >
                <ng-container [ngTemplateOutlet]="itemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
              </a>
            } @else if (!hasChildren(item) && item.url && !item.disabled) {
              <a
                #triggerEl
                medButton
                variant="text"
                severity="secondary"
                size="sm"
                [href]="item.url"
                [target]="item.target ?? null"
                [tabIndex]="tabIndexFor(i)"
                (click)="onTopItemClick(triggerEl, item, i)"
                (focus)="onFocus(i)"
                (keydown)="onKeydown($event, i)"
              >
                <ng-container [ngTemplateOutlet]="itemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
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
                [attr.aria-haspopup]="hasChildren(item) ? 'menu' : null"
                [attr.aria-expanded]="hasChildren(item) ? openIndex() === i : null"
                [tabIndex]="tabIndexFor(i)"
                (click)="onTopItemClick(triggerEl, item, i)"
                (focus)="onFocus(i)"
                (keydown)="onKeydown($event, i)"
              >
                <ng-container [ngTemplateOutlet]="itemContent" [ngTemplateOutletContext]="{ $implicit: item }" />
                @if (hasChildren(item)) {
                  <med-icon name="chevron-down" variant="mini" class="size-3.5" />
                }
              </button>
            }
          </li>
        }
      </ul>
      @if (endTemplate(); as t) {
        <div class="ml-auto shrink-0">
          <ng-container [ngTemplateOutlet]="t" />
        </div>
      }
    </nav>
    <ng-template #itemContent let-item>
      @if (itemTemplate(); as t) {
        <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: item }" />
      } @else {
        @if (item.icon) {
          <med-icon [name]="item.icon" variant="mini" class="size-4" />
        }
        {{ item.label }}
        @if (item.badge) {
          <span class="rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item.badge }}</span>
        }
      }
    </ng-template>
  `,
})
export class MenubarComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextMenubarId++;

  readonly items = input<readonly MenubarItem[]>([]);
  readonly breakpoint = input<string>('sm');
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Menu bar');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly openMenuLabel = input('Open menu');
  readonly closeMenuLabel = input('Close menu');
  readonly itemSelect = output<MenuItem>();

  /** `items()` without the `visible: false` entries. Every index below (roving tabindex, open dropdown, trigger elements) is an index into this list, so a hidden item is never reachable by keyboard. */
  protected readonly shownItems = computed(() => visibleItems(this.items()));

  protected readonly startTemplate = contentChild('start', { read: TemplateRef });
  protected readonly endTemplate = contentChild('end', { read: TemplateRef });
  protected readonly itemTemplate = contentChild('item', { read: TemplateRef });

  protected readonly mobileMenuId = `med-menubar-${this.instanceId}-mobile`;
  protected readonly mobileOpen = signal(false);

  private static readonly BREAKPOINT_CLASSES: Record<string, { hidden: string; flex: string }> = {
    sm: { hidden: 'sm:hidden', flex: 'sm:flex sm:flex-row sm:items-center' },
    md: { hidden: 'md:hidden', flex: 'md:flex md:flex-row md:items-center' },
    lg: { hidden: 'lg:hidden', flex: 'lg:flex lg:flex-row lg:items-center' },
    xl: { hidden: 'xl:hidden', flex: 'xl:flex xl:flex-row xl:items-center' },
    '2xl': { hidden: '2xl:hidden', flex: '2xl:flex 2xl:flex-row 2xl:items-center' },
  };

  protected readonly hamburgerClass = computed(() => {
    const bp = MenubarComponent.BREAKPOINT_CLASSES[this.breakpoint()] ?? MenubarComponent.BREAKPOINT_CLASSES['sm'];
    return `rounded-md p-2 text-surface-600 hover:bg-surface-100 ${bp.hidden} dark:text-surface-400 dark:hover:bg-surface-800`;
  });

  protected readonly listClass = computed(() => {
    const bp = MenubarComponent.BREAKPOINT_CLASSES[this.breakpoint()] ?? MenubarComponent.BREAKPOINT_CLASSES['sm'];
    return (this.mobileOpen() ? 'flex flex-col items-stretch' : 'hidden') + ` gap-1 ${bp.flex}`;
  });

  protected readonly openIndex = signal<number | null>(null);
  private handle: OverlayHandle<MenuPanelComponent, void> | null = null;

  /** ARIA APG "Menubar" roving tabindex between top-level items — same shape as Paginator's own toolbar (`tabIndexFor`/`onKeydown`), just over a flat row instead of `[Prev, ...pages, Next]` slots. */
  private readonly rovingIndex = signal(0);
  private readonly triggerEls = viewChildren<ElementRef<HTMLElement>>('triggerEl');

  protected hasChildren(item: MenubarItem): boolean {
    return !!item.items && item.items.length > 0;
  }

  private enabledIndexes(): number[] {
    return this.shownItems()
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i !== -1);
  }

  /** Falls back to the first enabled item if the last-focused one became disabled/out of range, same fallback shape `PaginatorComponent.effectiveRovingIndex` already uses. */
  private effectiveRovingIndex(): number {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return 0;
    }
    return enabled.includes(this.rovingIndex()) ? this.rovingIndex() : enabled[0];
  }

  protected tabIndexFor(index: number): number {
    return this.effectiveRovingIndex() === index ? 0 : -1;
  }

  protected onFocus(index: number): void {
    this.rovingIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    const position = enabled.indexOf(index);
    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = enabled[0];
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabled[enabled.length - 1];
        break;
    }
    if (targetIndex !== null) {
      this.rovingIndex.set(targetIndex);
      this.triggerEls()[targetIndex]?.nativeElement.focus();
    }
  }

  protected onTopItemClick(origin: HTMLElement, item: MenubarItem, index: number): void {
    if (item.disabled) {
      return;
    }
    if (!this.hasChildren(item)) {
      this.closeSubmenu();
      this.mobileOpen.set(false);
      item.command?.();
      this.itemSelect.emit(item);
      return;
    }
    if (this.openIndex() === index) {
      this.closeSubmenu();
      return;
    }
    this.closeSubmenu();
    this.openSubmenu(origin, item.items!, index);
  }

  ngOnDestroy(): void {
    this.closeSubmenu();
  }

  private openSubmenu(origin: HTMLElement, items: readonly MenuItem[], index: number): void {
    const handle = openMenuPanel(this.overlayService, origin, items, `med-menubar-${this.instanceId}-panel-${index}`);
    this.handle = handle;
    this.openIndex.set(index);

    handle.componentRef.instance.itemActivated.subscribe((menuItem: MenuItem) => {
      this.itemSelect.emit(menuItem);
      handle.close();
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());

    handle.closed$.subscribe(() => {
      this.handle = null;
      this.openIndex.set(null);
    });
  }

  private closeSubmenu(): void {
    this.handle?.close();
  }
}
