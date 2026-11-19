# Buttons and Actions

**Capability:** `buttons-and-actions`
**ID prefix:** `BTN`
**Paths:** `projects/medra/ui/src/lib/button/**`, `projects/medra/ui/src/lib/split-button/**`, `projects/medra/ui/src/lib/speed-dial/**`, `projects/medra/ui/src/lib/toolbar/**`

## Purpose

Gives users buttons and grouped action controls to trigger commands. Covers the button directive, split-button with a menu, speed-dial and toolbar layout.

## Requirements

### REQ BTN-001: Button defaults and styling inputs

The `medButton` directive on a `button` or `a` element SHALL render a filled, primary, default-size button when no inputs are set, and SHALL change appearance with `severity`, `variant` (`filled`, `outlined`, `text`, `link`), `size` (`sm`, `default`, `lg`), `pill`, `raised`, `plain`, `fluid` and `iconOnly`.

#### Scenario BTN-001.S1: Defaults

- **Given** a bare `medButton`
- **When** it renders
- **Then** it is filled, primary and default size

#### Scenario BTN-001.S2: Reactive change

- **Given** the variant input changes to `outlined`
- **When** the view updates
- **Then** the button has a border and no solid background

#### Scenario BTN-001.S3: Icon only

- **Given** `iconOnly` is on
- **When** it renders
- **Then** padding is square

### REQ BTN-002: Button native semantics and class overrides

The directive SHALL preserve native button semantics (disabled attribute, type), SHALL show disabled styling for the native disabled state, and a consumer `class` SHALL win over the internal classes on conflict.

#### Scenario BTN-002.S1: Disabled

- **Given** a disabled `button`
- **When** it renders
- **Then** the native disabled attribute is present and disabled styling applies

#### Scenario BTN-002.S2: Override

- **Given** a consumer class conflicts with an internal one
- **When** it renders
- **Then** the consumer class wins

### REQ BTN-003: Button loading state

With `loading` the button SHALL set `aria-busy` and dim interaction without rendering a spinner of its own, and SHALL cancel Enter and Space activation so no click is produced; when not loading it SHALL leave activation alone.

#### Scenario BTN-003.S1: Busy

- **Given** `loading` is on
- **When** the button renders
- **Then** `aria-busy` is true

#### Scenario BTN-003.S2: Keyboard blocked

- **Given** `loading` is on
- **When** the user presses Enter or Space
- **Then** the default action is prevented

#### Scenario BTN-003.S3: Not loading

- **Given** `loading` is off
- **When** the user presses Enter
- **Then** activation is untouched and bound click handlers run

### REQ BTN-004: Button invalid and badge

`invalid` SHALL set `aria-invalid` and a danger focus ring, and omit the attribute when false. `badge` SHALL render a badge with colour from `badgeSeverity` (default secondary) and remove it when cleared.

#### Scenario BTN-004.S1: Invalid

- **Given** `invalid` is on
- **When** it renders
- **Then** `aria-invalid` is true

#### Scenario BTN-004.S2: Badge

- **Given** `badge` is "3"
- **When** it renders
- **Then** a badge showing 3 appears

### REQ BTN-005: Button ripple

The button SHALL show a ripple effect on pointer press and SHALL honour `medRippleDisabled`.

#### Scenario BTN-005.S1: Ripple

- **Given** an enabled button
- **When** the user presses the pointer on it
- **Then** a ripple is shown

#### Scenario BTN-005.S2: Ripple disabled

- **Given** `medRippleDisabled` is set
- **When** the user presses
- **Then** no ripple is shown

### REQ BTN-006: Split-button primary action

A `med-split-button` SHALL render a primary button (with `label`, optional leading `icon` or a `#content` template) next to a toggle button, and clicking the primary button SHALL emit `buttonClick` and SHALL NOT open the menu.

#### Scenario BTN-006.S1: Primary click

- **Given** a closed split-button
- **When** the user clicks the primary button
- **Then** `buttonClick` emits and the menu stays closed

#### Scenario BTN-006.S2: Icon

- **Given** `icon` is set
- **When** it renders
- **Then** a leading icon appears before the label

### REQ BTN-007: Split-button menu

The toggle button SHALL open and close the menu of `items` on each click, with `aria-haspopup="menu"`, `aria-expanded` reflecting state and an `aria-label` from `toggleLabel` (default "More options"), SHALL emit `dropdownClick`, and selecting an item SHALL run its command, emit `itemSelect` and close the menu. Escape SHALL close the menu.

#### Scenario BTN-007.S1: Toggle

- **Given** a closed menu
- **When** the user clicks the toggle twice
- **Then** it opens then closes

