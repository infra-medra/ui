export interface BreadcrumbItem {
  readonly label: string;
  readonly url?: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly target?: string;
  /** Default `true` — `false` hides the item (and its separator) entirely. */
  readonly visible?: boolean;
}

/** `home()`'s own item shape — same fields as `BreadcrumbItem` but `label` is optional, since a home item is commonly icon-only. */
export interface BreadcrumbHomeItem extends Omit<BreadcrumbItem, 'label'> {
  readonly label?: string;
}
