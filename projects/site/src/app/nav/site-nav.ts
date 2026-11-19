/**
 * Single navigation model for the docs site. It feeds the header, the sidebar,
 * the search index generator and the prerender list. Pure TypeScript: no Angular
 * imports, so Jest can test it directly.
 */

export interface NavItem {
  slug: string;
  label: string;
  /** Absolute URL. Defaults to `<section base path>/<slug>`. */
  url?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export type SectionId = 'getting-started' | 'foundations' | 'components' | 'guides' | 'reference';

export interface NavSection {
  id: SectionId | string;
  label: string;
  groups: NavGroup[];
  /** Base path used for item URLs and for matching the active section. */
  basePath?: string;
}

/** Component groups, grouped by kind of component. */
export const COMPONENT_GROUPS: NavGroup[] = [
  {
    label: 'Buttons / actions',
    items: [
      { slug: 'button', label: 'Button' },
      { slug: 'split-button', label: 'SplitButton' },
      { slug: 'speed-dial', label: 'SpeedDial' },
    ],
  },
  {
    label: 'Form / input',
    items: [
      { slug: 'autocomplete', label: 'AutoComplete' },
      { slug: 'cascade-select', label: 'CascadeSelect' },
      { slug: 'checkbox', label: 'Checkbox' },
      { slug: 'color-picker', label: 'ColorPicker' },
      { slug: 'date-picker', label: 'DatePicker' },
      { slug: 'editor', label: 'Editor' },
      { slug: 'float-label', label: 'FloatLabel' },
      { slug: 'icon-field', label: 'IconField' },
      { slug: 'ifta-label', label: 'IftaLabel' },
      { slug: 'file-upload', label: 'FileUpload' },
      { slug: 'input-chips', label: 'InputChips' },
      { slug: 'input-group', label: 'InputGroup' },
      { slug: 'input-number', label: 'InputNumber' },
      { slug: 'input-otp', label: 'InputOtp' },
      { slug: 'input-text', label: 'InputText' },
      { slug: 'knob', label: 'Knob' },
      { slug: 'listbox', label: 'Listbox' },
      { slug: 'multi-select', label: 'MultiSelect' },
      { slug: 'password', label: 'Password' },
      { slug: 'radio-button', label: 'RadioButton' },
      { slug: 'rating', label: 'Rating' },
      { slug: 'select', label: 'Select' },
      { slug: 'select-button', label: 'SelectButton' },
      { slug: 'slider', label: 'Slider' },
      { slug: 'textarea', label: 'Textarea' },
      { slug: 'toggle-button', label: 'ToggleButton' },
      { slug: 'toggle-switch', label: 'ToggleSwitch' },
    ],
  },
  {
    label: 'Overlay / popup',
    items: [
      { slug: 'dialog', label: 'Dialog' },
      { slug: 'confirm-dialog', label: 'ConfirmDialog' },
      { slug: 'confirm-popup', label: 'ConfirmPopup' },
      { slug: 'drawer', label: 'Drawer' },
      { slug: 'popover', label: 'Popover' },
      { slug: 'tooltip', label: 'Tooltip' },
    ],
  },
  {
    label: 'Messages / feedback',
    items: [
      { slug: 'message-toast', label: 'Message / Toast' },
      { slug: 'inline-message', label: 'InlineMessage' },
      { slug: 'progress-bar', label: 'ProgressBar' },
      { slug: 'progress-spinner', label: 'ProgressSpinner' },
    ],
  },
  {
    label: 'Panel / layout',
    items: [
      { slug: 'accordion', label: 'Accordion' },
      { slug: 'block-ui', label: 'BlockUI' },
      { slug: 'divider', label: 'Divider' },
      { slug: 'fieldset', label: 'Fieldset' },
      { slug: 'inplace', label: 'Inplace' },
      { slug: 'panel', label: 'Panel' },
      { slug: 'scroll-panel', label: 'ScrollPanel' },
      { slug: 'splitter', label: 'Splitter' },
      { slug: 'toolbar', label: 'Toolbar' },
    ],
  },
  {
    label: 'Navigation',
    items: [
      { slug: 'breadcrumb', label: 'Breadcrumb' },
      { slug: 'paginator', label: 'Paginator' },
      { slug: 'tabs', label: 'Tabs' },
      { slug: 'tab-menu', label: 'TabMenu' },
      { slug: 'steps', label: 'Steps' },
      { slug: 'stepper', label: 'Stepper' },
      { slug: 'menu', label: 'Menu' },
      { slug: 'menubar', label: 'Menubar' },
      { slug: 'tiered-menu', label: 'TieredMenu' },
      { slug: 'mega-menu', label: 'MegaMenu' },
      { slug: 'panel-menu', label: 'PanelMenu' },
      { slug: 'context-menu', label: 'ContextMenu' },
      { slug: 'dock', label: 'Dock' },
    ],
  },
  {
    label: 'Data display',
    items: [
      { slug: 'avatar', label: 'Avatar' },
      { slug: 'avatar-group', label: 'AvatarGroup' },
      { slug: 'badge', label: 'Badge' },
      { slug: 'overlay-badge', label: 'OverlayBadge' },
      { slug: 'card', label: 'Card' },
      { slug: 'carousel', label: 'Carousel' },
      { slug: 'chip', label: 'Chip' },
      { slug: 'data-table', label: 'DataTable' },
      { slug: 'data-view', label: 'DataView' },
      { slug: 'galleria', label: 'Galleria' },
      { slug: 'image', label: 'Image' },
      { slug: 'image-compare', label: 'ImageCompare' },
      { slug: 'order-list', label: 'OrderList' },
      { slug: 'organization-chart', label: 'OrganizationChart' },
      { slug: 'pick-list', label: 'PickList' },
      { slug: 'skeleton', label: 'Skeleton' },
      { slug: 'tag', label: 'Tag' },
      { slug: 'timeline', label: 'Timeline' },
      { slug: 'tree', label: 'Tree' },
      { slug: 'tree-table', label: 'TreeTable' },
      { slug: 'tree-select', label: 'TreeSelect' },
      { slug: 'virtual-scroller', label: 'VirtualScroller' },
      { slug: 'meter-group', label: 'MeterGroup' },
    ],
  },
];

export const GETTING_STARTED_GROUPS: NavGroup[] = [
  {
    label: 'Getting started',
    items: [
      { slug: 'introduction', label: 'Introduction', url: '/docs' },
      { slug: 'installation', label: 'Installation' },
      { slug: 'quick-start', label: 'Quick start' },
      { slug: 'icons', label: 'Icons' },
    ],
  },
];

export const FOUNDATIONS_GROUPS: NavGroup[] = [
  {
    label: 'Foundations',
    items: [
      { slug: 'brand-identity', label: 'Brand identity' },
      { slug: 'design-tokens', label: 'Design tokens' },
      { slug: 'theming', label: 'Theming' },
      { slug: 'accessibility', label: 'Accessibility' },
      { slug: 'i18n', label: 'Internationalization' },
      { slug: 'overlays', label: 'Overlays' },
      { slug: 'forms', label: 'Forms' },
    ],
  },
];

export const SECTIONS: NavSection[] = [
  { id: 'getting-started', label: 'Getting started', basePath: '/docs/getting-started', groups: GETTING_STARTED_GROUPS },
  { id: 'foundations', label: 'Foundations', basePath: '/docs/foundations', groups: FOUNDATIONS_GROUPS },
  { id: 'components', label: 'Components', basePath: '/docs/components', groups: COMPONENT_GROUPS },
  { id: 'guides', label: 'Guides', basePath: '/docs/guides', groups: [] },
  { id: 'reference', label: 'Reference', basePath: '/docs/reference', groups: [] },
];

/** Sections with at least one published page; empty sections stay out of the header. */
export function visibleSections(sections: NavSection[] = SECTIONS): NavSection[] {
  return sections.filter((s) => s.groups.some((g) => g.items.length > 0));
}

/**
 * Keeps the items whose label contains `query` (case-insensitive, plain text — never a
 * regular expression) and drops groups left empty. A blank query returns every group.
 */
export function filterGroups(groups: NavGroup[], query: string): NavGroup[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return groups;
  return groups
    .map((g) => ({ label: g.label, items: g.items.filter((i) => i.label.toLowerCase().includes(needle)) }))
    .filter((g) => g.items.length > 0);
}

/** Section that owns `url` (query and fragment ignored), or `null` outside the docs sections. */
export function sectionForUrl(url: string): SectionId | null {
  const path = url.split(/[?#]/, 1)[0].replace(/\/+$/, '');
  if (path === '/docs') return 'getting-started';
  for (const section of SECTIONS) {
    const base = section.basePath;
    if (base && (path === base || path.startsWith(base + '/'))) return section.id as SectionId;
  }
  return null;
}

/** Absolute URL of an item inside a section. */
export function itemUrl(section: NavSection, item: NavItem): string {
  return item.url ?? `${section.basePath ?? '/docs'}/${item.slug}`;
}

const FOUNDATIONS_SLUGS: ReadonlySet<string> = new Set(FOUNDATIONS_GROUPS.flatMap((g) => g.items.map((i) => i.slug)));

/** Allowlist for the dynamic Foundations page (M-08): rejects `__proto__`, `constructor` and unknown slugs. */
export function isFoundationsSlug(slug: string): boolean {
  return FOUNDATIONS_SLUGS.has(slug);
}
