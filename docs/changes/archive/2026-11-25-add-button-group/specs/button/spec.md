# Delta: Button

**Capability:** `button`

## ADDED Requirements

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
