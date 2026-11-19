## Component: Tabs

### Description
`Tabs` (`<med-tabs>`) declares panels as real content children (`<med-tabs><med-tab header="...">...</med-tab></med-tabs>`) rather than a separate `tabs` data input with an index-based `<ng-content>` slot — keeps arbitrary rich content per tab simple to author. `activeIndex` is a `model()` for `[(activeIndex)]`. The keyboard model is ARIA APG "automatic activation": Arrow keys both move focus AND switch the active tab immediately, using a roving `tabindex` (real, independently focusable buttons — not `aria-activedescendant`, unlike Menu/Select's synthetic rows). Overflowing tabs scroll horizontally (Material Design 3 "scrollable tabs" guidance) rather than collapsing into a "More tabs" menu — an earlier version did that and was reverted in favor of this simpler, spec-aligned behavior. `projects/medra/ui/src/lib/tabs/tabs.component.ts:7-29`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis — one tab-bar visual style. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `activeIndex` | `model<number>` | `0` | Two-way bindable selected tab index. `projects/medra/ui/src/lib/tabs/tabs.component.ts:64` |
| `ariaLabel` | `string` | `'Tabs'` | Label on the `role="tablist"` container. `projects/medra/ui/src/lib/tabs/tabs.component.ts:66` |
| `class` | `string` (aliased) | `''` | Extra classes merged onto the tablist container. `projects/medra/ui/src/lib/tabs/tabs.component.ts:67` |

`TabComponent` (`<med-tab>`, content child, **not meant to be set directly by consumers** — visibility and ARIA-id linking are pushed in by the parent): `header` (`input.required<string>`), `disabled` (`input(false)`). `projects/medra/ui/src/lib/tabs/tab.component.ts:25-27`

### States
| State | Visual | Behavior |
|---|---|---|
| Default (inactive tab) | `border-transparent text-surface-500`, hover `text-surface-700`. | — |
| Active | `border-brand-500 text-brand-600` (dark: `border-brand-400 text-brand-400`), `aria-selected="true"`. | `projects/medra/ui/src/lib/tabs/tabs.component.ts:48,113-122` |
| Hover | `hover:text-surface-700` / dark `hover:text-surface-200`. | `projects/medra/ui/src/lib/tabs/tabs.component.ts:119` |
| Focus | Roving `tabIndex` (only the active tab is `0`, others `-1`); Arrow keys move real DOM focus and switch the active tab. | `projects/medra/ui/src/lib/tabs/tabs.component.ts:51,132-164` |
| Disabled | `aria-disabled="true"`, `cursor-not-allowed opacity-(--opacity-disabled)`; excluded from Arrow/Home/End navigation and from `selectIndex()`. `projects/medra/ui/src/lib/tabs/tabs.component.ts:50,120,124-130,132-164` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** `role="tablist"` on the container with `aria-label`; each button is `role="tab"` with `aria-selected`, `aria-controls` (pointing at its panel's id), and `aria-disabled` as needed; each panel is `role="tabpanel"` with `tabindex="0"`, its own `id`, and `aria-labelledby` pointing back at its tab button. `projects/medra/ui/src/lib/tabs/tabs.component.ts:38-58,105-111`, `projects/medra/ui/src/lib/tabs/tab.component.ts:16-22`. `role="tab"`/`role="tabpanel"` querying and `aria-selected` flipping on activation are spec-verified: `tabs.component.spec.ts — 'clicking a tab switches the active panel and updates aria-selected'`; the `aria-controls`/`id`/`aria-labelledby` cross-linking is directly asserted by `tabs.component.spec.ts — 'links each tab button to its panel via aria-controls/id and aria-labelledby'`; `aria-disabled="true"` on a disabled tab is verified by `tabs.component.spec.ts — 'marks a disabled tab button with aria-disabled'`.
- **Keyboard navigation:** ArrowRight/ArrowLeft move and immediately activate the next/previous enabled tab, wrapping at the ends — verified by `tabs.component.spec.ts — 'ArrowRight/ArrowLeft move to the next/previous tab, wrapping at the ends'` and `'ArrowRight skips a disabled tab'` (automatic-activation model: the same keydown both moves and switches `activeIndex`, no separate "confirm" step); Home/End jump to first/last enabled tab — verified by `tabs.component.spec.ts — 'Home/End jump to the first/last enabled tab'`; roving `tabindex` (only the active tab is `0`, all others `-1`, flipping live as the active tab changes) is verified by `tabs.component.spec.ts — 'only the active tab is in the Tab order (roving tabindex)'`; clicking a disabled tab is confirmed to be a no-op (`tabs.component.spec.ts — 'clicking a disabled tab does nothing'`). `projects/medra/ui/src/lib/tabs/tabs.component.ts:132-164`
- **Panel visibility uses the native `hidden` attribute, not just CSS/`display`:** verified by `tabs.component.spec.ts — 'shows only the active panel, hiding the rest via the hidden attribute'`, so inactive panels are correctly removed from the accessibility tree, not merely visually hidden.
- **Screen reader:** Full tab/tabpanel ARIA pairing via `aria-controls`/`aria-labelledby`/matching `id`s, generated per-instance (`med-tabs-{instanceId}-tab-{i}` / `-panel-{i}`) to avoid collisions between multiple `<med-tabs>` on one page — the id-generation scheme itself is source-only (`[not covered by tests]`: no spec creates two `<med-tabs>` instances on the same page to confirm no id collision), but the resulting `aria-controls`/`aria-labelledby`/`id` triple for a single instance is spec-verified as above. `projects/medra/ui/src/lib/tabs/tabs.component.ts:69,105-111`
- `activeIndex` two-way binding (`[(activeIndex)]`) driving initial selection is verified by `tabs.component.spec.ts — 'activeIndex supports external two-way binding'`.

**A11y verdict:** Covered — role/ARIA structure (tablist/tab/tabpanel + full id cross-linking), roving tabindex, `hidden`-attribute panel suppression, and every keyboard path (ArrowRight/Left wrap-and-skip-disabled, Home/End, disabled-tab click no-op) are all directly exercised by `tabs.component.spec.ts`; the only unverified detail is multi-instance id-collision avoidance, which is a source-level guarantee with no dedicated regression test.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Declare each tab's content directly inside `<med-tab header="...">` — no separate data-array binding needed. | Don't set `TabComponent.active`/`panelId`/`tabButtonId` directly — they're pushed in one-directionally by the parent `TabsComponent`. |
| Rely on the built-in horizontal scroll for overflowing tabs (M3 "scrollable tabs" pattern); `tabs.component.spec.ts — 'pins overflow-y so it never inherits a vertical scrollbar from overflow-x-auto'` documents a real regression this guards against. | Don't expect a "More tabs" overflow menu — that behavior was implemented once and deliberately reverted. |
| Trust ArrowRight/ArrowLeft/Home/End to skip disabled tabs and wrap at the ends — spec-verified, not just implemented (`tabs.component.spec.ts — 'ArrowRight skips a disabled tab'`). | Don't assume a disabled tab is reachable via click or that it silently updates `activeIndex` — both are proven no-ops (`tabs.component.spec.ts — 'clicking a disabled tab does nothing'`). |

### Code example (Angular)
```html
<med-tabs class="max-w-lg">
  <med-tab header="Profile">
    <p>Profile settings go here.</p>
  </med-tab>
  <med-tab header="Billing">
    <p>Billing details go here.</p>
  </med-tab>
  <med-tab header="Disabled" [disabled]="true">
    <p>You should never see this.</p>
  </med-tab>
  <med-tab header="Advanced">
    <p>Advanced settings go here.</p>
  </med-tab>
</med-tabs>
```

### Source
- `projects/medra/ui/src/lib/tabs/tabs.component.ts`
- `projects/medra/ui/src/lib/tabs/tab.component.ts`
- Usage: `projects/showcase/src/app/app.html:1078-1094`
