# Menus and Navigation

**Capability:** `menus-and-navigation`
**ID prefix:** `NAV`
**Paths:** `projects/medra/ui/src/lib/menu/**`, `projects/medra/ui/src/lib/menubar/**`, `projects/medra/ui/src/lib/mega-menu/**`, `projects/medra/ui/src/lib/tiered-menu/**`, `projects/medra/ui/src/lib/context-menu/**`, `projects/medra/ui/src/lib/panel-menu/**`, `projects/medra/ui/src/lib/tab-menu/**`, `projects/medra/ui/src/lib/breadcrumb/**`, `projects/medra/ui/src/lib/steps/**`, `projects/medra/ui/src/lib/stepper/**`, `projects/medra/ui/src/lib/tabs/**`, `projects/medra/ui/src/lib/dock/**`, `projects/medra/ui/src/lib/paginator/**`, `projects/medra/ui/router/**`

## Purpose

Lets users move through an application with menus, tabs, breadcrumbs, step indicators, docks and paginators. All menu components share one item model (label, icon, command, url, router link, badge, disabled, visible) and consistent keyboard behavior.

## Requirements

### REQ NAV-001: Shared menu item behavior

Menu components (`med-menu`, `med-menubar`, `med-mega-menu`, `med-tiered-menu`, `med-panel-menu`, `med-tab-menu`, `med-dock`, context menu) SHALL treat an item with `visible: false` as absent, with an absent `visible` meaning visible. A hidden parent SHALL hide its children or columns, a group with no visible item SHALL disappear with its label, and keyboard navigation and typeahead SHALL skip hidden items. A disabled item SHALL NOT run its command or emit selection. Items with `url` and no children SHALL render as real links (with `target` when given), items with children SHALL never become links, disabled items with `url` SHALL render as disabled buttons, and an item `badge` SHALL be shown beside its label.

#### Scenario NAV-001.S1: Hidden item skipped

- **Given** a menu whose second item has `visible: false`
- **When** the user presses ArrowDown from the first item
- **Then** focus lands on the third item

#### Scenario NAV-001.S2: Visibility updates

- **Given** a menu whose items array is replaced by one where a hidden item is now visible
- **When** the new array is bound
- **Then** the item appears without recreating the component

#### Scenario NAV-001.S3: Disabled link

- **Given** a disabled item with a `url`
- **When** it is rendered and clicked
- **Then** it is a disabled button and navigates nowhere

### REQ NAV-002: Menu popup and inline modes

`med-menu` SHALL be closed initially in popup mode, open and close via `toggle()`, expose `isOpen`, move focus into the list on open and restore it to the trigger on close, and close on Escape, on selecting an item (which calls its `command()` and emits `itemSelect`), and when its host is destroyed. With `popup` false it SHALL render inline immediately without taking focus, and `open()`, `toggle()` and `close()` SHALL do nothing.

#### Scenario NAV-002.S1: Select closes

- **Given** an open popup menu
- **When** the user selects an item
- **Then** its command runs, `itemSelect` emits and the menu closes

#### Scenario NAV-002.S2: Inline mode

- **Given** a menu with `popup` false
- **When** it is created
- **Then** it is visible inline and does not steal page focus

### REQ NAV-003: Menu list keyboard and grouping

The menu list SHALL render separators as `role="separator"`, start with the first enabled item active, and move with ArrowDown/ArrowUp (skipping separators and disabled items, wrapping) and Home/End to the first/last enabled item. Enter SHALL activate the active item and Tab SHALL request closing. Items SHALL have `role="menuitem"`. Grouped items SHALL show a labeled header row per group (not a menuitem) while sharing one keyboard scope across groups; a flat array SHALL render no headers. `#start`, `#item` and `#end` templates SHALL be supported.

#### Scenario NAV-003.S1: Wrapping navigation

- **Given** a menu with the first enabled item active
- **When** the user presses ArrowUp
- **Then** the last enabled item becomes active

#### Scenario NAV-003.S2: Group headers

- **Given** two groups of items
- **When** the menu renders
- **Then** each group has a header row and every item has `role="menuitem"`

### REQ NAV-004: Menubar

