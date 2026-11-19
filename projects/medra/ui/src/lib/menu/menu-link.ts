import { InjectionToken } from '@angular/core';

/** A `routerLink` value: a URL path or Angular router commands (the same shapes `RouterLink` accepts). */
export type MenuItemRouterLink = string | readonly unknown[];

export interface MenuItemRouterLinkActiveOptions {
  /** `true`: active only on an exact URL match. `false` (default): active on a prefix match. */
  readonly exact: boolean;
}

/**
 * Bridge between the menu components and the app's Router. `@medra/ui` has
 * no dependency on `@angular/router`; the implementation lives in the
 * optional `@medra/ui/router` entry point (`provideMedraMenuRouterLinks()`).
 */
export interface MenuLinkStrategy {
  /** Final `href` for the link, including the app's base href. */
  href(link: MenuItemRouterLink): string;
  /** Navigates without a page reload. */
  navigate(link: MenuItemRouterLink): void;
  /** Whether the link's route is active. Reads a signal, so a caller inside a template or `computed` re-evaluates on navigation. */
  isActive(link: MenuItemRouterLink, exact: boolean): boolean;
}

/** Provided by `provideMedraMenuRouterLinks()` from `@medra/ui/router`. Menu items with `routerLink` need it. */
export const MED_MENU_LINK_STRATEGY = new InjectionToken<MenuLinkStrategy>('MED_MENU_LINK_STRATEGY');

/** Thrown when an item has `routerLink` but no `MED_MENU_LINK_STRATEGY` is provided. */
export const MENU_ROUTER_LINK_MISSING_MESSAGE =
  "MenuItem.routerLink needs the Router integration: add provideMedraMenuRouterLinks() from '@medra/ui/router' to the app providers (after provideRouter).";
