# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-057: Data table filter row and custom filter template

`<med-data-table>` SHALL accept `filterDisplay` (`'menu' | 'row'`, default `'menu'`). When `filterDisplay` is `'row'` and the table is not stacked, it SHALL render a filter row inside `<thead>` directly below the column header row, with a filter control in each `columnFilter` column's cell (and empty cells for utility and non-filterable columns). `<med-table-column>` SHALL accept a `#filter` template (`filterTemplate`), which when present SHALL render in place of the default filter control in both `filterDisplay="row"` and `filterDisplay="menu"` with context `{ $implicit: value, filter, clear, matchMode }`.

#### Scenario DAT-057.S1: Inline filter row below headers

- **Given** a table with `filterDisplay="row"` and a `name` column with `columnFilter`
- **When** the user types "wid" into the `name` filter row input
- **Then** the table filters rows immediately to those matching "wid" without opening a popover menu
- **And** `columnFilters` is updated and `filter` emits

#### Scenario DAT-057.S2: Custom `#filter` template in row and menu modes

- **Given** a column with `columnFilter` and a `#filter` template calling `filter(value)` and `clear()`
- **When** rendered in `filterDisplay="row"` or in `filterDisplay="menu"`
- **Then** the custom `#filter` template is rendered instead of the default control
- **And** invoking `filter(value)` filters the rows and invoking `clear()` removes the column filter

## MODIFIED Requirements

### REQ DAT-038: Data table column filter menu

A column with `columnFilter` SHALL show a funnel button in its header with the accessible name "Filter {header}" and an `aria-expanded` state (when `filterDisplay` is `'menu'`), and activating the button SHALL open a menu holding a match mode select (only when the column offers more than one mode), a value control for the column's `filterType`, an Add Rule button (`addRuleLabel`) to add additional rules combined with an `AND`/`OR` operator (`'and'` default, `'or'` optional, with `matchAllLabel` / `matchAnyLabel`), and Apply and Clear buttons. Pressing Apply, or Enter in the value control, SHALL commit the rule(s), close the menu and return the table to its first page; the table SHALL then show only the rows that pass every column's rule group (matching all active rules when `'and'` or at least one active rule when `'or'`) and the global filter. Clear SHALL remove the column's rules. A rule with an empty value SHALL filter nothing. The funnel button SHALL show an active state while its column has any active rule. Escape or a click outside the menu SHALL close it without committing and return the focus to the funnel button. Activating the funnel button SHALL NOT change the sort. A column without `columnFilter` SHALL show no funnel button. The model `columnFilters` SHALL hold each column's rule (`{ matchMode, value }`) or rule group (`{ operator, rules }`) keyed by field, SHALL be two-way, and SHALL filter the rows, persist/restore boundedly when `stateKey` is set, and set the funnel states when an application changes it. The `filter` output SHALL also emit when a column rule commits, with the current global text and the filtered rows.

#### Scenario DAT-038.S1: Apply a text rule

- **Given** a table with a `name` column that has `columnFilter` and the rows "Widget", "Gadget" and "Widget Pro"
- **When** the user opens the funnel menu of `name`, types "wid" and presses Enter
- **Then** only "Widget" and "Widget Pro" are shown
- **And** the menu is closed and the funnel button shows its active state

#### Scenario DAT-038.S2: Combines with the global filter

- **Given** a `filterable` table with a `columnFilter` on `name`, and an active rule "wid" on `name`
- **When** the global filter text is set to "pro"
- **Then** only rows that match both are shown

#### Scenario DAT-038.S3: Clear

- **Given** a table with an active rule on `name`
- **When** the user opens the funnel menu and activates Clear
- **Then** all rows are shown again
- **And** the funnel button no longer shows its active state

#### Scenario DAT-038.S4: Funnel does not sort

- **Given** a sortable `name` column with `columnFilter` and no sort applied
- **When** the user activates its funnel button
- **Then** the menu opens and the sort order is unchanged

#### Scenario DAT-038.S5: Escape discards the draft

- **Given** an open filter menu where the user typed a value without applying it
- **When** the user presses Escape
- **Then** the menu closes, the rows are unfiltered and the funnel button has the focus
- **And** its `aria-expanded` is `false`

#### Scenario DAT-038.S6: Returns to the first page

- **Given** a paginated table showing its second page
- **When** the user applies a column rule
- **Then** the table shows the first page of the filtered rows

#### Scenario DAT-038.S7: Column without the input

- **Given** a table where only `name` has `columnFilter`
- **When** the headers are rendered
- **Then** the `name` header has a funnel button and the other headers have none

#### Scenario DAT-038.S8: Two-way model

- **Given** a table whose `columnFilters` is set to a rule on `name` by the application
- **When** the table renders
- **Then** the rows are filtered by that rule and the `name` funnel button shows its active state
- **And** applying a new rule through the menu updates `columnFilters`

#### Scenario DAT-038.S9: Multiple rules with AND and OR operators

- **Given** a table with a `name` column with `columnFilter` and rows "Alpha", "Beta", "Alpha Beta", and "Gamma"
- **When** the user adds two rules on `name` (`contains` "alpha" and `contains` "beta") with operator `'and'`, then switches the operator to `'or'`
- **Then** under `'and'` only "Alpha Beta" is shown
- **And** under `'or'` "Alpha", "Beta", and "Alpha Beta" are shown

### REQ DAT-039: Data table column filter match modes

A `columnFilter` column SHALL offer the match modes of its `filterType`: for `text` (default) contains (default mode), notContains, startsWith, endsWith, equals, notEquals and in; for `numeric` equals (default mode), notEquals, lt, lte, gt, gte, between and in; for `date` dateIs (default mode), dateIsNot, dateBefore, dateAfter, between and in. `filterMatchModes` SHALL restrict the offered modes to those it lists that belong to the type, and `filterMatchMode` SHALL set the preselected mode when it is offered. Text modes SHALL compare case-insensitively against the cell's text, treating a missing value as the empty string. Numeric modes SHALL compare numbers, and a cell whose value is not a finite number SHALL match no numeric mode. Date modes SHALL compare calendar days in the local time zone of cells that are `Date` objects or ISO date strings, and a cell that is neither SHALL match no date mode. `between` SHALL take a two-element `[min, max]` array and match inclusive bounds (ignoring a `null` bound, and inactive when both bounds are empty/null). `in` SHALL take an array of allowed values (optionally populated from `filterOptions` or distinct column values in the UI) and match when the cell equals any element in the array (inactive when empty).

#### Scenario DAT-039.S1: Text modes

- **Given** a text column with the values "Widget", "Gadget" and "widget pro"
- **When** the rule is startsWith "wid", then endsWith "GET", then notEquals "widget"
- **Then** the rows shown are "Widget" and "widget pro", then "Widget" and "Gadget", then "Gadget" and "widget pro"

#### Scenario DAT-039.S2: Between mode for numeric and date columns

- **Given** a numeric `price` column with values 10, 25, 50 and a date `created` column with values "2026-01-01", "2026-01-15", "2026-02-01"
- **When** `price` uses `between` `[15, 50]` and `created` uses `between` `["2026-01-10", "2026-01-20"]`
- **Then** `price` matches 25 and 50
- **And** `created` matches "2026-01-15"

#### Scenario DAT-039.S3: Multi-select `in` mode

- **Given** a text `category` column with values "A", "B", "C"
- **When** the rule uses `in` with `["a", "C"]`
- **Then** rows with category "A" and "C" are shown and "B" is excluded
