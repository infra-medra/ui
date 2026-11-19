# Styling and Theming

**Capability:** `styling-and-theming`
**ID prefix:** `STY`
**Paths:** `projects/medra/ui/src/styles/**`, `projects/medra/ui/src/lib/utils/**`, `projects/medra/ui/src/lib/style-class/**`, `projects/medra/ui/src/lib/class-names/**`, `projects/medra/ui/src/lib/ripple/**`

## Purpose

Gives consumers a pre-generated stylesheet with design tokens, a class-based dark mode and predictable class overrides on every component. It also ships three small styling helpers: class merging, the class-names directive, the style-class directive and the ripple directive.

## Requirements

### REQ STY-001: Pre-generated stylesheet and tokens

The library SHALL provide a pre-generated stylesheet that defines the design tokens (brand, severity and surface color scales, radii, focus ring, disabled opacity, transition durations, form-field spacing and text sizes, overlay shadows) so that components are styled without the consumer running a utility-CSS build for the library's own classes.

#### Scenario STY-001.S1: Tokens available to components

- **Given** an application that loads the library stylesheet
- **When** a component such as a text input is rendered
- **Then** its brand, surface, radius and field-spacing styling resolves from the library's tokens

### REQ STY-002: Brand and severity color scales

The stylesheet SHALL expose color scales named `brand`, `info`, `success`, `warn`, `help`, `danger` and `surface`, each with the steps 50 to 950 (`surface` also has step 0), where `brand` is teal-based.

#### Scenario STY-002.S1: Brand scale is teal

- **Given** the library stylesheet is loaded
- **When** a brand-colored utility such as `brand-500` is evaluated
- **Then** it resolves to the teal 500 color

### REQ STY-003: Dark mode via the dark class

The stylesheet SHALL activate dark variants only when a `dark` class is present on the element or one of its ancestors, and SHALL NOT depend on the operating-system color-scheme preference.

#### Scenario STY-003.S1: Class enables dark styling

- **Given** the root element has the class `dark`
- **When** a component renders
- **Then** its dark variants apply

#### Scenario STY-003.S2: No class, no dark styling

- **Given** the root element has no `dark` class
- **When** the operating system prefers a dark color scheme
- **Then** the component still renders its light styling

### REQ STY-004: Surface scale redefinition in dark mode

Under the `dark` class, the `surface` scale SHALL switch from the slate palette to the zinc palette, while `surface-0` stays white.

#### Scenario STY-004.S1: Surface palette switches

- **Given** the root element has the class `dark`
- **When** a surface color is resolved
- **Then** it is taken from the zinc palette instead of the slate palette

### REQ STY-005: Overlay container styling

The stylesheet SHALL include the structural positioning styles of the overlay layer and SHALL give content rendered inside the overlay container a default text color, so overlay content stays readable in light and dark mode even when the application sets its text color on its own root element.

#### Scenario STY-005.S1: Overlay content readable

- **Given** an overlay (for example a dialog) is open and the content sets no text color
- **When** the page is in dark mode
- **Then** the content text is rendered with a light color instead of the browser default black

### REQ STY-006: Class override with conflict resolution

Components that accept a `class` input SHALL merge it with their own internally generated classes so that, on a utility conflict, the consumer's class wins, and SHALL ignore falsy class values.

#### Scenario STY-006.S1: Consumer class wins

- **Given** a component whose internal classes include `px-2`
- **When** the consumer passes `class="px-6"`
- **Then** the rendered element has `px-6` and not `px-2`

#### Scenario STY-006.S2: Falsy values ignored

- **Given** the merge function receives `'a'`, `false`, `undefined` and `'b'`
- **When** it combines them
- **Then** the result is `'a b'`

### REQ STY-007: Merge recognizes library utility groups

The class merge SHALL treat the library's own field text sizes (`text-field-sm`, `text-field-base`, `text-field-lg`) as font-size utilities and its radius steps (`rounded-xs` to `rounded-xl`) as border-radius utilities, so consumer overrides of them resolve conflicts correctly.

#### Scenario STY-007.S1: Radius override

