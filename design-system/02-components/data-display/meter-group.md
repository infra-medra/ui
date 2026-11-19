## Component: MeterGroup

### Description
MeterGroup is a Tier 3 primitive (last item of Tier 3): a single segmented bar showing several related quantities at once (e.g. disk usage by file type, budget spent by category) as proportional-width segments, each colored from `MeterItem.severity` (`projects/medra/ui/src/lib/meter-group/meter-group.component.ts:12-15`). It reuses `SOLID_SEVERITY_BG` (Button's own severity palette) rather than free-form CSS colors per item — the same tokenized-color precedent Tag/Badge/ProgressBar already follow (`meter-group.component.ts:15-19`). Items without an explicit `severity` rotate through a fixed default palette by position (`DEFAULT_SEVERITIES`, `meter-group.component.ts:9`, `:92`).

The bar itself is `aria-hidden="true"` (`meter-group.component.ts:50`): relative segment widths aren't perceivable non-visually, and the real accessible source of truth is the legend list below it, plain text (`label` + `value` + `unit` per item) — the same "the meaningful info lives in real text elsewhere, the visual is decorative" precedent `Skeleton` already established (`meter-group.component.ts:21-26`). `unit` defaults to `'%'` but is a plain string suffix (e.g. `' GB'`) — `value` isn't required to already be a percentage of `max` (`meter-group.component.ts:26-29`).

**Scope cut for v1**: segments aren't individually interactive (no click/hover callout) — a static summary visualization, not a chart component (`meter-group.component.ts:31-33`).

### Variants
| Variant | When to use |
|---|---|
| Default (`showLegend=true`) | Bar + text legend below it (`meter-group.component.ts:75`, `:55-68`) |
| `showLegend=false` | Bar only, no legend | 
| `size="sm" \| "default" \| "lg"` | Track height, reusing `ProgressBarSize`/`PROGRESS_BAR_TRACK_SIZE_CLASS` (`meter-group.component.ts:4,74`, `progress-bar.styles.ts:5-9`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly MeterItem[]` | `[]` | `{ label, value, severity?, icon? }[]` (`meter-group.component.ts:72`, `meter-group.types.ts:3-9`) |
| `max` | `number` | `100` | Total the segments are proportioned against (`meter-group.component.ts:73`, `:86-89`) |
| `size` | `ProgressBarSize` (`'sm' \| 'default' \| 'lg'`) | `'default'` | Track height (`meter-group.component.ts:74`, `progress-bar.styles.ts:1`) |
| `showLegend` | `boolean` | `true` | Shows/hides the text legend below the bar (`meter-group.component.ts:75`) |
| `unit` | `string` | `'%'` | Suffix appended after each legend value (`meter-group.component.ts:77`) |
| `class` | `string` | `''` | Extra classes on the host — sizes both the bar and the legend (`meter-group.component.ts:78`, `:35-41,80`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Segmented bar + optional legend; each segment colored by `item.severity` or a rotating default | — |
| Hover | N/A — bar is `aria-hidden` and segments have no hover styling; not interactive (`meter-group.component.ts:31-33,50`) | N/A |
| Focus | N/A — no focusable elements | N/A |
| Active | N/A | N/A |
| Disabled | N/A — no `disabled` input | N/A |
| Loading | Not implemented | — |
| Error | N/A — no invalid/error state | — |

Transition: segment widths animate via `transition-[width] duration-(--transition-duration-base)` when `value`/`max` change (`meter-group.component.ts:52`).

### Accessibility
- **Role/ARIA:** The bar `<div>` is `aria-hidden="true"` (`meter-group.component.ts:50`) — deliberately decorative, per the component's own doc comment (`meter-group.component.ts:21-26`), verified by `meter-group.component.spec.ts — 'the bar is aria-hidden — the legend carries the accessible info'` (:56-59). No `role="meter"`/`role="progressbar"` is used, so the segmented bar is invisible to the accessibility tree by design, not by omission.
- **Keyboard navigation:** None — not interactive; no keyboard tests in the spec, consistent with a static visualization.
- **Screen reader:** The legend `<ul>` (shown when `showLegend` is true and items exist) is the real accessible source of truth: plain text `label` + `value` + `unit` per item, verified by `spec.ts — 'renders a legend row per item with label + value + unit'` (:61-68) and `'honors a custom unit suffix'` (:70-73).
- **Gap found:** `spec.ts — 'hides the legend when showLegend is false'` (:75-78) confirms the `<ul>` is fully removed from the DOM when `showLegend=false` — and since the bar is unconditionally `aria-hidden`, this combination leaves **zero** accessible content: no `aria-label` fallback on the host or the bar summarizing the data exists anywhere in `meter-group.component.ts`. The Do's/Don'ts already warn against this usage, but nothing in the component itself prevents or mitigates it (e.g. no `aria-label` derived from `value()` is applied to the host when the legend is hidden).
- **A11y verdict:** Covered — **resolved 2026-08-19.** `showLegend=false` no longer removes the legend from the DOM entirely — it now renders with `class="sr-only"` instead, so the same label/value/unit text is always available to assistive tech even though the bar itself stays `aria-hidden`. Directly tested: `meter-group.component.spec.ts` — `'visually hides the legend when showLegend is false, but keeps it sr-only accessible'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Keep `showLegend` on (the default) for accessible content — the bar alone conveys nothing to screen readers | Disabling `showLegend` in a context where the bar is the only visible summary — its data becomes invisible to assistive tech |
| Set `unit` to match the item's real unit (e.g. `' GB'`) when `value` isn't already a percentage of `max` | Assuming `value` must be pre-computed as a percentage — it's computed internally against `max` |
| If you must set `showLegend=false`, add your own `aria-label`/`aria-describedby` on the host summarizing the data | Set `showLegend=false` without any replacement accessible text — confirmed by `meter-group.component.spec.ts:75-78` and `:56-59` together, this combination leaves the component with no accessible content at all |
| Trust that out-of-range values (`value > max`) clamp visually to 100% rather than overflowing the track — regression-tested (`spec.ts:80-86`) | Pre-clamp `value` yourself before passing it in — the component already guards both bounds (`meter-group.component.ts:88`) |

### Code example (Angular)
```html
<med-meter-group [value]="meterGroupItems" [max]="256" unit=" GB" class="max-w-lg" />
```
(from `projects/showcase/src/app/app.html:1166`)

### Source
- `projects/medra/ui/src/lib/meter-group/meter-group.component.ts`
- `projects/medra/ui/src/lib/meter-group/meter-group.types.ts`
- `projects/medra/ui/src/lib/progress-bar/progress-bar.styles.ts` (reused for track size classes)
