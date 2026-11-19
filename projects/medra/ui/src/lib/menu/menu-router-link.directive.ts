import { Directive, ElementRef, Renderer2, computed, effect, inject, input } from '@angular/core';
import { MED_MENU_LINK_STRATEGY, MENU_ROUTER_LINK_MISSING_MESSAGE } from './menu-link';
import { MenuItem } from './menu.types';

/** Active-item theme tokens — the same ones `TabMenu`'s own active tab uses. */
const ACTIVE_CLASSES = ['text-brand-600', 'dark:text-brand-400'];

/**
 * Internal (not exported from the public API): turns an `<a>` of a menu item
 * that has `routerLink` into a real router link without importing
 * `@angular/router` — the Router is reached through `MED_MENU_LINK_STRATEGY`,
 * which `@medra/ui/router` provides.
 *
 * - `href` comes from the strategy (the Router's own serialization, never the
 *   raw string), so hostile values cannot become `javascript:` or
 *   cross-origin URLs.
 * - A plain left click is cancelled and goes through `strategy.navigate()`.
 *   Ctrl/Cmd/Shift/Alt clicks, non-left buttons and an explicit `target` are
 *   left to the browser (new tab, new window, "copy link" all keep working).
 * - A `disabled` item gets no `href` at all, so no native gesture can follow
 *   it, plus `aria-disabled`.
 * - While the item's route is active (`strategy.isActive`, prefix match unless
 *   `routerLinkActiveOptions.exact`) it carries `aria-current="page"` and the
 *   active-state theme tokens.
 * - Rendering without the strategy throws the configuration error from the
 *   contract, next to the item that caused it.
 */
@Directive({
  selector: 'a[medMenuRouterLink]',
  standalone: true,
  host: {
    '[attr.href]': 'href()',
    '[attr.aria-disabled]': "item().disabled ? 'true' : null",
    '[attr.aria-current]': "active() ? 'page' : null",
    '(click)': 'onClick($event)',
  },
})
export class MenuRouterLinkDirective {
  private readonly strategy = inject(MED_MENU_LINK_STRATEGY, { optional: true });

  readonly item = input.required<MenuItem>({ alias: 'medMenuRouterLink' });

  protected readonly href = computed(() => {
    const item = this.item();
    return item.disabled || item.routerLink === undefined ? null : this.requireStrategy().href(item.routerLink);
  });

  protected readonly active = computed(() => {
    const item = this.item();
    if (item.disabled || item.routerLink === undefined) {
      return false;
    }
    return this.requireStrategy().isActive(item.routerLink, item.routerLinkActiveOptions?.exact ?? false);
  });

  constructor() {
    this.requireStrategy();
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    // Toggled through the Renderer (not a `[class]` host binding) so it merges with whatever `[class]` the host component binds on the same `<a>`.
    effect(() => {
      for (const token of ACTIVE_CLASSES) {
        if (this.active()) {
          renderer.addClass(element, token);
        } else {
          renderer.removeClass(element, token);
        }
      }
    });
  }

  protected onClick(event: MouseEvent): void {
    const item = this.item();
    if (item.disabled || item.routerLink === undefined) {
      event.preventDefault();
      return;
    }
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    if (item.target && item.target !== '_self') {
      return;
    }
    event.preventDefault();
    this.requireStrategy().navigate(item.routerLink);
  }

  private requireStrategy() {
    if (!this.strategy) {
      throw new Error(MENU_ROUTER_LINK_MISSING_MESSAGE);
    }
    return this.strategy;
  }
}
