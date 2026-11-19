## Component: Divider

### Description
A simple separator line — the host element itself *is* the line, no wrapping markup (`projects/medra/ui/src/lib/divider/divider.component.ts:7-11`). Deliberately doesn't support an inline label for v1 (common in other libraries, but not needed yet; can be added later without breaking the API per the component's own doc comment). Used to visually separate content in a horizontal or vertical direction.

### Variants
| Variant | When to use |
|---|---|
| `horizontal` (default) | Full-width line, `h-px w-full`, for separating stacked/vertical content (`divider.component.ts:29-30`) |
| `vertical` | Full-height line, `h-full w-px`, for separating side-by-side content (`divider.component.ts:31`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Line direction (`divider.component.ts:24`) |
| `class` | `string` | `''` | Extra classes merged onto the host (`divider.component.ts:25`) |

### States
N/A — non-interactive. Divider is a static separator with no hover/focus/active/disabled/loading/error states.

| State | Visual | Behavior |
|---|---|---|
| Default | `bg-surface-200` (light) / `dark:bg-surface-700` (dark) line (`divider.component.ts:30-31`) | — |

### Accessibility
- **Role/ARIA:** `role="separator"` and `[attr.aria-orientation]="orientation()"` set on the host (`divider.component.ts:17-18`) — both directly tested for both orientations: `divider.component.spec.ts` — `'is a horizontal full-width line by default'` (asserts `aria-orientation="horizontal"`), `'becomes a vertical full-height line when orientation is vertical'` (asserts `aria-orientation="vertical"`), `'has role=separator'`.
- **Keyboard navigation:** None found — not a focusable/interactive element, which is correct for a static `role="separator"` (per WAI-ARIA, a non-focusable separator carries no keyboard interaction expectations; only a focusable/resizable separator, like Splitter's gutter, needs Arrow-key handling).
- **Screen reader:** No `aria-label`; the `separator` role plus `aria-orientation` is the only announced semantics — appropriate for a purely decorative/structural line with no content of its own to name.

**A11y verdict:** Covered — the only accessibility-relevant surface (`role="separator"` + `aria-orientation`) is directly tested for both orientation values, and the component has no interactive behavior that would need keyboard/focus coverage.

### Do's and Don'ts
Not enough evidence to derive additional do's/don'ts from source alone beyond picking the correct `orientation` for the layout direction.

### Code example (Angular)
```html
<med-divider />
<med-divider orientation="vertical" />
```
(from `projects/showcase/src/app/app.html:681`, `:685`)

### Source
- `projects/medra/ui/src/lib/divider/divider.component.ts`
