# Textarea

**Capability:** `textarea`
**ID prefix:** `TXA`
**Paths:** `projects/medra/ui/src/lib/textarea/**`

## Purpose

Defines the behavior of the `medTextarea` directive that styles a native textarea, with optional auto-resize, and the requirements for its documentation page (`/docs/components/textarea`).

## Requirements

### REQ TXA-001: Textarea documentation page
The `/docs/components/textarea` page SHALL expose an `EXAMPLES` list rendered via `<app-component-doc [examples]="examples">` with "On this page" anchor links (`#example-<id>`), English `.txt` prose, interactive demos, and non-empty code blocks for all 12 supported sections in order: `Basic`, `Auto Resize`, `Float Label`, `Ifta Label`, `Sizes`, `Fluid`, `Filled`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, and `Reactive Forms`.

#### Scenario TXA-001.S1: All 12 Textarea documentation sections render and work in a real browser
- **Given** the `/docs/components/textarea` documentation page
- **When** loaded in a real browser with zero console errors or hydration warnings
- **Then** all 12 "On this page" `#example-*` links, prose blocks, live interactive demos, and non-empty code blocks render in order, and interactive controls (`Signal Forms`, `Template Driven`, `Reactive Forms`) update their bound values

### REQ TXA-002: Textarea

The `textarea[medTextarea]` directive SHALL share the text input's `size`, `variant`, `fluid` and `invalid` options and forms integration, SHALL be vertically resizable by default, and SHALL, when `autoResize` is set, disable manual resizing and grow and shrink its height to fit its content on input, on programmatic value writes and on first render.

#### Scenario TXA-002.S1: Auto resize

- **Given** a textarea with `autoResize`
- **When** the user adds lines of text, then removes them
- **Then** its height increases and then decreases to fit the content
