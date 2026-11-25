# SelectButton

**Capability:** `select-button`
**ID prefix:** `SLB`
**Paths:** `projects/medra/ui/src/lib/select-button/**`

## Purpose

Defines the behavior of `med-select-button`: a row of toggle buttons for single or multiple choice that works with Angular forms, and the requirements for its documentation page (`/docs/components/select-button`).

## Requirements

### REQ SLB-001: SelectButton documentation page
The `/docs/components/select-button` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 9 supported sections in order: `Basic`, `Multiple`, `Sizes`, `Disabled`, `Invalid`, `Allow Empty`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario SLB-001.S1: All 9 SelectButton documentation sections render and work in a real browser
- **Given** the `/docs/components/select-button` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 9 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and clicking options in `Basic`, `Multiple`, `Allow Empty`, `Signal Forms`, `Template Driven`, and `Reactive Forms` updates the bound value output

### REQ SLB-002: Custom item template
`SelectButtonComponent` SHALL support an optional `<ng-template #item>` `contentChild` (`itemTemplate`) rendered inside each option `<button>` via `NgTemplateOutlet` with context `{ $implicit: option, selected, index }`, falling back to `option.label` when absent, without changing selection, keyboard or ARIA behavior.

#### Scenario SLB-002.S1: Custom #item template renders inside every option button
- **Given** a `<med-select-button>` with three options and an `<ng-template #item let-option let-selected="selected">` that renders custom markup including `option.label`
- **When** rendered in the DOM, and the user clicks an option and navigates with the arrow keys
- **Then** the custom markup renders inside each option button, `selected` is `true` only for the selected option, and `aria-checked` and the bound value still update

### REQ SLB-003: Fluid layout
`SelectButtonComponent` SHALL accept a `fluid` boolean input (also enabled by `MED_FLUID_CONTEXT`) that makes the host `block w-full` and the options share the full width equally; by default the control SHALL remain `inline-block`.

#### Scenario SLB-003.S1: Fluid select button fills its container
- **Given** a `<med-select-button fluid>` inside a container of fixed width, and a default one beside it
- **When** rendered in a real browser
- **Then** the fluid control's width equals the container width with options of equal width, and the default control stays narrower than the container

### REQ SLB-004: Template and Fluid documentation examples
The `/docs/components/select-button` page SHALL include `Template` (`#example-template`) and `Fluid` (`#example-fluid`) sections in `EXAMPLES`, in the order `Basic`, `Multiple`, `Template`, `Sizes`, `Fluid`, `Disabled`, `Invalid`, `Allow Empty`, `Signal Forms`, `Template Driven`, `Reactive Forms`, each with English prose, a live demo and a non-empty code block.

#### Scenario SLB-004.S1: Template and Fluid sections render on the docs page
- **Given** the `/docs/components/select-button` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 11 "On this page" `#example-*` links render in the stated order, and the `Template` and `Fluid` prose, demos and code blocks are visible, with the `Template` demo showing custom item markup and updating its bound value on click

### REQ SLB-005: Select button selection

`med-select-button` SHALL render one button per option from `options` (primitives, objects with `optionLabel`, `optionValue` and `optionDisabled` keys, or `{label, value, disabled}`), SHALL in single mode select one option and expose `role="radiogroup"` with `role="radio"` buttons, and SHALL in `multiple` mode toggle options into an array and expose `role="group"` with `aria-pressed` buttons.

#### Scenario SLB-005.S1: Single selection

- **Given** a single-mode `med-select-button` with options "A" and "B"
- **When** the user clicks "B"
- **Then** the form value is `"B"` and only "B" is checked

#### Scenario SLB-005.S2: Multiple selection

- **Given** a `multiple` `med-select-button`
- **When** the user clicks "A" then "B"
- **Then** the form value is `["A", "B"]`

### REQ SLB-006: Select button deselection and disabled options

`med-select-button` SHALL deselect an option when it is clicked again, unless `allowEmpty` is false (in which case the last selected option stays), and SHALL NOT select disabled options.

#### Scenario SLB-006.S1: Deselect

- **Given** a single-mode `med-select-button` with "A" selected
- **When** the user clicks "A"
- **Then** the form value is `null`

### REQ SLB-007: Select button keyboard

In single mode, `med-select-button` SHALL use a roving tab stop and SHALL, on ArrowRight/ArrowDown and ArrowLeft/ArrowUp, wrap to the next or previous enabled option, and on Home and End go to the first or last enabled option, selecting and focusing it.

#### Scenario SLB-007.S1: Arrow selects

- **Given** a single-mode `med-select-button` with "A" selected and focused
- **When** the user presses ArrowRight
- **Then** "B" is selected and focused