`med-menubar` SHALL render one button per top-level item inside a `<nav>` labelled "Menu bar" by default (`ariaLabel` overrides). Clicking a leaf SHALL run its command and emit `itemSelect`; clicking an item with children SHALL toggle its dropdown, opening another closing the previous, selecting a dropdown item SHALL run it, emit and close the dropdown, and Escape SHALL close it. Items with children SHALL expose `aria-haspopup`/`aria-expanded`; leaves SHALL NOT. Disabled top-level items SHALL not open or run. The dropdown overlay SHALL close when the component is destroyed.

#### Scenario NAV-004.S1: Single open dropdown

- **Given** an open dropdown from one top-level item
- **When** the user clicks another item with children
- **Then** the first closes and the second opens

### REQ NAV-005: Menubar keyboard and responsive collapse

The menubar SHALL use a roving tabindex across top-level items (initially the first enabled one) moved by ArrowLeft/ArrowRight with wrap, skipping disabled items, and Home/End; arrow keys SHALL NOT open dropdowns. Its item list SHALL be hidden by default on small screens until a hamburger button, linked with `aria-controls`, toggles it, SHALL always be visible from the `sm` breakpoint up, and SHALL collapse after a leaf is selected. It SHALL support `#start`, `#end`, `#item` templates and a `breakpoint` input.

#### Scenario NAV-005.S1: Hamburger

- **Given** a menubar at a narrow width
- **When** the user activates the hamburger button
- **Then** the item list is revealed

### REQ NAV-006: Mega menu

`med-mega-menu` SHALL open a columns panel when a top item with columns is clicked and close it on the same click again, on Escape, on item selection (which runs the command and emits `itemSelect`), and on destroy. A top item without columns SHALL run its command directly. Each column SHALL be a `role="group"` labelled by its own header. Keyboard SHALL move ArrowUp/ArrowDown within a column with wrap, ArrowLeft/ArrowRight across columns landing near the same row, and Home/End to first/last enabled row; disabled items SHALL be skipped. It SHALL provide the same responsive collapse and `#item`, `#start`, `#end` templates as the menubar.

#### Scenario NAV-006.S1: Cross-column move

- **Given** an open panel with focus on row 2 of the first column
- **When** the user presses ArrowRight
- **Then** focus moves to the neighboring column near row 2

### REQ NAV-007: Tiered menu

`med-tiered-menu` SHALL open its root panel from a trigger and toggle on repeated trigger activation. Parent items SHALL expose `aria-haspopup`, `aria-expanded` and `aria-disabled`; ArrowRight, Enter, Space or hovering after a short delay SHALL open the submenu, ArrowLeft SHALL close only that submenu, and Escape SHALL close only the deepest level, while Tab and `close()` SHALL close the whole tree. Selecting a nested leaf SHALL run its command, emit `itemSelect` once and close everything. Space SHALL activate a leaf. Home/End SHALL jump to first/last enabled item. With `popup` false it SHALL render inline without taking focus and its imperative open/toggle/close SHALL be no-ops, while submenus still cascade as flyouts.

#### Scenario NAV-007.S1: Nested selection

- **Given** a tiered menu with a submenu open two levels deep
- **When** the user selects a leaf there
- **Then** the command runs once and all levels close

### REQ NAV-008: Tiered menu typeahead

Typing characters in a tiered menu panel SHALL move the active item to the first enabled item whose label matches the accumulated search text, never to a disabled item. The buffer SHALL clear after 500 ms of inactivity, and key combinations with Ctrl, Alt or Meta SHALL be ignored.

#### Scenario NAV-008.S1: Accumulated search

- **Given** items "Alpha", "Alps" and "Beta"
- **When** the user types "a", "l", "p", "s" in quick succession
- **Then** "Alps" becomes active

### REQ NAV-009: Context menu

`[medContextMenu]` SHALL open its panel at the pointer on right-click while suppressing the native context menu, and also on the ContextMenu key and Shift+F10 (not plain F10). It SHALL do nothing (letting the native menu through) when there are no items or `contextMenuDisabled` is true. A new right-click SHALL close the previous panel and open exactly one fresh one. Selecting an item SHALL run its command, emit `itemSelect` and close; Escape and `close()` SHALL close it, as does host destruction. Nested items SHALL work like the tiered menu, and a flat item array SHALL work unchanged.

