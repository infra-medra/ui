import { MenuItemRouterLink, MenuItemRouterLinkActiveOptions } from './menu-link';

/** A labeled group of items for `MenuComponent`'s optional grouping — a separate type rather than adding `items` to `MenuItem` itself, same "distinguish via a new interface extending/alongside the base, don't widen the shared one" precedent `TieredMenuItem` already established for cascading submenus. `MenuComponent.items` accepts either a flat `readonly MenuItem[]` (unchanged) or a `readonly MenuItemGroup[]` — never a mix of both at the top level. */
export interface MenuItemGroup {
  readonly label: string;
  readonly items: readonly MenuItem[];
}

export interface MenuItem {
  readonly label?: string;
  readonly icon?: string;
  /** Blocks activation. A UI hint, **not authorization** — see `visible`. */
  readonly disabled?: boolean;
  /**
   * `false` omits the item — and its children — from the screen and from
   * keyboard navigation in every menu component. Absent counts as `true`.
   * This is a **UI hint, not authorization**: the data is still in the
   * client, so enforce access to the data and the route on the server and
   * with route guards, never by hiding a menu entry.
   */
  readonly visible?: boolean;
  /** Renders a non-interactive divider line instead of a real item — every other field is ignored when true. */
  readonly separator?: boolean;
  readonly command?: () => void;
  /**
   * A plain `href` — when set, the item's label renders inside a real
   * `<a [href]>` (native Ctrl/Cmd+click, middle-click-to-new-tab, right-click
   * "copy link", and status-bar URL preview all come free from the browser)
   * instead of only a `<button>`/`<li>` driven by `command()`. For an
   * in-app route use `routerLink` instead, which wins over `url` when both
   * are set. The click still calls `command()` too.
   */
  readonly url?: string;
  /**
   * An in-app route, as a path (`'/reports'`) or router commands
   * (`['/reports', id]`), always resolved from the app root. The item
   * renders as a real `<a href>` that navigates through the Router on a
   * plain click and is left to the browser for Ctrl/Cmd/Shift/Alt/middle
   * clicks. Wins over `url`; `command` still runs. Needs
   * `provideMedraMenuRouterLinks()` from `@medra.dev/ui/router` — without it
   * rendering the item throws. A UI hint, **not authorization**: protect
   * the route with a guard, since hiding or disabling the item does not
   * stop anyone from opening the URL.
   */
  readonly routerLink?: MenuItemRouterLink;
  /** Only meaningful together with `routerLink`: `{ exact: true }` marks the item active only on an exact URL match instead of a prefix match. */
  readonly routerLinkActiveOptions?: MenuItemRouterLinkActiveOptions;
  /** Only meaningful together with `url` — passed straight to the rendered `<a target>`. */
  readonly target?: string;
  /** Small trailing label (a count, "New", etc.) rendered next to the item's own label. */
  readonly badge?: string;
}
