## Component: ProgressBar

### Description
`ProgressBarComponent` (`med-progress-bar`) is a linear progress indicator with two modes: `determinate` (default) shows a real `value` (0-100, clamped); `indeterminate` sweeps a fixed-width segment back and forth for "in progress, duration unknown" cases (`projects/medra/ui/src/lib/progress-bar/progress-bar.component.ts:7-12`). The indeterminate sweep uses `--animate-progress-indeterminate`, defined once in `tailwind-theme-medraui.css` (not component-local) specifically so any future component could reuse the same sweep (`progress-bar.component.ts:9`, token at `01-foundations/motion.md`). `aria-valuenow` is correctly omitted in indeterminate mode, per the ARIA `progressbar` spec (`progress-bar.component.ts:12,25`).

### Variants
| Variant | When to use |
|---|---|
| `mode="determinate"` (default) | Known progress percentage |
| `mode="indeterminate"` | Progress underway, duration/percentage unknown |
| `severity` (Button's 8-value severity vocabulary) | Colors the fill via `SOLID_SEVERITY_BG` — `progress-bar.component.ts:2,52` |
| `size="sm" \| "default" \| "lg"` | Track height: `h-1.5` / `h-2.5` / `h-4` — `progress-bar.styles.ts:5-9` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `number` (transform `numberAttribute`) | `0` | Clamped to 0-100 (`clampedValue`) — `progress-bar.component.ts:40,48` |
| `severity` | `ButtonSeverity` | `'primary'` | `progress-bar.component.ts:41` |
| `size` | `ProgressBarSize` (`'sm'\|'default'\|'lg'`) | `'default'` | `progress-bar.component.ts:42` |
| `mode` | `ProgressBarMode` (`'determinate'\|'indeterminate'`) | `'determinate'` | `progress-bar.component.ts:43` |
| `showValue` | `boolean` (transform `booleanAttribute`) | `false` | Shows a `{value}%` label below the track (determinate mode only) — `progress-bar.component.ts:44,34-36` |
| `ariaLabel` | `string \| null` | `'Progress'` | `progress-bar.component.ts:45` |
| `class` | `string` (aliased) | `''` | `progress-bar.component.ts:46` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default / in progress | Fill width animates via `transition-[width] duration-(--transition-duration-base)` in determinate mode | `progress-bar.component.ts:29` |
| Indeterminate | `w-1/3` segment sweeps via `animate-progress-indeterminate` | `progress-bar.component.ts:31` |
| Hover / Focus / Active | N/A — non-interactive | — |
| Disabled | Not implemented — no `disabled` input | — |
| Loading | This *is* the loading indicator — no separate loading state of its own | — |
| Error | Not implemented as a distinct state — use `severity="danger"` for a red fill | — |

### Accessibility
- **Role/ARIA:** `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` set only in determinate mode (correctly omitted for indeterminate, per spec), `aria-label` if provided (`progress-bar.component.ts:22-26`) — all directly tested: `progress-bar.component.spec.ts` — `'defaults to 0% with the correct ARIA attributes'`, `'renders the fill width proportional to value'`, `'clamps out-of-range value...'` (both `-20→0` and `150→100`), and the indeterminate-mode describe block's `'omits aria-valuenow entirely'`.
- **Keyboard navigation:** N/A — not an interactive element.
- **Screen reader:** **Resolved 2026-08-19.** `ariaLabel` now defaults to `'Progress'` instead of `null`, matching `ProgressSpinner`'s own `'Loading'` default — no longer ships with no accessible name unless the consumer overrides it. This fix has direct spec coverage: `progress-bar.component.spec.ts` — `'defaults aria-label to "Progress" instead of shipping with none'` and `'applies aria-label when provided'` (the latter confirming the override path still works after the default changed).

**A11y verdict:** Covered — every ARIA attribute this component sets (role, valuemin/max/now, the determinate/indeterminate distinction, and the now-non-null default `aria-label`) has a direct, named test asserting it in `progress-bar.component.spec.ts`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Override the default `'Progress'` label with context-specific text when helpful (e.g. `"Uploading file"`) | Don't rely on `showValue` in indeterminate mode — it's suppressed by template logic (`mode() === 'determinate'` guard) |

### Code example (Angular)
```html
<med-progress-bar [value]="progressDemoValue" showValue />
<med-progress-bar [value]="progressDemoValue" severity="success" size="sm" />
<med-progress-bar [value]="progressDemoValue" severity="danger" size="lg" />
```
Source: `projects/showcase/src/app/app.html:693-695`

### Source
- `projects/medra/ui/src/lib/progress-bar/progress-bar.component.ts`
- `projects/medra/ui/src/lib/progress-bar/progress-bar.styles.ts`
- `projects/medra/ui/src/lib/button/button.styles.ts` (shared `ButtonSeverity`, `SOLID_SEVERITY_BG`)
