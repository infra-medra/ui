# Content Containers

**Capability:** `content-containers`
**ID prefix:** `CNT`
**Paths:** `projects/medra/ui/src/lib/card/**`, `projects/medra/ui/src/lib/panel/**`, `projects/medra/ui/src/lib/fieldset/**`, `projects/medra/ui/src/lib/accordion/**`, `projects/medra/ui/src/lib/divider/**`, `projects/medra/ui/src/lib/splitter/**`, `projects/medra/ui/src/lib/inplace/**`, `projects/medra/ui/src/lib/carousel/**`, `projects/medra/ui/src/lib/galleria/**`, `projects/medra/ui/src/lib/image/**`, `projects/medra/ui/src/lib/image-compare/**`

## Purpose

Groups the components that organize, reveal and present content: cards, panels, fieldsets, accordions, dividers, splitters, inplace editors, carousels, galleries, images and image comparison. Each one projects consumer content and manages its own expand, size, position or preview state.

## Requirements

### REQ CNT-001: Card content slots

`med-card` SHALL render its optional `title` and `subtitle` inputs as headings, SHALL project default content into a padded body, and SHALL project `medCardHeader`, `medCardFooter`, `medCardTitle` and `medCardSubtitle` content into their own slots. It SHALL NOT render title, subtitle or a footer divider when none is provided.

#### Scenario CNT-001.S1: Title and subtitle inputs

- **Given** a card with `title="Hello"` and `subtitle="World"`
- **When** it renders
- **Then** both texts are shown as headings

#### Scenario CNT-001.S2: Omitted headings

- **Given** a card without `title` and `subtitle`
- **When** it renders
- **Then** no heading element is rendered

#### Scenario CNT-001.S3: Footer only when projected

- **Given** a card with no `medCardFooter` content
- **When** it renders
- **Then** no footer divider or footer padding is drawn

#### Scenario CNT-001.S4: Projected title replaces input

- **Given** a card with a projected `medCardTitle` element
- **When** it renders
- **Then** the projected element is shown instead of the plain `title` heading

### REQ CNT-002: Panel collapse

`med-panel` SHALL render its `header` text and projected content. When `toggleable` is true it SHALL expose a toggle button with `aria-expanded` and `aria-controls` and SHALL toggle the two-way bindable `collapsed` state exactly once per activation. When `toggleable` is false it SHALL NOT render a toggle button and SHALL NOT collapse on header click.

#### Scenario CNT-002.S1: Header click toggles

- **Given** a toggleable panel that is expanded
- **When** the user clicks the header
- **Then** `collapsed` becomes true and the toggle button reports `aria-expanded="false"`

#### Scenario CNT-002.S2: Not toggleable

- **Given** a panel with `toggleable` false
- **When** the user clicks the header
- **Then** the state does not change and no toggle button exists

#### Scenario CNT-002.S3: Button click toggles once

- **Given** a toggleable panel
- **When** the user clicks the toggle button
- **Then** `collapsed` changes exactly once

#### Scenario CNT-002.S4: Custom labels

- **Given** a toggleable panel with custom `expandLabel` and `collapseLabel`
- **When** it is collapsed or expanded
- **Then** the toggle button's `aria-label` uses the matching custom label

### REQ CNT-003: Panel toggler and header layout

`med-panel` SHALL honor `toggler` (`header` by default, or `icon`), `iconPos` (`end` by default, `start`, `center`) and `showHeader`. With `toggler="icon"` only the button SHALL toggle; with `showHeader` false the header row SHALL be hidden while the body content stays rendered.

#### Scenario CNT-003.S1: Icon-only toggler

- **Given** a toggleable panel with `toggler="icon"`
- **When** the user clicks the header row outside the button
- **Then** the panel does not toggle
- **But** clicking the button toggles it once

#### Scenario CNT-003.S2: Icon at start