- **Given** internal classes include `rounded-md`
- **When** the consumer passes `rounded-xl`
- **Then** only `rounded-xl` remains

### REQ STY-008: Class-names directive input shapes

The `[medClassNames]` directive SHALL accept a string, an array of strings, a record mapping class names to booleans (applying the keys whose value is truthy), or null/undefined, and SHALL merge the result with the host's static classes, with the dynamic classes winning conflicts.

#### Scenario STY-008.S1: Record input

- **Given** a host with static class `p-2` and `[medClassNames]="{ 'p-4': true, 'text-red-500': false }"`
- **When** the directive applies
- **Then** the host has `p-4` and does not have `p-2` or `text-red-500`

### REQ STY-009: Class-names directive ignores unsafe keys

The `[medClassNames]` directive SHALL NOT apply the record keys `__proto__`, `constructor` or `prototype` as classes.

#### Scenario STY-009.S1: Prototype keys skipped

- **Given** a record containing the key `constructor` with a truthy value
- **When** the directive applies
- **Then** no class named `constructor` is added to the host

### REQ STY-010: Style-class target resolution

The `[medStyleClass]` directive SHALL resolve its target from `@next`, `@prev`, `@parent`, `@grandparent` or a CSS selector, and SHALL NOT throw when the selector is invalid or matches nothing.

#### Scenario STY-010.S1: Relative target toggled

- **Given** a button with `medStyleClass="@next"` and `toggleClass="is-open"`
- **When** the user clicks the button twice
- **Then** the next sibling gains `is-open` after the first click and loses it after the second

#### Scenario STY-010.S2: Invalid selector

- **Given** `medStyleClass="[invalid=="`
- **When** the user clicks the host
- **Then** nothing throws and no class changes

### REQ STY-011: Style-class enter and leave classes

The `[medStyleClass]` directive SHALL, on entering, add the enter-active and enter-to classes and remove the enter-from and leave classes, and on leaving SHALL do the reverse, using the `enterFromClass`, `enterActiveClass`, `enterToClass`, `leaveFromClass`, `leaveActiveClass` and `leaveToClass` inputs.

#### Scenario STY-011.S1: Enter then leave

- **Given** `enterToClass="opacity-100"` and `leaveToClass="opacity-0"`
- **When** the host is clicked to enter and clicked again to leave
- **Then** the target has `opacity-100` after entering and has `opacity-0` without `opacity-100` after leaving

### REQ STY-012: Style-class triggers and dismissal

The `[medStyleClass]` directive SHALL toggle on click by default, SHALL enter on mouse enter and leave on mouse leave when `trigger="hover"`, SHALL leave when the user clicks outside both host and target if `hideOnOutsideClick` is set, and SHALL leave on the Escape key if `hideOnEscape` is set. Its document listeners SHALL stop working after the host is destroyed.

#### Scenario STY-012.S1: Outside click and Escape

- **Given** the target is entered and `hideOnOutsideClick` and `hideOnEscape` are set
- **When** the user clicks elsewhere on the page, or presses Escape
- **Then** the target leaves

#### Scenario STY-012.S2: Hover trigger

- **Given** `trigger="hover"` and `toggleClass="hovered"`
- **When** the pointer enters then leaves the host
- **Then** the target gains `hovered` and then loses it

### REQ STY-013: Ripple feedback

The `[medRipple]` directive SHALL show a ripple wave from the pointer-down point inside a non-interactive, hidden-from-assistive-technology container, SHALL give a statically positioned host relative positioning, and SHALL remove each ripple element when its animation ends.

#### Scenario STY-013.S1: Ripple created and removed

- **Given** a host with `medRipple`
- **When** the user presses the pointer on it
- **Then** a ripple container with a ripple circle appears, and the circle is removed after the animation finishes

### REQ STY-014: Ripple suppression

The `[medRipple]` directive SHALL NOT show a ripple when `medRippleDisabled` is true, when the host is a disabled native button, or when the user prefers reduced motion.

#### Scenario STY-014.S1: Reduced motion

- **Given** the user prefers reduced motion
- **When** the user presses the pointer on a host with `medRipple`
- **Then** no ripple is created
