## Component: Timeline

### Description
A vertical list of events (`med-timeline`), each rendered as a marker dot on a connecting line plus consumer-supplied content via a single required projected `<ng-template let-event>`. Same single content-projection-template convention PickList/OrderList already use for a data-driven list with arbitrary item markup. Use it for chronological event feeds (activity logs, order status history).

### Variants
| Variant | When to use |
|---|---|
| (none — single behavior) | v1 is always left-aligned (marker + connector on the left, content on the right); no horizontal layout or alternating left/right alignment exists yet. Explicit scope cut, not a dead end: `value` is a plain array and marker/connector markup is internal, so a future `align`/`layout` input could be added without breaking current usage — `timeline.component.ts:12-17` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly T[]` | `[]` | Event data — `timeline.component.ts:48` |
| `class` | `string` | `''` | Extra classes on the host — `timeline.component.ts:49` |
| projected `<ng-template let-event>` | `TemplateRef` (required content child) | — | Per-event markup — `timeline.component.ts:51` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Marker dot (`size-3` rounded, brand-colored border) + connector line between items, last item has no trailing connector — `timeline.component.ts:34-38` |
| Hover | Not implemented at the Timeline level — entirely up to the consumer's projected template | — |
| Focus | Not implemented — Timeline renders no focusable chrome of its own | — |
| Active | N/A — no selection concept | — |
| Disabled | Not implemented | — |
| Loading | Not implemented | — |
| Empty | Not implemented — no explicit empty-state text for a zero-length `value` (renders an empty `<ul>`) | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Plain `<ul>`/`<li>` markup, deliberately with no extra ARIA role — the component's own doc comment states this is "a non-interactive display of content the browser and a screen reader already understand as a list," the same reasoning `CardComponent` needs no special role for a list of cards (`timeline.component.ts:18-21`). Confirmed by spec: `timeline.component.spec.ts` — `'renders one <li> per event, with the projected content'` asserts a real `<li>` per event (native list-item semantics, no custom role needed); `'renders a marker for every event'` and `'renders a connector between every event except after the last one'` confirm the decorative marker/connector spans are purely presentational structure alongside the semantic list, not competing ARIA roles.
- **Keyboard navigation:** None found — Timeline itself renders no interactive/focusable elements; any interactivity in event content is the consumer's own. No spec test dispatches any keyboard/pointer event — all assertions are structural (element counts/text), consistent with Timeline being non-interactive by design.
- **Screen reader:** No `aria-live` region found; relies entirely on native list semantics. `'renders nothing when the value is empty'` confirms an empty `value` renders zero `<li>` elements with no empty-state announcement [not covered by tests, and arguably not needed for a passive list].

**A11y verdict:** Covered — Timeline deliberately relies on native `<ul>`/`<li>` list semantics rather than custom ARIA, which is the correct minimal pattern for a non-interactive display list; the spec confirms the list structure (item count, marker-per-item, connector-between-items) that this semantic relies on, and there is no interactive behavior to leave unverified.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Provide the required `<ng-template let-event>` — Timeline throws/fails to render without a projected item template (`contentChild.required`, `timeline.component.ts:51`) | Don't expect a horizontal or alternating-side layout — only the left-aligned marker+connector layout exists in v1 (`timeline.component.ts:12-17`) |
| Trust the last item never gets a trailing connector — directly asserted by spec (`'renders a connector between every event except after the last one'`, N events → N−1 connectors) | Don't add your own `role="list"` wrapper — Timeline already renders a real `<ul>`/`<li>` structure (confirmed by spec), so an extra role is redundant |

### Code example (Angular)
```html
<med-timeline [value]="timelineEvents" class="max-w-md">
  <ng-template let-event>
    <p class="text-sm font-medium text-surface-900 dark:text-surface-50">{{ event.title }}</p>
    <p class="text-xs text-surface-500">{{ event.date }}</p>
    <p class="mt-1 text-sm text-surface-600 dark:text-surface-300">{{ event.description }}</p>
  </ng-template>
</med-timeline>
```
(Lifted from `projects/showcase/src/app/app.html:1359-1365`.)

### Source
- `projects/medra/ui/src/lib/timeline/timeline.component.ts`
- Showcase usage: `projects/showcase/src/app/app.html:1357-1366`