- **Given** a toggleable panel with `iconPos="start"`
- **When** it renders
- **Then** the toggle button is placed before the header text

#### Scenario CNT-003.S3: Hidden header

- **Given** a panel with `showHeader` false
- **When** it renders
- **Then** the header row is absent and the projected content is still visible

### REQ CNT-004: Fieldset legend and collapse

`med-fieldset` SHALL render a native `<fieldset>` with a `<legend>` showing the `legend` text, or the projected `medFieldsetLegend` content when present. When `toggleable` is true it SHALL expose a toggle button (with `aria-expanded`, `aria-controls` and the expand/collapse labels) and toggle `collapsed` once per activation, including on legend click. When not toggleable, clicking the legend SHALL NOT toggle.

#### Scenario CNT-004.S1: Legend click toggles

- **Given** a toggleable fieldset
- **When** the user clicks the legend
- **Then** `collapsed` becomes true

#### Scenario CNT-004.S2: Rich legend

- **Given** a fieldset with projected `medFieldsetLegend` content and a `legend` string
- **When** it renders
- **Then** the projected legend is shown instead of the string

#### Scenario CNT-004.S3: Not toggleable

- **Given** a fieldset with `toggleable` false
- **When** the user clicks the legend
- **Then** nothing changes and no toggle button exists

### REQ CNT-005: Fieldset disabled and toggle events

`med-fieldset` SHALL set the native `disabled` property on its `<fieldset>` only when `disabled` is true. It SHALL emit `beforeToggle` with the pre-toggle value strictly before the state changes and `afterToggle` with the post-toggle value, and SHALL NOT emit either for a programmatic write to `collapsed`.

#### Scenario CNT-005.S1: Disabled propagates

- **Given** a fieldset with `disabled` true containing an input
- **When** it renders
- **Then** the native fieldset is disabled and so is the input

#### Scenario CNT-005.S2: Before and after events

- **Given** a toggleable, expanded fieldset
- **When** the user toggles it
- **Then** `beforeToggle` emits `false` before the change and `afterToggle` emits `true` after

#### Scenario CNT-005.S3: Programmatic write

- **Given** a fieldset bound with `[(collapsed)]`
- **When** the parent sets `collapsed` programmatically
- **Then** `collapsedChange` fires but neither `beforeToggle` nor `afterToggle` emits

### REQ CNT-006: Accordion expansion modes

`med-accordion` SHALL keep all `med-accordion-tab` panels collapsed by default and SHALL toggle a panel when its header is clicked. In single mode it SHALL collapse the previously open panel when another opens; with `multiple` it SHALL leave other panels open. `activeIndex` SHALL be two-way bindable (a number, an array in multiple mode, or null).

#### Scenario CNT-006.S1: Single mode

- **Given** an accordion with tab 0 open
- **When** the user clicks tab 1's header
- **Then** tab 1 is open and tab 0 is closed

#### Scenario CNT-006.S2: Multiple mode

- **Given** an accordion with `multiple` and tab 0 open
- **When** the user clicks tab 1's header
- **Then** both tabs are open

#### Scenario CNT-006.S3: Collapse the open tab

- **Given** a single-mode accordion with tab 0 open
- **When** the user clicks tab 0's header
- **Then** all tabs are collapsed

#### Scenario CNT-006.S4: External binding

- **Given** an accordion bound with `[(activeIndex)]`
- **When** the parent sets the index to 1
- **Then** tab 1 is expanded

### REQ CNT-007: Accordion headers, ARIA and keyboard

Each accordion header SHALL be a button exposing `aria-expanded`, linked to its panel through `aria-controls` and the panel's `aria-labelledby`. A disabled tab SHALL expose `aria-disabled` and SHALL NOT respond to clicks. ArrowDown/ArrowUp SHALL move focus between headers with wrapping and skipping disabled ones, and Home/End SHALL focus the first/last enabled header. Every header SHALL stay in the normal tab order. A projected `medAccordionTabHeader` SHALL replace the `header` string, and `expandIcon`/`collapseIcon` SHALL choose the chevron icons.

