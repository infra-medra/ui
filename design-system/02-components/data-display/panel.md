## Component: Panel

### Description
`PanelComponent` (`med-panel`) is a titled container primitive: a header row plus a body, optionally collapsible. Content is projected via `<ng-content />` into the body — no data-driven API. Use for grouping related content under a heading, with an optional expand/collapse affordance (`toggleable`). `collapsed` is a `model()` (two-way bindable via `[(collapsed)]`) rather than a form control, since it's local UI state, not a value the consumer submits (`projects/medra/ui/src/lib/panel/panel.component.ts:9-17,58`).

**Scope cut for v1**: no expand/collapse animation — content visibility is toggled via the `hidden` attribute (content stays in the DOM either way, so `aria-controls` always points at a real element), not a height transition; documented as something that can be layered on later without an API change (`panel.component.ts:19-21`).

### Variants
| Variant | When to use |
|---|---|
| `toggleable` (boolean) | Adds a chevron button and makes the whole header row clickable to expand/collapse |
| Non-toggleable (default) | Static titled container, always expanded |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `header` | `string` | `''` | Header text | `panel.component.ts:56` |
| `toggleable` | `boolean` | `false` | Enables the collapse/expand chevron and clickable header | `panel.component.ts:57` |
| `collapsed` | `model<boolean>` | `false` | Two-way bindable collapsed state | `panel.component.ts:58` |
| `expandLabel` | `string` | `'Expand'` | `aria-label` on the toggle button when collapsed | `panel.component.ts:60` |
| `collapseLabel` | `string` | `'Collapse'` | `aria-label` on the toggle button when expanded | `panel.component.ts:61` |
| `class` | `string` (aliased) | `''` | Extra classes merged onto the outer container | `panel.component.ts:62` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (expanded) | Bordered container, `rounded-lg border border-surface-200 bg-surface-0` (dark: `border-surface-700 bg-surface-800`) | — | `panel.component.ts:68` |
| Collapsed | Body hidden via the `hidden` attribute; header chevron rotated `-rotate-90` | `panel.component.ts:49,79` |
| Hover | Only meaningful when `toggleable` — header gets `cursor-pointer`, no explicit hover background found | `panel.component.ts:75` |
| Focus | Native focus ring on the toggle `<button medButton>` (inherits Button's focus-visible ring) | — |
| Active | N/A — no pressed-state styling beyond native button press | — |
| Disabled | Not implemented — Panel has no `disabled` input | — |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Toggle button carries `aria-expanded` (inverse of `collapsed()`), `aria-controls` pointing at the body's `id`, and `aria-label` switching between `expandLabel`/`collapseLabel` (`panel.component.ts:41-43`). Confirmed by spec: `panel.component.spec.ts` — `'sets aria-expanded and aria-controls correctly on the toggle button'` directly asserts `aria-expanded="true"`/`aria-controls` equal to the content `id` initially, then `aria-expanded="false"` after a click; `'uses custom expand/collapse labels'` asserts `aria-label` reads the collapse label while expanded and swaps to the expand label after collapsing.
- **Keyboard navigation:** The toggle is a real `<button medButton>` — native Enter/Space activation dispatches a real `click` that bubbles to the header's own `(click)` handler, so keyboard, mouse, and touch are all covered by one handler without risk of a double-toggle (`panel.component.ts:15-17,31`). Confirmed by spec: `'the toggle button click toggles exactly once, not twice (no double bubble)'` is a direct regression test for this — it clicks only the inner button and asserts content ends up hidden (single toggle, not two canceling out); `'clicking the header toggles collapsed when toggleable'` and `'clicking the header does nothing when not toggleable'` confirm the click-anywhere-in-header behavior is gated correctly by `toggleable`. No test dispatches a raw `KeyboardEvent` (Enter/Space) directly — the "native button activation" claim relies on browser/jsdom `<button>` semantics rather than an explicit keydown assertion [not covered by tests, though a very low-risk gap given real `<button>` semantics].
- **Screen reader:** `aria-expanded`/`aria-controls`/dynamic `aria-label` give a screen reader the full expand/collapse state; the body's `id` is always present (`contentId`, `panel.component.ts:64`) whether or not it's currently hidden — confirmed by the spec's `content()` helper, which locates the body via `[id^="med-panel-content-"]` regardless of collapsed state.

**A11y verdict:** Covered — `aria-expanded`, `aria-controls`, and the dynamic `aria-label` swap are all directly asserted by the spec, including a dedicated regression test guarding against the header/button click double-bubbling into two toggles. The only unverified detail is an explicit keydown (Enter/Space) test, which is low-risk since the toggle is a real native `<button>`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `toggleable` + `[(collapsed)]` for genuinely optional/secondary content sections; two-way binding is directly spec-verified (`'collapsed supports two-way binding via [(collapsed)]'`) | Don't expect a collapse animation — it's an instant `hidden`-attribute toggle by design in v1 |
| Rely on clicking anywhere in the header (not just the chevron) when `toggleable` — confirmed by spec (`'clicking the header toggles collapsed when toggleable'`) and guarded against double-toggling by a dedicated regression test | Don't add your own click handler on the header — it already toggles as a whole, and doing so risks re-introducing the double-bubble bug the spec explicitly guards against |
| Trust that a non-`toggleable` panel's header is inert — confirmed by spec (`'clicking the header does nothing when not toggleable'`) | — |

### Code example (Angular)
```html
<med-panel header="Billing details" toggleable [(collapsed)]="panelCollapsed">
  <p>Billing content here.</p>
</med-panel>
<med-panel header="Always open (not toggleable)">
  <p>Static content here.</p>
</med-panel>
```
Source: `projects/showcase/src/app/app.html:744-747`

### Source
- `projects/medra/ui/src/lib/panel/panel.component.ts`
