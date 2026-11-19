# Form Selection Lists

**Capability:** `form-selection-lists`
**ID prefix:** `SEL`
**Paths:** `projects/medra/ui/src/lib/select/**`, `projects/medra/ui/src/lib/multi-select/**`, `projects/medra/ui/src/lib/autocomplete/**`, `projects/medra/ui/src/lib/cascade-select/**`, `projects/medra/ui/src/lib/tree-select/**`, `projects/medra/ui/src/lib/listbox/**`, `projects/medra/ui/src/lib/order-list/**`, `projects/medra/ui/src/lib/pick-list/**`

## Purpose

Lets users choose one or several values from option lists, trees and paired lists in forms. Covers Select, Multi-select, Autocomplete, Cascade-select, Tree-select, Listbox, Order-list and Pick-list, all usable with forms.

## Requirements

### REQ SEL-001: Select opens a listbox panel and commits one option

A `med-select` SHALL open a listbox panel when its trigger is clicked, or when ArrowDown or ArrowUp is pressed on the closed trigger, and SHALL commit the chosen option's value and close the panel when an option is picked. A disabled Select SHALL NOT open.

#### Scenario SEL-001.S1: Pick an option by keyboard

- **Given** a Select with three options and nothing selected
- **When** the user opens it with ArrowDown, moves with ArrowDown and presses Enter
- **Then** the value of the highlighted option is committed and the panel closes
- **And** the trigger shows the option label

#### Scenario SEL-001.S2: Disabled Select

- **Given** a disabled Select
- **When** the user clicks the trigger
- **Then** the panel does not open and no panel events are emitted

#### Scenario SEL-001.S3: Placeholder

- **Given** a Select with no value, including after the form writes null
- **When** the Select renders
- **Then** the placeholder is shown and no stray label appears

### REQ SEL-002: Select skips disabled options and closes on Escape

A Select panel SHALL skip disabled options during keyboard navigation and SHALL close on Escape without changing the value.

#### Scenario SEL-002.S1: Skip disabled

- **Given** a panel whose second option is disabled
- **When** the user presses ArrowDown twice from the first option
- **Then** the active option is the third one

#### Scenario SEL-002.S2: Escape

- **Given** an open panel with a highlighted option
- **When** the user presses Escape
- **Then** the panel closes and the value is unchanged

### REQ SEL-003: Option mapping, groups and dataKey

The option-based components (`med-select`, `med-multi-select`, `med-listbox`) SHALL read labels, values, disabled state and group children from the fields named by `optionLabel`, `optionValue`, `optionDisabled`, `optionGroupLabel` and `optionGroupChildren`, SHALL render groups as non-interactive headers followed by their options, and SHALL match object values by the `dataKey` field instead of by reference when `dataKey` is set.

#### Scenario SEL-003.S1: Custom field names

- **Given** options whose label is stored under a custom field and `optionLabel` set to that field
- **When** the list renders
- **Then** each row shows the value of that field

#### Scenario SEL-003.S2: Grouped options

- **Given** options with nested groups
- **When** the panel renders
- **Then** each group appears as a header that cannot be selected, followed by its options

#### Scenario SEL-003.S3: dataKey matching

- **Given** a form value that is an equal object but not the same reference, and `dataKey` set
- **When** the value is written
- **Then** the matching option is shown as selected

### REQ SEL-004: Select filtering

When `filter` is on, the Select panel SHALL show a search box that narrows the options by label containing the text, SHALL match the fields listed in `filterBy` when set, SHALL use prefix matching when `filterMatchMode` is `startsWith`, and SHALL emit `filtered` with the typed text.

#### Scenario SEL-004.S1: Default match

- **Given** a filtering Select
- **When** the user types text that appears in the middle of a label
- **Then** that option stays visible

#### Scenario SEL-004.S2: Starts with

- **Given** `filterMatchMode` is `startsWith`
- **When** the user types text that only appears in the middle of a label
- **Then** that option is hidden

#### Scenario SEL-004.S3: Filter reset

- **Given** `resetFilterOnHide` is on and filter text is entered
- **When** the panel closes and reopens
- **Then** the filter text is empty

### REQ SEL-005: Select clear, loading and editable modes

A Select SHALL show a clear button only when `showClear` is on and a value exists, SHALL clear without reopening the panel, and SHALL show a loading indicator instead of the options while `loading` is on. When `editable` is on it SHALL render a typeable input that commits the typed text as the value on every keystroke and commits null when emptied.

#### Scenario SEL-005.S1: Clear

- **Given** `showClear` is on and a value is selected
- **When** the user clicks the clear button
- **Then** the value becomes null, `cleared` is emitted and the panel stays closed

#### Scenario SEL-005.S2: Loading