#### Scenario CNT-007.S1: Arrow navigation

- **Given** focus on the last header
- **When** the user presses ArrowDown
- **Then** focus moves to the first header

#### Scenario CNT-007.S2: Skip disabled

- **Given** the middle tab is disabled
- **When** the user presses ArrowDown on the first header
- **Then** focus lands on the third header

#### Scenario CNT-007.S3: Disabled click

- **Given** a disabled tab
- **When** the user clicks its header
- **Then** the panel does not open

#### Scenario CNT-007.S4: Default icon rotation

- **Given** the default `expandIcon` and `collapseIcon`
- **When** a panel is collapsed versus expanded
- **Then** the same chevron is shown and rotated for the collapsed state

### REQ CNT-008: Accordion events

`med-accordion` SHALL emit `opened` with the tab index when a panel expands and `closed` with the index when a panel collapses by user action. It SHALL NOT emit for a disabled header click or for a programmatic `activeIndex` write, and in single mode switching panels SHALL emit only `opened` for the new panel.

#### Scenario CNT-008.S1: Opened

- **Given** a collapsed tab
- **When** the user clicks its header
- **Then** `opened` emits that index

#### Scenario CNT-008.S2: Switching in single mode

- **Given** tab 0 open in single mode
- **When** the user opens tab 1
- **Then** only `opened(1)` emits and no `closed` event fires

#### Scenario CNT-008.S3: Programmatic change

- **Given** an accordion
- **When** the parent writes `activeIndex`
- **Then** neither `opened` nor `closed` emits

### REQ CNT-009: Divider

`med-divider` SHALL render with `role="separator"` and `aria-orientation` matching `orientation` (`horizontal` by default, or `vertical`). It SHALL render `type` `solid` as a filled line and `dashed`/`dotted` as border-based lines, and SHALL project inline content aligned by `align` (`start`, `center`, `end`) for both orientations.

#### Scenario CNT-009.S1: Defaults

- **Given** a divider with no inputs
- **When** it renders
- **Then** it is a full-width solid horizontal line with `role="separator"`

#### Scenario CNT-009.S2: Vertical

- **Given** a divider with `orientation="vertical"`
- **When** it renders
- **Then** it is a full-height line and `aria-orientation` is `vertical`

#### Scenario CNT-009.S3: Aligned content

- **Given** a divider with projected text and `align="start"`
- **When** it renders
- **Then** the text is placed at the start of the line

### REQ CNT-010: Splitter sizing and dragging

`med-splitter` SHALL lay out its `med-splitter-panel` children with equal sizes by default, or with the percentages in `sizes`; when `sizes` has the wrong length it SHALL fall back to equal sizes. Dragging a gutter SHALL resize both neighboring panels and update the two-way `sizes` model, clamped by each panel's `minSize` (default 5) and `maxSize` (default 100), and SHALL stop on pointer release. A disabled gutter SHALL ignore pointer input.

#### Scenario CNT-010.S1: Default split

- **Given** a splitter with two panels and no `sizes`
- **When** it renders
- **Then** each panel is 50%

#### Scenario CNT-010.S2: Drag resize

- **Given** a two-panel splitter
- **When** the user drags the gutter
- **Then** both panels resize and `sizes` is updated

#### Scenario CNT-010.S3: Min size clamp

- **Given** a panel with `minSize` 20
- **When** the user drags the gutter past 20%
- **Then** the panel stays at 20%

#### Scenario CNT-010.S4: Release ends the drag

- **Given** a drag in progress
- **When** the pointer is released and then moved
- **Then** the sizes do not change

### REQ CNT-011: Splitter gutter accessibility

