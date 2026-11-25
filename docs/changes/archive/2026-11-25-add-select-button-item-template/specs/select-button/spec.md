# Delta: SelectButton

**Capability:** `select-button`

## ADDED Requirements

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
