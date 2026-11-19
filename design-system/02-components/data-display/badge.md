## Component: Badge

### Description
Badge is a Tier 1 primitive: a small circular status/count indicator (`projects/medra/ui/src/lib/badge/badge.component.ts:20-24`). It is explicitly **not** the positioning wrapper for overlaying another element — that job belongs to the separate `OverlayBadge` component (Tier 2). Badge reuses Button's own filled severity color classes (`FILLED_SEVERITY_CLASSES`), the same convention Tag also follows (`badge.component.ts:23`, `:3`).

### Variants
| Variant | When to use |
|---|---|
| Value badge (default, `dot=false`) | Shows projected content (a count, a short label) inside a pill (`badge.component.ts:30`, `:41-42`) |
| `dot` | No content — a small solid colored dot, e.g. an "unread"/"online" indicator (`badge.component.ts:36`, `:42`) |
| `size="sm" \| "default" \| "lg"` | Height/font scale (`badge.component.ts:7-17`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `severity` | `ButtonSeverity` | `'primary'` | Color, via `FILLED_SEVERITY_CLASSES` (`badge.component.ts:33`, `:43`) |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Size scale (`badge.component.ts:34`, `:7-17`) |
| `dot` | `boolean` | `false` | Renders as a small dot with no content instead of a value pill (`badge.component.ts:36`) |
| `class` | `string` | `''` | Extra classes merged onto the inner `<span>` (`badge.component.ts:37`) |

Note: Badge has no `value`/content input — content is projected via `<ng-content />` (`badge.component.ts:30`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Solid severity-colored pill or dot | — |
| Hover | N/A — static, non-interactive `<span>` | N/A |
| Focus | N/A — not focusable | N/A |
| Active | N/A | N/A |
| Disabled | N/A — no `disabled` input | N/A |
| Loading | Not implemented | — |
| Error | N/A | — |

### Accessibility
- **Role/ARIA:** None found on `BadgeComponent` itself — no `role` or `aria-*` attributes in the template (`badge.component.ts:30`). Accessible-name handling for value badges is deferred to consumers/`OverlayBadge` (see `overlay-badge.md`). `badge.component.spec.ts` (:1-58) has no accessibility assertions at all — every test checks only `className`/`textContent`, confirming there is no ARIA wiring to verify.
- **Keyboard navigation:** None found — not an interactive element; no `tabindex`/keydown handling in source, and no keyboard tests in the spec.
- **Screen reader:** No `aria-label`/`sr-only` wiring inside Badge itself; a projected count like `5` has no built-in accessible announcement, and a `dot` badge (`badge.component.spec.ts — 'renders as a small dot with no padding when dot is true'`, :48-52) renders as a bare colored `<span>` with no text content and no label at all — a screen reader gets nothing from it.
- **A11y verdict:** Covered — **resolved 2026-08-19.** Added an `ariaLabel` input, used only in `dot` mode (non-dot Badge already had an accessible name via its projected content) — renders an `sr-only` span, the same opt-in pattern `OverlayBadge.badgeAriaLabel` already established. Directly tested: `badge.component.spec.ts` — `'dot mode with an ariaLabel renders an sr-only accessible name'`, `'dot mode without an ariaLabel renders no accessible name'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `dot` for a contentless status indicator instead of an empty value badge | Putting long text inside a Badge — it's sized for short counts/labels only |
| Add your own accessible label/context when a Badge's meaning isn't obvious from surrounding text | Relying on Badge alone to announce meaning to screen readers |
| Pair a `dot` badge with visually-hidden text or an `aria-label` on a wrapping element (e.g. "3 unread") | Ship a bare `dot` badge as the only status signal — `badge.component.spec.ts:48-52` confirms it renders with no text and no label of its own |

### Code example (Angular)
```html
Messages <med-badge severity="danger">5</med-badge>
Online <med-badge severity="success" dot />
```
(from `projects/showcase/src/app/app.html:670,673`)

### Source
- `projects/medra/ui/src/lib/badge/badge.component.ts`