Each splitter gutter SHALL expose `role="separator"` with `aria-orientation`, `aria-valuenow` (the size of the preceding panel), `aria-valuemin` 0, `aria-valuemax` 100 and an `aria-label` (default "Resize"). It SHALL be focusable and SHALL step-resize by 1% with ArrowLeft/ArrowRight (horizontal) or ArrowUp/ArrowDown (vertical), respecting min and max sizes. When disabled it SHALL NOT be focusable and SHALL ignore keys.

#### Scenario CNT-011.S1: Horizontal keys

- **Given** a focused gutter in a horizontal splitter
- **When** the user presses ArrowRight
- **Then** the preceding panel grows by 1%

#### Scenario CNT-011.S2: Vertical orientation

- **Given** a splitter with `orientation="vertical"`
- **When** the user presses ArrowDown on the gutter
- **Then** the preceding panel grows and `aria-orientation` is `vertical`

#### Scenario CNT-011.S3: Disabled gutter

- **Given** a disabled gutter
- **When** the user tabs and presses arrow keys
- **Then** it receives no focus and sizes do not change

### REQ CNT-012: Splitter collapse and persistence

When an adjacent panel is `collapsible`, double-clicking the gutter SHALL collapse that panel to 0% (preferring the preceding panel) and give its space to the neighbor, and a second double-click SHALL restore its earlier size. Double-click SHALL do nothing when neither adjacent panel is collapsible or the gutter is disabled. The splitter SHALL emit `resizeStart` and `resizeEnd`, and when `stateKey` is set SHALL persist sizes in `sessionStorage` (default) or `localStorage` (`stateStorage="local"`) and restore them on creation.

#### Scenario CNT-012.S1: Collapse and restore

- **Given** a collapsible first panel at 50%
- **When** the user double-clicks the gutter twice
- **Then** the panel goes to 0% and then returns to 50%

#### Scenario CNT-012.S2: Not collapsible

- **Given** two non-collapsible panels
- **When** the user double-clicks the gutter
- **Then** sizes do not change

#### Scenario CNT-012.S3: Restored state

- **Given** a stored size set under `stateKey` in `localStorage` and `stateStorage="local"`
- **When** the splitter is created
- **Then** the panels use the stored sizes

### REQ CNT-013: Inplace

`med-inplace` SHALL show the `medInplaceDisplay` view as a native button and hide the `medInplaceContent` view until activated, or show content at start when `active` is true. Clicking the display button SHALL activate it (unless `disabled` or `preventClick`), emit `activate`, and move focus to the first focusable element in the content. When `closable` it SHALL render a close button (labeled by `closeLabel`) that deactivates, emits `deactivate` and returns focus to the display button. Content SHALL stay in the DOM between close and reopen. `active` SHALL be two-way bindable.

#### Scenario CNT-013.S1: Activate

- **Given** an inplace with a content input
- **When** the user clicks the display button
- **Then** the content view is shown and the input is focused

#### Scenario CNT-013.S2: Close

- **Given** an active, closable inplace
- **When** the user clicks the close button
- **Then** the display view returns and the display button has focus

#### Scenario CNT-013.S3: Preserved value

- **Given** a value typed into the content input
- **When** the inplace is closed and reopened
- **Then** the input still holds the value

#### Scenario CNT-013.S4: Disabled

- **Given** a disabled inplace
- **When** the user clicks the display button
- **Then** the content view does not open

### REQ CNT-014: Carousel navigation and paging

`med-carousel` SHALL render all `value` items in a track and show `numVisible` at a time. Previous/next buttons SHALL move by `numScroll` (default `numVisible`), clamped so the last page is always full; at the first page previous SHALL be disabled, and at the last next SHALL be disabled unless `circular` is true, in which case navigation wraps. One indicator per page SHALL render with `aria-current` on the current one, hidden when `showIndicators` is false or only one page exists. `showNavigators` false SHALL hide the buttons. `pageChange` SHALL emit the new page only when the page actually changes. `orientation="vertical"` SHALL slide vertically within `verticalViewPortHeight`.