#### Scenario BTN-007.S2: Select item

- **Given** an open menu
- **When** the user picks an item
- **Then** its command runs, `itemSelect` emits and the menu closes

### REQ BTN-008: Split-button disabled and appearance

`disabled` SHALL disable both buttons and prevent opening, `buttonDisabled` only the primary and `menuButtonDisabled` only the toggle. `severity`, `variant`, `size` SHALL apply to both buttons and `rounded` SHALL round the outer edges.

#### Scenario BTN-008.S1: Primary only

- **Given** `buttonDisabled` is on
- **When** the user views it
- **Then** the toggle can still open the menu

#### Scenario BTN-008.S2: Toggle only

- **Given** `menuButtonDisabled` is on
- **When** the user views it
- **Then** the primary button still works

### REQ BTN-009: Speed-dial opening and items

A `med-speed-dial` SHALL render a main button (label `toggleLabel`, `aria-expanded`) and one button per item, closed by default with items out of the tab order. Clicking the main button SHALL toggle it, opening SHALL focus the first enabled item, and the `visible` model SHALL track the open state. A disabled speed dial SHALL NOT open.

#### Scenario BTN-009.S1: Open

- **Given** a closed dial
- **When** the user clicks the main button
- **Then** `aria-expanded` is true and the first enabled item has focus

#### Scenario BTN-009.S2: Disabled

- **Given** `disabled` is on
- **When** the user clicks the main button
- **Then** it stays closed

### REQ BTN-010: Speed-dial item activation

Clicking an item SHALL run its command, emit `itemSelect`, close the dial and return focus to the main button. A disabled item SHALL be a real disabled button that never activates, and each item button SHALL have an `aria-label` from its label.

#### Scenario BTN-010.S1: Activate

- **Given** an open dial
- **When** the user clicks an item
- **Then** the command runs, the dial closes and focus returns to the main button

#### Scenario BTN-010.S2: Disabled item

- **Given** an item marked disabled
- **When** the user clicks it
- **Then** nothing happens

### REQ BTN-011: Speed-dial keyboard

In an open dial, ArrowRight and ArrowDown SHALL move focus to the next enabled item and ArrowLeft and ArrowUp to the previous (wrapping and skipping disabled items), Home and End SHALL jump to the first and last enabled item, and Escape SHALL close the dial and focus the main button.

#### Scenario BTN-011.S1: Wrap

- **Given** focus is on the last enabled item
- **When** the user presses ArrowDown
- **Then** focus moves to the first enabled item

#### Scenario BTN-011.S2: Escape

- **Given** the dial is open
- **When** the user presses Escape
- **Then** it closes and the main button has focus

### REQ BTN-012: Speed-dial layout, mask and icons

`direction` (`up`, `down`, `left`, `right`) and `type` (`linear`, `circle`, `semi-circle`, `quarter-circle`, with `radius`) SHALL position items, `transitionDelay` SHALL stagger items by index, `mask` SHALL render a backdrop only while open and clicking it SHALL close the dial, and `showIcon`/`hideIcon` SHALL replace the main icon depending on state.

#### Scenario BTN-012.S1: Mask

- **Given** `mask` is on
- **When** the dial opens and the backdrop is clicked
- **Then** the dial closes

#### Scenario BTN-012.S2: Stagger

- **Given** `transitionDelay` is 50
- **When** the dial renders
- **Then** item N has a delay of 50 times its index

#### Scenario BTN-012.S3: Icon swap

- **Given** `showIcon` and `hideIcon` are set
- **When** the dial opens
- **Then** the main button shows the hide icon

### REQ BTN-013: Toolbar slots

A `med-toolbar` SHALL render content marked `medToolbarStart`, `medToolbarCenter` and `medToolbarEnd` into its start, centre and end regions, SHALL render correctly with only some regions, and SHALL accept a consumer `class`.

#### Scenario BTN-013.S1: Slots

- **Given** content in all three slots
- **When** the toolbar renders
- **Then** each appears in its own region

#### Scenario BTN-013.S2: Start only

- **Given** only a start slot
- **When** the toolbar renders
- **Then** it renders without error

### REQ BTN-014: Toolbar semantics

The toolbar container SHALL have `role="toolbar"` and SHALL set `aria-label` only when `ariaLabel` is provided. It SHALL NOT provide roving-tabindex arrow-key navigation between its items; each item stays in the normal Tab order.

#### Scenario BTN-014.S1: Label

- **Given** `ariaLabel` is "Actions"
- **When** it renders
- **Then** the toolbar has that aria-label

#### Scenario BTN-014.S2: No label

- **Given** no `ariaLabel`
- **When** it renders
- **Then** no aria-label attribute is present