#### Scenario NAV-009.S1: Keyboard opening

- **Given** a focused element with a context menu
- **When** the user presses Shift+F10
- **Then** the context menu opens

#### Scenario NAV-009.S2: No items

- **Given** a context menu directive with an empty item list
- **When** the user right-clicks
- **Then** the native menu appears

### REQ NAV-010: Context menu global scope and long press

With `global` set, a right-click anywhere in the document SHALL open the context menu once (no double open on the decorated element); without it, right-clicking elsewhere SHALL do nothing. Holding a touch for `pressDelay` milliseconds SHALL open the menu at the touch point, releasing earlier SHALL cancel it, and a custom `pressDelay` SHALL change the required duration.

#### Scenario NAV-010.S1: Cancelled long press

- **Given** a touch has started on the host
- **When** the touch ends before the delay elapses
- **Then** no menu opens

### REQ NAV-011: Panel menu

`med-panel-menu` SHALL render only top-level items collapsed initially. Activating a parent (click, Enter or Space) SHALL toggle its children, to arbitrary depth; a disabled parent SHALL ignore activation; a leaf SHALL run its command and emit `itemSelect`. Separators SHALL appear between children. `ariaLabel` SHALL label the menu when provided. `expandedItems` (two-way, a set of item references) SHALL reflect and control which nodes are expanded; `expandAll()` SHALL expand every node with children at every depth and `collapseAll()` SHALL collapse all. A hidden parent SHALL stay hidden even if listed in `expandedItems`, and expanded items SHALL remain expanded when a sibling is hidden.

#### Scenario NAV-011.S1: Programmatic expansion

- **Given** a collapsed panel menu
- **When** `expandedItems` is set to contain a parent item
- **Then** that parent's children are shown

### REQ NAV-012: Tab menu

`med-tab-menu` SHALL render one tab per visible item in a `role="tablist"`, each `role="tab"` with `aria-selected` on the active one. Clicking a tab SHALL activate it and run its command; disabled tabs SHALL do nothing. Only the active tab SHALL be in the Tab order, with ArrowRight/ArrowLeft moving among enabled tabs with wrap and Home/End jumping to ends. `activeIndex` (two-way) SHALL index into the original items array even when earlier items are hidden. Tabs with `url` SHALL render as `<a role="tab">` and keep keyboard behavior.

#### Scenario NAV-012.S1: Index with hidden tab

- **Given** a tab menu whose first item is hidden and `activeIndex` of 1
- **When** it renders
- **Then** the item at original index 1 is marked selected

### REQ NAV-013: Breadcrumb items

`med-breadcrumb` SHALL render one list item per visible item in order inside a navigation landmark labelled "Breadcrumb" by default (`ariaLabel` overrides). Non-last enabled items SHALL be real links (with `target`), disabled items SHALL be text with `aria-disabled`, and the last visible item SHALL always be text with `aria-current="page"`. A separator icon SHALL appear between items but never after the last visible one, including when the following item is hidden. Clicking a link SHALL emit `itemSelect` with the item and the native event. Item icons SHALL render when provided.

#### Scenario NAV-013.S1: Current page marker

- **Given** breadcrumb items where the last array entry has `visible: false`
- **When** it renders
- **Then** the last visible item carries `aria-current="page"`

### REQ NAV-014: Breadcrumb home and templates

`home` SHALL render a leading icon-only link (default icon "home", `homeAriaLabel` "Home" as accessible name; a custom icon and label allowed), followed by its own separator unless there are no items; a disabled home SHALL be non-link text; clicking it SHALL emit `itemSelect` with the home item. `itemTemplate` SHALL replace the inner content of every item including home while keeping the link and `aria-current` wrapper, and `separatorTemplate` SHALL replace the default separator.

#### Scenario NAV-014.S1: Home only

- **Given** a breadcrumb with `home` and an empty items list
- **When** it renders
- **Then** only the home link is shown and no trailing separator appears

### REQ NAV-015: Steps indicator

