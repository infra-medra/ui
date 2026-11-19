import { MenuItem } from '../menu/menu.types';

/** Same shape as `MenuItem`, but `items` can nest arbitrarily deep — unlike `MenubarItem`, which is deliberately capped at one dropdown level. */
export interface TieredMenuItem extends MenuItem {
  readonly items?: readonly TieredMenuItem[];
}