- **Given** `loading` is on
- **When** the panel is open
- **Then** a spinner is shown instead of the option list

#### Scenario SEL-005.S3: Editable typing

- **Given** an editable Select
- **When** the user types text
- **Then** the typed text is committed live as the value
- **But** picking a real option from the panel takes priority and shows its label

### REQ SEL-006: Select events and field attributes

The Select and Multi-select SHALL emit panel events in the order before-show, show, before-hide, hide, SHALL emit `fieldClick`, `inputFocus` and `inputBlur`, and SHALL NOT emit `inputBlur` when focus moves into the open panel. They SHALL expose `ariaLabel`, `ariaLabelledBy`, `required` (as `aria-required`, without validating), `invalid` (as `aria-invalid`), `inputId` and `name` on the field.

#### Scenario SEL-006.S1: Panel event order

- **Given** a closed Select
- **When** the user opens and then closes it
- **Then** the four panel events fire in the documented order

#### Scenario SEL-006.S2: Invalid state

- **Given** `invalid` is on
- **When** the field renders
- **Then** `aria-invalid` is true

#### Scenario SEL-006.S3: Blur into panel

- **Given** the panel is open and the field is focused
- **When** focus moves into the panel
- **Then** `inputBlur` is not emitted

### REQ SEL-007: Multi-select toggles several options

A `med-multi-select` SHALL keep its panel open while options are toggled, SHALL add or remove an option each time it is picked, SHALL emit `selectionChanged` with the new list and the toggled value, and SHALL NOT toggle a disabled option.

#### Scenario SEL-007.S1: Toggle

- **Given** an open multi-select
- **When** the user picks an option twice
- **Then** it is added and then removed, and the panel stays open

#### Scenario SEL-007.S2: Escape keeps picks

- **Given** two options are picked
- **When** the user presses Escape
- **Then** the panel closes and both values remain

### REQ SEL-008: Multi-select summary and chips

A Multi-select SHALL summarize the choice as comma-joined labels up to `maxSelectedLabels` (default 2) and then as `selectedItemsLabel` (default "{0} selected"), and with `display="chip"` SHALL render removable chips whose removal emits `chipRemoved` followed by `selectionChanged`.

#### Scenario SEL-008.S1: Collapse

- **Given** three options are picked and the default limit
- **When** the field renders
- **Then** it shows "3 selected"

#### Scenario SEL-008.S2: Chip removal

- **Given** chip display with two chips
- **When** the user removes one chip
- **Then** `chipRemoved` emits its value and the remaining value stays selected

### REQ SEL-009: Multi-select select-all, limit and clear

A Multi-select SHALL show a select-all control by default (hidden when `showToggleAll` is off) that selects every enabled option and emits `selectAllChanged`, SHALL respect `selectionLimit`, and SHALL clear the whole selection without reopening the panel when the clear button is used.

#### Scenario SEL-009.S1: Select all

- **Given** a multi-select with a disabled option
- **When** the user activates select-all
- **Then** every enabled option is selected and the disabled one is not
- **And** `selectAllChanged` emits checked

#### Scenario SEL-009.S2: Clear all

- **Given** `showClear` is on and values are selected
- **When** the user clicks clear
- **Then** the selection is empty, `cleared` is emitted and then `selectionChanged` with an empty list

### REQ SEL-010: Autocomplete search flow

A `med-autocomplete` SHALL emit `search` with the typed text only after `minLength` characters have been typed and `searchDelay` ms (default 300) have elapsed without a further keystroke, and SHALL open its panel once suggestions arrive. With `completeOnFocus` it SHALL emit an empty search on focus; the dropdown button SHALL search with an empty string immediately.

#### Scenario SEL-010.S1: Below minLength

- **Given** `minLength` is 2
- **When** the user types one character
- **Then** no search is emitted

#### Scenario SEL-010.S2: Debounce

- **Given** the default delay
- **When** the user types three characters in quick succession
- **Then** one search is emitted after the pause

#### Scenario SEL-010.S3: Dropdown button

- **Given** `dropdown` is on
- **When** the user clicks the dropdown button
- **Then** `dropdownClick` emits and a search with an empty string fires immediately

### REQ SEL-011: Autocomplete selection and keyboard

Autocomplete SHALL commit a suggestion on click or Enter, fill the input with its label, close the panel and emit `optionSelected`, SHALL skip disabled suggestions, SHALL highlight the first enabled suggestion when `autoHighlight` is on (default), and SHALL close on Escape without changing the value. Home and End SHALL jump to the first and last suggestion.

#### Scenario SEL-011.S1: Keyboard pick

- **Given** open suggestions with autoHighlight
- **When** the user presses Enter
- **Then** the first enabled suggestion is committed

