## Component: Scroll Panel

### Description
A themed replacement for a plain `overflow-auto` div, styled via CSS `scrollbar-*` properties (Firefox) plus `::-webkit-scrollbar` pseudo-elements (Chrome/Safari/Edge) — not a synthetic scrollbar built from draggable divs (`projects/medra/ui/src/lib/scroll-panel/scroll-panel.component.ts:5-15`). The real scrollbar still drives real native scrolling (wheel, touch, keyboard, drag), so there's no position/momentum sync to get wrong. **Scope cut for v1**: no custom draggable scrollbar thumb layered over the native one, unlike some other libraries' ScrollPanel. The host element itself is the scrollable viewport (no separate wrapper div) — this specifically avoids the "static `class` leaks to host" issue documented in the component's own comment (`scroll-panel.component.ts:24-35`).

### Variants
No `variant` input — single visual treatment (themed thin scrollbar).

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `ariaLabel` | `string \| null` | `null` | Accessible name for the scrollable region; only meaningful when not already introduced by an adjacent heading (`scroll-panel.component.ts:49`, doc at `:19-22`) |
| `class` | `string` | `''` | Extra classes on the host/viewport itself — consumer must size it (e.g. `max-h-40`) since there's no sane default height (`scroll-panel.component.ts:50`) |

### States
N/A for most interactive states — ScrollPanel is a scroll container, not a discrete-action control.

| State | Visual | Behavior |
|---|---|---|
| Default | Thin themed scrollbar (`scrollbar-width: thin`, custom `scrollbar-color`) (`scroll-panel.component.ts:55`) | Native scroll (wheel/touch/drag) |
| Focus | No explicit `focus-visible` ring class found | `tabindex="0"` makes the viewport keyboard-focusable so arrow keys can scroll it (WCAG 2.1.1 compliance, doc at `scroll-panel.component.ts:17-22`) |
| Hover | `[&::-webkit-scrollbar-thumb]` themed thumb color, no explicit hover-darken rule found | — |
| Disabled | Not implemented — no `disabled` input | — |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** `role="region"`, `[attr.aria-label]="ariaLabel()"` (`scroll-panel.component.ts:43-44`) — directly tested: `scroll-panel.component.spec.ts` — `'renders a keyboard-focusable, scrollable viewport — the host itself, not a nested div'` (asserts `role="region"` and `tabindex="0"` together), `'applies aria-label to the viewport when provided'`, `'omits aria-label when not provided'`.
- **Keyboard navigation:** `tabindex="0"` on the host makes an otherwise non-focusable `overflow-auto` region reachable by keyboard, explicitly called out as a WCAG 2.1.1 fix in the component's doc comment (`scroll-panel.component.ts:17-22`, `:42`) and directly tested (see above). The actual arrow-key-scrolls-the-content behavior itself is native browser behavior once an `overflow-auto` element is focused — not something jsdom can meaningfully assert, so `[not covered by tests]`, but it's a well-established technique (a focusable overflow container natively responds to arrow/Page keys in every browser), not custom logic that could silently regress. No custom `focus-visible` ring class was found on the host, so the focus indicator is whatever the browser's default outline renders — functional, but not styled to match the rest of the design system's `focus-visible:ring-*` pattern.
- **Screen reader:** `ariaLabel` names the region; documented as optional, only needed when the scrollable area isn't already introduced by a preceding heading.

**A11y verdict:** Covered — `role="region"`, keyboard-focusability (`tabindex="0"`), and `aria-label` presence/absence are all directly tested; the only untested piece (native arrow-key scroll-on-focus) is standard browser behavior, not custom code the library could break.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Size the panel via `class` (e.g. `max-h-40`) — there is no default height | Expecting ScrollPanel to have an intrinsic height/width |
| Add `ariaLabel` when no heading already introduces the scrollable content | Omitting `ariaLabel` on a scroll region with no other accessible context |
| Rely on the static `class="..."` attribute form for sizing (as the component's own spec does) | Expecting a nested wrapper div to exist for styling — the host itself is the scrollable viewport (`scroll-panel.component.spec.ts` — `'merges a consumer class (a real static attribute, as every consumer actually writes it) onto the host, with no separate wrapper div for it to disagree with'`) |

### Code example (Angular)
```html
<med-scroll-panel ariaLabel="Changelog" class="max-w-sm max-h-40 rounded-lg border border-surface-200 p-3 dark:border-surface-700">
  ...
</med-scroll-panel>
```
(from `projects/showcase/src/app/app.html:1098-1104`)

### Source
- `projects/medra/ui/src/lib/scroll-panel/scroll-panel.component.ts`
