import { MenuItem } from '../menu/menu.types';

/** One column inside a top-level MegaMenu item's panel — a flat `items` list, no further nesting (a mega menu column is a simple list in every real-world reference; deeper nesting is TieredMenu's job, not this component's). */
export interface MegaMenuColumn {
  readonly header?: string;
  readonly items: readonly MenuItem[];
}

/** A top-level MegaMenu entry. Extends `MenuItem` with `columns` — its panel, laid out side-by-side instead of Menubar's single flat `MenuItem[]` dropdown. */
export interface MegaMenuItem extends MenuItem {
  readonly columns?: readonly MegaMenuColumn[];
}