#### Scenario CNT-014.S1: Next

- **Given** a carousel with 6 items and `numVisible` 2 on page 0
- **When** the user clicks next
- **Then** the track moves by two items and `pageChange` emits 1

#### Scenario CNT-014.S2: Edge no-op

- **Given** a carousel on the first page
- **When** previous is invoked
- **Then** the position is unchanged and `pageChange` does not emit

#### Scenario CNT-014.S3: Circular wrap

- **Given** a circular carousel on the last page
- **When** the user clicks next
- **Then** it shows the first page

#### Scenario CNT-014.S4: Hidden indicators

- **Given** a carousel whose items all fit in `numVisible`
- **When** it renders
- **Then** no indicators are shown

### REQ CNT-015: Carousel autoplay, accessibility and responsiveness

`med-carousel` SHALL be a region with `aria-roledescription="carousel"` and an `aria-label` (default "Carousel"), and SHALL announce the current page through a polite live region. When `autoplayInterval` is set it SHALL advance automatically, wrap to the first page at the end, and render a pause/play toggle; without it no toggle SHALL render. With `responsiveOptions` it SHALL apply `numVisible`/`numScroll` of the narrowest tier whose breakpoint fits the viewport, update on resize, and fall back to its own inputs when the viewport is wider than all tiers.

#### Scenario CNT-015.S1: Autoplay pause

- **Given** an autoplaying carousel
- **When** the user clicks the pause toggle
- **Then** it stops advancing until the toggle is clicked again

#### Scenario CNT-015.S2: No autoplay control

- **Given** a carousel with `autoplayInterval` null
- **When** it renders
- **Then** no play/pause button exists

#### Scenario CNT-015.S3: Responsive tier

- **Given** `responsiveOptions` with a 768px tier of `numVisible` 1
- **When** the viewport is 700px wide
- **Then** one item is visible

### REQ CNT-016: Galleria main image and navigation

`med-galleria` SHALL show the item at the two-way `activeIndex` as the main image and previous/next buttons that hide when there is only one item (or `showItemNavigators` is false). Without `circular` the buttons SHALL hide at the ends; with `circular` they SHALL wrap. With `showIndicators` it SHALL render one dot per item, with `aria-current` on the active one, that navigates on click. With `autoPlay` it SHALL advance every `transitionInterval` ms, loop at the end regardless of `circular`, and offer a pause/play toggle.

#### Scenario CNT-016.S1: End of list

- **Given** a non-circular galleria on its last item
- **When** it renders
- **Then** the next button is hidden

#### Scenario CNT-016.S2: Wrap

- **Given** a circular galleria on its last item
- **When** the user clicks next
- **Then** the first item is active

#### Scenario CNT-016.S3: Autoplay toggle

- **Given** a galleria with `autoPlay`
- **When** the user clicks the pause button
- **Then** auto-advance stops

### REQ CNT-017: Galleria thumbnails

`med-galleria` SHALL render a thumbnail tablist (one `role="tab"` per item, using `thumbnailSrc` or falling back to `src`) unless `showThumbnails` is false. Clicking a thumbnail SHALL set `activeIndex`, and `aria-selected` SHALL mark the active one. Only the active thumbnail SHALL be in the tab order; ArrowLeft/ArrowRight SHALL move focus and activation with wrapping, and Home/End SHALL jump to the first/last. A thumbnail that fails to load SHALL show a placeholder icon. `thumbnailsPosition` SHALL place the strip at `bottom`, `top`, `left` or `right`.

#### Scenario CNT-017.S1: Click thumbnail

- **Given** a galleria with three items
- **When** the user clicks the third thumbnail
- **Then** it becomes active and the main image changes

#### Scenario CNT-017.S2: Arrow wrap

- **Given** focus on the last thumbnail
- **When** the user presses ArrowRight
- **Then** the first thumbnail is focused and active

#### Scenario CNT-017.S3: Broken thumbnail