`med-steps` SHALL render each step as a numbered circle with a label connected by a line, using an interactive element for each enabled step and a plain span for a disabled one. Completed steps SHALL show a check icon instead of a number, and the current step SHALL have `aria-current="step"`. Clicking a step SHALL set `activeIndex` (two-way). In `readonly` mode every step SHALL be non-interactive and the list SHALL lose its toolbar role. Interactive steps SHALL use a roving tabindex (starting at the first enabled step) moved by ArrowLeft/ArrowRight with wrap and Home/End, skipping disabled steps; arrow keys SHALL move focus without changing `activeIndex`. `ariaLabel` (default "Progress") SHALL label the nav.

#### Scenario NAV-015.S1: Arrows do not activate

- **Given** a steps list with step 0 active
- **When** the user presses ArrowRight
- **Then** focus moves to step 1 and `activeIndex` stays 0

### REQ NAV-016: Stepper wizard

`med-stepper` SHALL show only the active step panel, each panel being a `role="group"` labelled with its own label. Next SHALL advance and Back SHALL return (disabled on the first step); on the last step Next SHALL read "Finish" and emit `completed` instead of advancing. Header steps SHALL jump directly to a step by default. With `linear`, header steps ahead of the current one SHALL be disabled while earlier ones remain clickable, and a panel's own `disabled` SHALL stay in force. `showNavigation` false SHALL hide the Back/Next row. Labels (`backLabel`, `nextLabel`, `completeLabel`) and `ariaLabel` SHALL be customizable. `activeIndex` SHALL be two-way.

#### Scenario NAV-016.S1: Finish

- **Given** a stepper on its last step
- **When** the user presses the final button
- **Then** `completed` is emitted and the step does not change

#### Scenario NAV-016.S2: Linear gating

- **Given** a linear stepper on step 1
- **When** it renders
- **Then** header steps after step 1 are disabled and steps before it are clickable

### REQ NAV-017: Stepper vertical orientation

With `orientation="vertical"`, `med-stepper` SHALL render its own vertical step list instead of `med-steps`, one header button per panel showing number and label together, with `aria-current="step"` on the active one, a single shared content area, and the same jump, linear and Next/Back semantics as horizontal mode.

#### Scenario NAV-017.S1: Vertical jump

- **Given** a vertical non-linear stepper
- **When** the user clicks the third step header
- **Then** the third panel is shown

### REQ NAV-018: Tabs

`med-tabs` SHALL render one tab button per `med-tab` (labelled from its header) and show only the active panel, hiding others. Tab buttons SHALL be linked to panels through `aria-controls`/`aria-labelledby` and `aria-selected`. Clicking SHALL switch the active panel; disabled tabs SHALL carry `aria-disabled` and ignore clicks. `activeIndex` SHALL be two-way. Only the active tab SHALL be in the Tab order; ArrowLeft/ArrowRight SHALL move with wrap skipping disabled tabs, and Home/End jump to ends. `ariaLabel` defaults to "Tabs".

#### Scenario NAV-018.S1: Arrow wrap

- **Given** the last tab is active
- **When** the user presses ArrowRight
- **Then** the first enabled tab becomes active

### REQ NAV-019: Lazy tab content and scroll navigators

A tab whose content is wrapped in `<ng-template>` SHALL not create its content until first activated and SHALL never recreate it after switching away; a tab that starts active SHALL create it immediately; tabs without a template SHALL project eagerly. With `showNavigators`, previous/next scroll buttons (labels customizable, defaults "Scroll tabs left"/"Scroll tabs right") SHALL appear only for the direction where the tab strip can scroll, none when nothing overflows, and none by default.

#### Scenario NAV-019.S1: Lazy first activation

- **Given** a tab with lazy content that has never been active
- **When** it becomes active
- **Then** its content is created once and stays created afterward

#### Scenario NAV-019.S2: Navigators at start

- **Given** `showNavigators` and overflowing tabs scrolled to the start
- **When** it renders
- **Then** only the scroll-right button is shown

### REQ NAV-020: Dock

