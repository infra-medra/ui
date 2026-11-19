import { MenuItem, MenuItemGroup } from './menu.types';

/** An item together with its index in the array the consumer passed in. */
export interface VisibleEntry<T> {
  readonly item: T;
  readonly index: number;
}

/** `true` unless the consumer set `visible: false` explicitly — an absent field counts as visible. */
export function isItemVisible(item: Pick<MenuItem, 'visible'>): boolean {
  return item.visible !== false;
}

/**
 * Drops every item with `visible: false`. Returns the *same* item objects
 * (never copies), so anything that keys on item identity — `PanelMenu`'s
 * `expandedItems` set, a consumer's own `===` checks — keeps working.
 * Components call this at every level they read items from, which is what
 * hides the children of a hidden parent: the parent is never rendered.
 */
export function visibleItems<T extends Pick<MenuItem, 'visible'>>(items: readonly T[]): readonly T[] {
  return items.filter(isItemVisible);
}

/** Like `visibleItems()`, but each result carries the item's index in the original array (for `TabMenu`'s `activeIndex`, which must not renumber when a tab is hidden). */
export function visibleEntries<T extends Pick<MenuItem, 'visible'>>(items: readonly T[]): readonly VisibleEntry<T>[] {
  const entries: VisibleEntry<T>[] = [];
  items.forEach((item, index) => {
    if (isItemVisible(item)) {
      entries.push({ item, index });
    }
  });
  return entries;
}

/**
 * Filters each group's items, and drops every group left with no visible
 * item — including its label. A group that never had items is dropped too.
 */
export function visibleGroups(groups: readonly MenuItemGroup[]): readonly MenuItemGroup[] {
  const result: MenuItemGroup[] = [];
  for (const group of groups) {
    const items = visibleItems(group.items);
    if (items.length > 0) {
      result.push(items === group.items ? group : { label: group.label, items });
    }
  }
  return result;
}
