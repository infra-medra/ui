## Component: BlockUI

### Description
`BlockUiComponent` (`med-block-ui`) wraps arbitrary content (`<med-block-ui [blocked]="saving()">...form...</med-block-ui>`) and overlays a mask + spinner directly on top of it while `blocked` is `true`. It is scoped to its own box, not a viewport-level `OverlayService` overlay — meant to stay put over its own content as that content scrolls, unlike Dialog/Drawer/Popover, which need to escape into a top-level stacking context (`projects/medra/ui/src/lib/block-ui/block-ui.component.ts:7-13`).

The blocked content sits in its own wrapper `<div>` with the native `[attr.inert]` attribute toggled on/off, not a manual focus trap — `inert` already removes the whole subtree from focus, pointer interaction, and assistive-tech exposure in one step. The mask itself is a *sibling* of that wrapper, not nested inside it, so `inert` never accidentally disables the mask's own spinner/custom template (`block-ui.component.ts:15-21`).

The mask's content defaults to a `ProgressSpinner`, or can be replaced entirely with a projected `<ng-template>` via `NgTemplateOutlet` — the same single-optional-template convention `DataViewComponent` established elsewhere in the library (`block-ui.component.ts:23-26`).

### Variants
| Variant | When to use |
|---|---|
| Default mask (no template projected) | Shows a `ProgressSpinner` centered over the blocked content |
| Custom mask (`<ng-template>` projected as content child) | Replace the spinner with custom blocked-state UI |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `blocked` | `boolean` (transform `booleanAttribute`) | `false` | Toggles the mask + `inert` on the wrapped content — `block-ui.component.ts:50` |
| `blockedLabel` | `string` | `'Loading'` | `aria-label` on the mask — `block-ui.component.ts:52` |
| `class` | `string` (aliased) | `''` | `block-ui.component.ts:53` |

Content child: an optional `<ng-template>` (via `contentChild(TemplateRef)`, `block-ui.component.ts:55`) replacing the default spinner.

### States
| State | Visual | Behavior |
|---|---|---|
| Default (not blocked) | Content renders normally, no mask | — |
| Blocked | Semi-transparent mask (`bg-surface-0/70 backdrop-blur-[1px]`, dark: `bg-surface-900/70`) over the content, default `ProgressSpinner` or custom template centered on top | `block-ui.component.ts:39,58-59` |
| Hover / Focus / Active | N/A on the BlockUI wrapper itself — applies to whatever content is projected | — |
| Disabled | Not a distinct input — `blocked` serves this role by making the content non-interactive via `inert` | `block-ui.component.ts:35` |
| Loading | The mask itself communicates "loading" (default spinner) | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Mask has `role="status"`, `aria-live="polite"`, `aria-label` (`blockedLabel`) — `block-ui.component.ts:39`. The mask's presence/absence is directly tested via its `[role="status"]` selector (`block-ui.component.spec.ts` — `'shows a mask with a default spinner when blocked'`, `'renders projected content and no mask when not blocked'`), and `aria-label` is directly tested (`'marks the mask aria-label from blockedLabel'`). The `aria-live="polite"` attribute's *value* is not separately asserted via `getAttribute()` — the tests rely on `role="status"` as the query selector rather than checking `aria-live` itself `[not covered by tests]`, a narrower gap than Toast/Message's (here the selector at least implicitly depends on `role` being present and correct).
- **Keyboard navigation:** The blocked content wrapper gets native `inert` when `blocked` is true, which removes it from the tab order and blocks all interaction in one step — no manual `tabindex="-1"` sweeping needed (`block-ui.component.ts:35`). This is **directly and explicitly tested**, unlike the focus-trap gap found elsewhere in this batch: `block-ui.component.spec.ts` — `'makes the blocked content inert while blocked'` and `'leaves the content interactive when not blocked'` both assert `contentWrapper.hasAttribute('inert')` directly. Since native `inert` (not a CDK focus trap) is what's doing the work here, BlockUI does not inherit the untested-focus-trap gap documented in `overlay.md` — it isn't built on `OverlayService` at all.
- **Screen reader:** `inert` also removes the blocked subtree from the accessibility tree entirely while blocked, and the mask's `aria-live="polite"` + `aria-label` announces the blocked/loading state.

**A11y verdict:** Covered — `inert` toggling (the mechanism that actually makes this component accessible) is directly tested in both directions, the mask's role and label are tested, and the custom-template escape hatch is also tested (`'renders a projected <ng-template> instead of the default spinner when provided'`); only the literal `aria-live` attribute value goes unasserted, a minor gap.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use for scoping a "saving..."/"loading..." block to a specific section (form, card, panel) that should stay in place while the page continues | Don't reach for it for full-page or viewport-level blocking overlays — that's what `OverlayService`-based components (Dialog, Drawer) are for |
| Project a custom `<ng-template>` when the default spinner isn't descriptive enough | Don't add your own manual `tabindex`/focus-trap logic on the projected content — `inert` already covers it, and this is directly tested (`block-ui.component.spec.ts` — `'makes the blocked content inert while blocked'`) |

### Code example (Angular)
```html
<med-block-ui [blocked]="blockUiBlocked()" class="max-w-sm rounded-lg border border-surface-200 p-4 dark:border-surface-700">
  <p>Content that gets blocked goes here.</p>
</med-block-ui>
```
Source: `projects/showcase/src/app/app.html:1125-1131`

### Source
- `projects/medra/ui/src/lib/block-ui/block-ui.component.ts`
- `projects/medra/ui/src/lib/progress-spinner/progress-spinner.component.ts` (default mask content)
