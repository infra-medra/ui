# Button

**Capability:** `button`
**ID prefix:** `BTD`
**Paths:** `projects/medra/ui/src/lib/button/**`, `projects/medra/ui/src/lib/button-group/**`

## Purpose

Defines the behavior of the `medButton` directive and `med-button-group`, and the requirements for its documentation page (`/docs/components/button`).

## Requirements

### REQ BTD-001: Button documentation page
The `/docs/components/button` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 15 supported sections in order: `Basic`, `Icons`, `Loading`, `Link`, `Severity`, `Rounded`, `Text`, `Raised Text`, `Outlined`, `Icon Only`, `Badge`, `Sizes`, `Fluid`, `Disabled`, and `Template`.

#### Scenario BTD-001.S1: All 15 Button documentation sections render and work in a real browser
- **Given** the `/docs/components/button` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 15 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Loading` toggle, `Link` anchor, `Disabled` button) behave as expected

### REQ BTD-002: ButtonGroup container component
`@medra.dev/ui` SHALL export `ButtonGroupComponent` (`selector: 'med-button-group'`) as a standalone component with `role="group"` that groups projected `button[medButton]` and `a[medButton]` children horizontally (`inline-flex items-center`), merges consumer `class` via `mergeClasses`, removes inner corner radii between adjacent buttons, collapses adjacent borders (`-ml-px` on non-first children), and raises `:focus-visible` / `:hover` children (`z-10`) so focus rings remain visible.

#### Scenario BTD-002.S1: ButtonGroup renders with role="group" and connects adjacent buttons seamlessly
- **Given** a `<med-button-group>` containing three `<button medButton>` children
- **When** rendered in the DOM and a real browser
- **Then** the host has `role="group"`, adjacent buttons share collapsed inner borders with square inner corners (only first button retains left rounding and only last button retains right rounding), and consumer `class` overrides merge cleanly

### REQ BTD-003: Button Group documentation example
The `/docs/components/button` page SHALL include a `Button Group` (`#example-button-group`) section in `EXAMPLES` with English prose, a live `<med-button-group>` demo, non-empty code block, and Playwright real-browser verification.

#### Scenario BTD-003.S1: Button Group section renders and verifies connected layout on docs page
- **Given** the `/docs/components/button` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** the `Button Group` (`#example-button-group`) link, prose, `<med-button-group>` demo with connected button radii, and code block render visibly

### REQ BTD-004: Button defaults and styling inputs

The `medButton` directive on a `button` or `a` element SHALL render a filled, primary, default-size button when no inputs are set, and SHALL change appearance with `severity`, `variant` (`filled`, `outlined`, `text`, `link`), `size` (`sm`, `default`, `lg`), `pill`, `raised`, `plain`, `fluid` and `iconOnly`.

#### Scenario BTD-004.S1: Defaults

- **Given** a bare `medButton`
- **When** it renders
- **Then** it is filled, primary and default size

#### Scenario BTD-004.S2: Reactive change

- **Given** the variant input changes to `outlined`
- **When** the view updates
- **Then** the button has a border and no solid background

#### Scenario BTD-004.S3: Icon only

- **Given** `iconOnly` is on
- **When** it renders
- **Then** padding is square

### REQ BTD-005: Button native semantics and class overrides

The directive SHALL preserve native button semantics (disabled attribute, type), SHALL show disabled styling for the native disabled state, and a consumer `class` SHALL win over the internal classes on conflict.

#### Scenario BTD-005.S1: Disabled

- **Given** a disabled `button`
- **When** it renders
- **Then** the native disabled attribute is present and disabled styling applies

#### Scenario BTD-005.S2: Override

- **Given** a consumer class conflicts with an internal one
- **When** it renders
- **Then** the consumer class wins

### REQ BTD-006: Button loading state

With `loading` the button SHALL set `aria-busy` and dim interaction without rendering a spinner of its own, and SHALL cancel Enter and Space activation so no click is produced; when not loading it SHALL leave activation alone.

#### Scenario BTD-006.S1: Busy

- **Given** `loading` is on
- **When** the button renders
- **Then** `aria-busy` is true

#### Scenario BTD-006.S2: Keyboard blocked

- **Given** `loading` is on
- **When** the user presses Enter or Space
- **Then** the default action is prevented

#### Scenario BTD-006.S3: Not loading

- **Given** `loading` is off
- **When** the user presses Enter
- **Then** activation is untouched and bound click handlers run

### REQ BTD-007: Button invalid and badge

`invalid` SHALL set `aria-invalid` and a danger focus ring, and omit the attribute when false. `badge` SHALL render a badge with colour from `badgeSeverity` (default secondary) and remove it when cleared.

#### Scenario BTD-007.S1: Invalid

- **Given** `invalid` is on
- **When** it renders
- **Then** `aria-invalid` is true

#### Scenario BTD-007.S2: Badge

- **Given** `badge` is "3"
- **When** it renders
- **Then** a badge showing 3 appears

### REQ BTD-008: Button ripple

The button SHALL show a ripple effect on pointer press and SHALL honour `medRippleDisabled`.

#### Scenario BTD-008.S1: Ripple

- **Given** an enabled button
- **When** the user presses the pointer on it
- **Then** a ripple is shown

#### Scenario BTD-008.S2: Ripple disabled

- **Given** `medRippleDisabled` is set
- **When** the user presses
- **Then** no ripple is shown
