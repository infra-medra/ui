## Component: VirtualScroller

### Description
A thin, themed wrapper (`med-virtual-scroller`) around Angular CDK's own `CdkVirtualScrollViewport`/`CdkFixedSizeVirtualScroll` — not a from-scratch reimplementation. The component's doc comment is explicit that this library rewrites component *logic* from scratch elsewhere to avoid copying the original library's source, but that policy has never meant reinventing Angular's own first-party primitives it already depends on (`SelectPanelComponent`'s option list and `OverlayService` follow the same pattern) — virtual scrolling's buffer management and scroll-anchor preservation are treated as a well-solved, high-bug-risk problem not worth re-deriving (`virtual-scroller.component.ts:6-17`). Use it to render very large lists (thousands of rows) while keeping only the visible ones in the DOM.

### Variants
| Variant | When to use |
|---|---|
| (none — single behavior) | Always fixed-size virtualization via `CdkFixedSizeVirtualScroll`; there is no variable-size-item mode |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly T[]` | `[]` | Item data — `virtual-scroller.component.ts:49` |
| `itemSize` | `number` (attribute) | `40` | Fixed row height in pixels; must be a fixed pixel number (not a CSS value) since `CdkFixedSizeVirtualScroll` computes total scroll height as `itemSize * items.length` without ever measuring a rendered row — `virtual-scroller.component.ts:23-26,51` |
| `trackBy` | `(index: number, item: T) => unknown` | `(index) => index` | `*cdkVirtualFor` track function — `virtual-scroller.component.ts:42,52` |
| `class` | `string` | `''` | Extra classes on the viewport (merged with a mandatory `h-full w-full`) — `virtual-scroller.component.ts:53,57` |
| projected `<ng-template let-item let-index="index">` | `TemplateRef` (required content child) | — | Per-item markup — `virtual-scroller.component.ts:55` |

**Important constraint:** the consumer must give the viewport an explicit height (e.g. `class="h-96"`) — `cdk-virtual-scroll-viewport` uses `contain: strict` internally, so it never derives a height from its own (virtualized) content, the same "consumer sizes the container" contract ScrollPanel/Splitter place on themselves (`virtual-scroller.component.ts:28-32`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Only visible rows (plus CDK's buffer) exist in the DOM at any time — `virtual-scroller.component.ts:41-45` |
| Hover | Not implemented at the VirtualScroller level — entirely up to the consumer's projected template | — |
| Focus | Not implemented — VirtualScroller renders no focusable chrome of its own beyond the CDK viewport | — |
| Active | N/A — no selection concept | — |
| Disabled | Not implemented | — |
| Loading | Not implemented | — |
| Empty | Not implemented — no explicit empty-state text for a zero-length `items` (renders an empty viewport) | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA — investigated 2026-08-19, re-verdicted By design:** None found beyond whatever `CdkVirtualScrollViewport` provides internally — no explicit `role`/`aria-*` set in `virtual-scroller.component.ts`, and this is intentional, not an oversight: the component's own doc comment (`virtual-scroller.component.ts:6-17`) is explicit that this is a *thin wrapper*, not a from-scratch reimplementation — the same trade-off `SelectPanelComponent`'s virtualized option list and `OverlayService` already make for CDK Overlay. VirtualScroller has no opinion on what its items *are* (list rows, grid cells, tree nodes — anything) any more than `DataViewComponent`'s projected-template item content does (see DataView's own doc page, the one remaining deliberate "no ARIA at this layer" component), so it correctly leaves `role`/`aria-*` entirely to the consumer's projected `<ng-template>` — adding a generic `role="list"`/`listitem` here would be actively wrong for a consumer projecting, say, a grid or a tree. `virtual-scroller.component.spec.ts` never queries or asserts any ARIA attribute — its three tests only check the viewport's CSS class (`'renders a cdk-virtual-scroll-viewport sized by the consumer class, not by content'`), that construction with 1,000 items doesn't throw, and that a non-default `itemSize` renders without error [not covered by tests, and correctly so per the above].
- **Keyboard navigation — investigated 2026-08-19, re-verdicted By design:** None found beyond native scroll-container keyboard scrolling (arrow keys/Page Up/Down when the viewport itself has focus, a CDK/browser default, not custom logic in this component) — this wrapper adds no custom keyboard handling of its own, so there is nothing MedraUi-specific to test. No spec test exercises keyboard scrolling — unsurprising since jsdom (used by the spec) has no real layout engine and reports a 0px viewport, so CDK renders zero virtualized rows in the test environment regardless (per the spec's own comment on `'does not render one real DOM row per item...'`); real-browser scroll/keyboard behavior is CDK's own well-tested, external responsibility, not something this thin wrapper could meaningfully re-test without duplicating Angular CDK's own test suite [not covered by tests, and not practically testable in jsdom].
- **Screen reader:** No `aria-live` region found; large-list virtualization can be harder for screen readers in general since off-screen rows aren't in the DOM — no mitigation (e.g. `aria-setsize`/`aria-posinset`) found in source or exercised by the spec. This remains a real, known limitation of virtualized lists in general (not specific to this wrapper) — a consumer needing `aria-setsize`/`aria-posinset` announcements can add them to their own projected item template using the `index` context variable already provided (`virtual-scroller.component.ts:43`).

**A11y verdict — re-verdicted 2026-08-19, Partial → By design:** investigated whether this wrapper should be adding ARIA/keyboard behavior it currently isn't, and found it shouldn't: VirtualScroller is intentionally opinion-free about its item content's semantics (the same design already established for `DataViewComponent`), and it adds no custom keyboard handling beyond native/CDK scroll behavior — there is no MedraUi-specific interaction layer to test, so the previous "Partial" verdict (implying something was left undone) overstated the gap. `CdkVirtualScrollViewport`/`CdkFixedSizeVirtualScroll` carry their own accessibility behavior external to this repo; jsdom's lack of a layout engine means construction/sizing is genuinely the most this repo's own spec can verify. Nothing here is a fix-me; it's this component's correct, by-design scope boundary.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Always size the host container explicitly (e.g. `class="h-96"`) — the viewport cannot derive height from virtualized content (`virtual-scroller.component.ts:28-32`); confirmed by spec `'renders a cdk-virtual-scroll-viewport sized by the consumer class, not by content'` | Don't use a variable/dynamic row height — `itemSize` is a single fixed pixel number for the whole list (`virtual-scroller.component.ts:23-26`) |
| Provide the required `<ng-template let-item let-index="index">` — VirtualScroller fails to render without a projected item template (`contentChild.required`, `virtual-scroller.component.ts:55`) | Don't expect an empty-state message for a zero-item `items` — none is rendered |
| Add your own `role`/`aria-*` (e.g. `role="option"`, `aria-setsize`/`aria-posinset` using the template's `index` variable) inside the projected item template if your list needs specific ARIA semantics — VirtualScroller deliberately adds none itself, by design (see Accessibility above) | Don't expect this component's spec to validate real-browser row virtualization, keyboard scrolling, or screen-reader behavior — jsdom has no layout engine, so those paths are effectively untestable here and are CDK's own external, well-tested responsibility |

### Code example (Angular)
```html
<med-virtual-scroller [items]="virtualScrollerItems" [itemSize]="36" class="h-72 max-w-sm rounded-lg border border-surface-200 dark:border-surface-700">
  <ng-template let-item let-i="index">
    <div class="flex items-center justify-between border-b border-surface-100 px-3 py-2 text-sm dark:border-surface-800">
      <span>{{ item.name }}</span>
      <span class="text-surface-500">#{{ i }}</span>
    </div>
  </ng-template>
</med-virtual-scroller>
```
(Lifted from `projects/showcase/src/app/app.html:1260-1267`.)

### Source
- `projects/medra/ui/src/lib/virtual-scroller/virtual-scroller.component.ts`
- Showcase usage: `projects/showcase/src/app/app.html:1258-1269`