- **Given** a thumbnail whose image fails to load
- **When** the error occurs
- **Then** a placeholder icon replaces it

### REQ CNT-018: Galleria full-screen mode

`med-galleria` with `fullScreen` SHALL render its overlay only while the two-way `visible` is true, with a close control.

#### Scenario CNT-018.S1: Visibility

- **Given** a galleria with `fullScreen` true
- **When** `visible` is false and then set to true
- **Then** the overlay is absent and then present

### REQ CNT-019: Image display

`med-image` SHALL render an `<img>` with `src`, `alt`, optional `width`/`height` (attributes omitted when not provided) and optional `srcSet`/`sizes`. When loading fails it SHALL emit `imageError` and show a placeholder icon, labeled from `alt` or hidden from assistive technology when there is no `alt`, and SHALL retry when `src` changes.

#### Scenario CNT-019.S1: Dimensions

- **Given** an image with `width` 200 and `height` 100
- **When** it renders
- **Then** the `<img>` carries those attributes

#### Scenario CNT-019.S2: Load failure

- **Given** an image with `alt="Logo"`
- **When** the image fails to load
- **Then** `imageError` emits and a placeholder icon labeled "Logo" is shown

#### Scenario CNT-019.S3: Recovery

- **Given** an image in the failed state
- **When** `src` changes
- **Then** the `<img>` is shown again

### REQ CNT-020: Image preview

When `preview` is true `med-image` SHALL wrap the image in a button (labeled by `previewLabel`) that opens a single full-screen overlay (`role="dialog"`, `aria-modal`, labeled from `alt` or a generic label) and emits `opened`. The overlay SHALL offer zoom in/out (disabled at their bounds), rotate left/right by 90 degrees, and close via its button or Escape, emitting `closed`. Destroying the host SHALL close an open overlay, and the broken-image fallback SHALL NOT be wrapped in the button.

#### Scenario CNT-020.S1: Open

- **Given** an image with `preview` true
- **When** the user clicks the preview button
- **Then** a dialog with the same image appears and `opened` emits

#### Scenario CNT-020.S2: Escape

- **Given** an open preview
- **When** the user presses Escape
- **Then** the overlay closes and `closed` emits

#### Scenario CNT-020.S3: Zoom bounds

- **Given** an open preview zoomed to its maximum
- **When** the overlay renders
- **Then** the zoom-in button is disabled

#### Scenario CNT-020.S4: No double open

- **Given** an open preview
- **When** the trigger is activated again
- **Then** no second overlay opens

### REQ CNT-021: Image compare

`med-image-compare` SHALL overlay `beforeSrc` and `afterSrc`, clipping the top image at the two-way `position` (default 50, clamped to 0-100). Clicking the container SHALL jump the divider there and dragging SHALL keep updating until pointer release. The handle SHALL be `role="slider"` with `aria-valuemin` 0, `aria-valuemax` 100, `aria-valuenow` and `aria-label` (default "Comparison position"); ArrowLeft/ArrowRight SHALL change position by `step` and Home/End SHALL jump to 0/100. When `disabled` it SHALL ignore pointer and keyboard input and the handle SHALL NOT be tabbable. Images SHALL be `aria-hidden` and non-draggable, and each failing image SHALL be replaced by a placeholder independently.

#### Scenario CNT-021.S1: Default position

- **Given** an image compare with no `position`
- **When** it renders
- **Then** the handle reports `aria-valuenow` 50

#### Scenario CNT-021.S2: Keyboard

- **Given** a focused handle
- **When** the user presses End
- **Then** position becomes 100

#### Scenario CNT-021.S3: Clamped drag

- **Given** a drag in progress
- **When** the pointer moves beyond the container edge
- **Then** position stays within 0 to 100

#### Scenario CNT-021.S4: Disabled

- **Given** a disabled compare
- **When** the user clicks or presses keys
- **Then** the position does not change
