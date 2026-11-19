import { MenuItem } from '../menu/menu.types';

/**
 * A top-level Menubar entry. Extends `MenuItem` with one extra field:
 * `items`, its dropdown (reusing the same flat `MenuItem[]` Menu already
 * renders — **only one level deep** for v1, no nested submenus within a
 * dropdown; can be layered on later without breaking this shape).
 */
export interface MenubarItem extends MenuItem {
  readonly items?: readonly MenuItem[];
}