`med-dock` SHALL render one button per item labelled from `item.label` within a `role="toolbar"`, at a `position` of bottom (default) or top. Hovering or keyboard-focusing an item SHALL magnify it with a smaller falloff on its neighbors; leaving or blurring SHALL reset all to normal scale. Clicking SHALL run the command; disabled items SHALL be disabled buttons that never run. It SHALL use a roving tabindex starting at the first item moved by ArrowLeft/ArrowRight with wrap (skipping disabled) and Home/End. An `#item` template SHALL replace the default icon.

#### Scenario NAV-020.S1: Focus magnification

- **Given** a dock with no hover
- **When** an item receives keyboard focus
- **Then** it scales up as it would on hover and resets when it loses focus

### REQ NAV-021: Paginator pages and summary

`med-paginator` SHALL render page buttons for `totalRecords` split by `rows`, showing a window of at most `pageLinkCount` links around the current page and clamped at the last page. The current page SHALL have `aria-current="page"`; Previous SHALL be disabled on the first page and Next on the last. Clicking a page, Previous or Next SHALL update `first` (two-way) and emit `pageChange`. A "Showing X-Y of Z" summary SHALL show by default with its upper bound capped at the total, hidden with `showSummary` false and customizable through `summaryLabelTemplate` or `currentPageReportTemplate`. Zero records SHALL be one empty page. With `alwaysShow` false it SHALL hide when there is a single page. All labels SHALL be customizable.

#### Scenario NAV-021.S1: Partial last page

- **Given** 25 records with 10 rows per page on page 3
- **When** it renders
- **Then** the summary reads showing 21 to 25 of 25

#### Scenario NAV-021.S2: Single page hidden

- **Given** `alwaysShow` false and one page
- **When** it renders
- **Then** the paginator is not shown

### REQ NAV-022: Paginator controls and keyboard

The paginator SHALL be a `role="toolbar"` with a roving tabindex (defaulting to the current page) moved by ArrowLeft/ArrowRight across enabled controls with wrap and Home/End. With `rowsPerPageOptions` it SHALL show a page-size select whose change updates `rows`, resets `first` to 0 and emits `pageChange`. With `showFirstLastIcon` it SHALL add First and Last buttons that join the toolbar so Home/End land on them. With `showJumpToPageInput` it SHALL show a 1-based page input that navigates on commit, clamping out-of-range values.

#### Scenario NAV-022.S1: Page size change

- **Given** a paginator on page 3 with page-size options
- **When** the user chooses a new page size
- **Then** `rows` updates, `first` resets to 0 and `pageChange` is emitted

#### Scenario NAV-022.S2: Jump clamp

- **Given** a jump-to-page input and 5 pages
- **When** the user commits 99
- **Then** the last page is shown

### REQ NAV-023: Router link integration for menu items

Menu items with `routerLink` SHALL work only when the router integration (`provideMedraMenuRouterLinks()` from the router entry point) is registered; without it an item with `routerLink` SHALL raise a clear error, while items without `routerLink` render normally. With it, the item SHALL render as a real link whose `href` is the app-root route, and a plain click SHALL navigate via the Router while cancelling native navigation. Ctrl, Cmd, Shift, Alt and middle clicks and `target="_blank"` items SHALL be left to the browser. `command` SHALL still run when navigating, `routerLink` SHALL win over `url`, and a disabled item SHALL have no `href` and not navigate. Enter on an active routerLink item in menu, tiered menu and mega menu SHALL navigate.

#### Scenario NAV-023.S1: Plain click

- **Given** a menu item with a `routerLink` and the integration registered
- **When** the user clicks it without modifier keys
- **Then** the Router navigates and the browser's own navigation is cancelled

#### Scenario NAV-023.S2: Missing integration

- **Given** no integration registered
- **When** a menu renders an item with `routerLink`
- **Then** an error is thrown explaining the integration is required

### REQ NAV-024: Active route marking

With the router integration, an item whose route is active SHALL be marked with `aria-current="page"` and an active style; a prefix match SHALL mark it by default, `routerLinkActiveOptions` with `exact: true` SHALL require an exact match, the mark SHALL follow navigation, and a sibling whose route merely shares a text prefix (such as `/contas` vs `/contas-extras`) SHALL NOT be marked.

#### Scenario NAV-024.S1: Following navigation

- **Given** the current route matches item A
- **When** the app navigates to item B's route
- **Then** B has `aria-current="page"` and A loses it
