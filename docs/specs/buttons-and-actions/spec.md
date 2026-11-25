# Buttons and Actions

**Capability:** `buttons-and-actions`
**ID prefix:** `BTN`
**Paths:** `projects/medra/ui/src/lib/split-button/**`, `projects/medra/ui/src/lib/speed-dial/**`, `projects/medra/ui/src/lib/toolbar/**`

## Purpose

Gives users buttons and grouped action controls to trigger commands. Covers the button directive, split-button with a menu, speed-dial and toolbar layout.

## Requirements

<!-- retired: BTN-001, BTN-001.S1, BTN-001.S2, BTN-001.S3, BTN-002, BTN-002.S1, BTN-002.S2, BTN-003, BTN-003.S1, BTN-003.S2, BTN-003.S3, BTN-004, BTN-004.S1, BTN-004.S2, BTN-005, BTN-005.S1, BTN-005.S2 -->

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
