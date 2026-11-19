## Component: ProgressSpinner

### Description
`ProgressSpinnerComponent` (`med-progress-spinner`) is an indeterminate spinner — always "duration unknown," with no `determinate`/`value` mode (unlike `ProgressBar`; a spinner with a numeric value would just be ProgressBar's job — `projects/medra/ui/src/lib/progress-spinner/progress-spinner.component.ts:7-9`). Rendered as a partial ring (`stroke-dasharray="85 40"`) rotated via Tailwind's built-in `animate-spin` utility (not a custom keyframe, unlike ProgressBar/Skeleton's `--animate-*` tokens). Both SVG circles use `stroke-current`, so `SOLID_SEVERITY_TEXT`'s `text-*` color drives the stroke through `currentColor` — the same technique any icon uses (`progress-spinner.component.ts:9-11`).

### Variants
| Variant | When to use |
|---|---|
| `severity` (Button's 8-value severity vocabulary) | Colors the stroke via `SOLID_SEVERITY_TEXT` — `progress-spinner.component.ts:2,34` |
| `size="sm" \| "default" \| "lg"` | `size-4` / `size-8` / `size-12` — `progress-spinner.styles.ts:4-7` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `severity` | `ButtonSeverity` | `'primary'` | `progress-spinner.component.ts:27` |
| `size` | `ProgressSpinnerSize` (`'sm'\|'default'\|'lg'`) | `'default'` | `progress-spinner.component.ts:28` |
| `ariaLabel` | `string` | `'Loading'` | `progress-spinner.component.ts:30` |
| `class` | `string` (aliased) | `''` | `progress-spinner.component.ts:31` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (always spinning) | `animate-spin` on the SVG, no other state — this component has exactly one visual state | `progress-spinner.component.ts:33` |
| Hover / Focus / Active / Disabled | N/A — non-interactive, no `disabled` input | — |
| Loading | This *is* the loading indicator | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** `role="status"`, `aria-label` (defaults to `'Loading'`) — `progress-spinner.component.ts:20`. Both directly tested: `progress-spinner.component.spec.ts` — `'renders with role="status" and a default English aria-label'` and `'accepts a custom aria-label'`.
- **Keyboard navigation:** N/A — not an interactive element.
- **Screen reader:** Has a sensible default `aria-label` (`'Loading'`), unlike `ProgressBar`'s pre-fix state — the two are now consistent, both defaulting to a non-null label (`'Loading'` here, `'Progress'` on ProgressBar, per that component's 2026-08-19 fix). `role="status"` implies an ARIA-implicit `aria-live="polite"`, so no separate `aria-live` attribute is needed or set here — consistent with how `role="status"` is used elsewhere in this batch. Consider overriding `ariaLabel` with more specific text (e.g. `"Loading billing history"`) when used in a specific context.

**A11y verdict:** Covered — `role="status"` and the default/overridable `aria-label` are both directly tested, and the component has exactly one visual state (`animate-spin`, unconditional), leaving no conditional a11y branch to miss.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use for "busy, unknown duration" states (button loading, page-section loading) | Don't reach for it if you have a real percentage — use `ProgressBar` in `determinate` mode instead |
| Override the default `ariaLabel` with context-specific text when helpful | — |

### Code example (Angular)
```html
<med-progress-spinner size="sm" />
<med-progress-spinner />
<med-progress-spinner size="lg" severity="success" />
```
Source: `projects/showcase/src/app/app.html:707-709`

### Source
- `projects/medra/ui/src/lib/progress-spinner/progress-spinner.component.ts`
- `projects/medra/ui/src/lib/progress-spinner/progress-spinner.styles.ts`
- `projects/medra/ui/src/lib/button/button.styles.ts` (shared `ButtonSeverity`, `SOLID_SEVERITY_TEXT`)