#### Scenario SEL-011.S2: No autoHighlight

- **Given** `autoHighlight` is off
- **When** the panel opens and Enter is pressed
- **Then** nothing is picked

#### Scenario SEL-011.S3: Editing after pick

- **Given** a suggestion was committed
- **When** the user edits the text
- **Then** the committed value is cleared

### REQ SEL-012: Autocomplete multiple and forced selection

With `multiple`, Autocomplete SHALL collect picks as removable chips and emit `optionRemoved` on removal, SHALL ignore a duplicate pick while `unique` is on (default) and allow it when off. With `forceSelection`, free text not picked SHALL be discarded on blur, otherwise free text SHALL stay while the control value is unchanged.

#### Scenario SEL-012.S1: Unique

- **Given** `multiple` and `unique` are on and a value is chosen
- **When** the user picks the same suggestion again
- **Then** the values are unchanged

#### Scenario SEL-012.S2: Force selection

- **Given** `forceSelection` is on and free text is typed
- **When** the user leaves the field
- **Then** the text is discarded

### REQ SEL-013: Autocomplete read-only, clear and loading

Autocomplete SHALL keep its text, never open the panel and hide the clear button and chip remove buttons when `readonly`, SHALL show the clear button only with `showClear` and a value, and SHALL defer opening while `loading` is on so stale suggestions are not shown.

#### Scenario SEL-013.S1: Read-only

- **Given** a readonly Autocomplete
- **When** the user focuses and types
- **Then** no search is emitted and the panel does not open

#### Scenario SEL-013.S2: Loading deferral

- **Given** `loading` is on after a search
- **When** the debounce fires
- **Then** the panel does not open until loading ends

### REQ SEL-014: Cascade-select drilldown

A `med-cascade-select` SHALL open a root panel on trigger click, open a submenu for each group row, resolve a value only when a leaf is chosen and then close the whole chain, and show the breadcrumb of the chosen path joined by `separator` (default " / "). It SHALL emit `optionSelected` with value and path, and `groupOpened` for each opened group.

#### Scenario SEL-014.S1: Pick a leaf at depth three

- **Given** a three-level tree
- **When** the user drills down and picks a leaf
- **Then** the value is set, the whole tree closes and the trigger shows the path

#### Scenario SEL-014.S2: Disabled leaf

- **Given** a disabled leaf
- **When** the user activates it
- **Then** no value is resolved

#### Scenario SEL-014.S3: Seeded value

- **Given** a form value matching a leaf
- **When** it is written
- **Then** the breadcrumb of that leaf is displayed

### REQ SEL-015: Cascade-select keyboard and layout

Cascade-select SHALL close only the deepest level on ArrowLeft and on Escape, SHALL close the entire chain on Tab, SHALL jump to the first and last enabled row on Home and End, and SHALL stack submenus below `breakpoint` (default 960px) instead of beside the parent.

#### Scenario SEL-015.S1: Escape at depth

- **Given** two levels are open
- **When** the user presses Escape
- **Then** only the deepest level closes

#### Scenario SEL-015.S2: Tab

- **Given** two levels are open
- **When** the user presses Tab
- **Then** every level closes

#### Scenario SEL-015.S3: Loading

- **Given** `loading` is on
- **When** the field renders
- **Then** a spinner replaces the open icon and the field is aria-busy

### REQ SEL-016: Tree-select picks a node from a tree

A `med-tree-select` SHALL open a panel containing a tree when its trigger is clicked or ArrowDown pressed, SHALL commit a node on click or Enter, show its label and close, SHALL NOT commit a node marked `selectable: false`, and SHALL return focus to the trigger on Escape or an outside click.

#### Scenario SEL-016.S1: Pick a node

- **Given** an open tree
- **When** the user presses Enter on a focused row
- **Then** the node is committed and the panel closes

#### Scenario SEL-016.S2: Non-selectable

- **Given** a node with `selectable: false`
- **When** the user clicks it
- **Then** the value does not change

### REQ SEL-017: Tree-select options

Tree-select SHALL show a search box only when `filterable` is on, a clear button only when `showClear` is on, a value exists and the field is enabled, and a loading row instead of the tree while `loading` is on (text from `loadingLabel`). ArrowRight on a collapsed node SHALL expand it.

#### Scenario SEL-017.S1: Filterable

- **Given** `filterable` is on
- **When** the user types in the search box
- **Then** only matching nodes remain visible

#### Scenario SEL-017.S2: Loading

- **Given** `loading` is on
- **When** the panel is open
- **Then** a loading row replaces the tree

### REQ SEL-018: Listbox inline selection

A `med-listbox` SHALL render its options inline without an overlay, SHALL select one option at a time by default, and with `multiple` SHALL toggle options and expose `aria-multiselectable`. Keyboard ArrowDown and Enter SHALL select the next enabled option, skipping disabled ones, and `selectionChanged` SHALL carry the new values and the toggled option.

#### Scenario SEL-018.S1: Single

- **Given** a single listbox
- **When** the user presses ArrowDown then Enter
- **Then** the next enabled option is selected

#### Scenario SEL-018.S2: Multiple

- **Given** `multiple` is on
- **When** the user toggles an option twice
- **Then** it is added and then removed

### REQ SEL-019: Listbox filter, select-all and read-only

Listbox SHALL show a filter box with `filter`, SHALL offer select-all in multiple mode that selects only enabled options currently visible, and when `readonly` SHALL keep its value, emit no change and block select-all. With `metaKeySelection`, a plain press SHALL select only the pressed option while Ctrl or Meta toggles.

#### Scenario SEL-019.S1: Filtered select-all

- **Given** a filter narrows the list
- **When** the user activates select-all
- **Then** only the visible enabled options are selected

#### Scenario SEL-019.S2: Meta key

- **Given** `metaKeySelection` is on with two selected
- **When** the user presses an option without Ctrl
- **Then** only that option remains selected

### REQ SEL-020: Listbox drag-and-drop and events

With `dragdrop`, Listbox SHALL let options be reordered by dragging and emit `reorder` with previous and current index. It SHALL emit `optionClicked` and `optionDoubleClicked`, `listFocus` and `listBlur`, and a disabled listbox SHALL emit no change or click.

#### Scenario SEL-020.S1: Click events

- **Given** an enabled listbox
- **When** the user double-clicks an option
- **Then** `optionDoubleClicked` carries the value and the event

#### Scenario SEL-020.S2: Disabled

- **Given** a disabled listbox
- **When** the user clicks an option
- **Then** no change and no click event are emitted

### REQ SEL-021: Order-list reorders items

A `med-order-list` SHALL render `value` in order and expose click selection (aria-selected, multi-select) with a roving tab stop. Move up, down, top and bottom controls SHALL move the whole selection as a block keeping its relative order, SHALL be disabled when nothing is selected, and Move up/top SHALL be disabled when the selection already touches the start (and Move down/bottom the end).

#### Scenario SEL-021.S1: Move up

- **Given** a selected item that has a predecessor
- **When** the user activates Move up
- **Then** it swaps with its predecessor and `value` updates

#### Scenario SEL-021.S2: Edge

- **Given** the first item is selected
- **When** the view renders
- **Then** Move up is disabled

### REQ SEL-022: Order-list drag, keyboard and disabled

Order-list SHALL support ArrowUp/ArrowDown (wrapping), Home/End and Enter/Space on options, SHALL allow dragging one item to a new position when `dragdrop` is on (default) regardless of selection, and when `disabled` SHALL block selection, disable all move buttons, remove options from the tab order and set `aria-disabled`. `filterBy` SHALL filter by that field.

#### Scenario SEL-022.S1: Drag

- **Given** dragdrop is on
- **When** an item is dragged onto another
- **Then** only the dragged item moves to that position

#### Scenario SEL-022.S2: Disabled

- **Given** `disabled` is on
- **When** the user clicks an item
- **Then** it is not selected

### REQ SEL-023: Pick-list transfers between lists

A `med-pick-list` SHALL render `source` and `target` lists and move selected items with the move buttons and all items with the move-all buttons, SHALL move a double-clicked item immediately, SHALL clear the origin selection after a move, and SHALL emit `moveToTarget`, `moveAllToTarget`, `moveToSource` or `moveAllToSource` accordingly (a double-click emits the non-all event).

#### Scenario SEL-023.S1: Move selected

- **Given** two selected source items
- **When** the user activates Move selected to target
- **Then** only those items move and the source selection clears

#### Scenario SEL-023.S2: Double click

- **Given** a source item
- **When** it is double-clicked
- **Then** it moves to the target alone

### REQ SEL-024: Pick-list filtering, disabled items and reordering

Pick-list SHALL show a filter box per list only when `filterPredicate` is set, SHALL apply move-all only to currently visible items, SHALL exclude items for which `itemDisabled` is true from selection, move-all and double-click, and SHALL offer reorder buttons per list unless `showSourceControls` or `showTargetControls` is off. With `keepSelection`, moved items SHALL arrive selected.

#### Scenario SEL-024.S1: Filtered move-all

- **Given** a filter shows two of five source items
- **When** the user activates Move all
- **Then** only those two move

#### Scenario SEL-024.S2: Disabled item

- **Given** an item flagged disabled
- **When** the user clicks it
- **Then** it is not selected and has aria-disabled
