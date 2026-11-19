## Component: Tooltip

### Description
Tooltip is an **attribute directive** (`[medTooltip]`) applied to any host element, not a wrapping component — same reasoning as Button/InputText: it shouldn't change the host's tag or semantics (`projects/medra/ui/src/lib/tooltip/tooltip.directive.ts:31-33`). Shown on `mouseenter`/`focus`, hidden on `mouseleave`/`blur`; a separate tap-driven lifecycle handles touch (real `pointerdown.pointerType` distinguishes touch from mouse, since mobile browsers synthesize `mouseenter`+`click` on tap with no matching `mouseleave`) (`tooltip.directive.ts:40-56`). Content is plain text only, rendered via interpolation in the internal `TooltipPanelComponent` — never `innerHTML` (`tooltip.directive.ts:54-56`).

### Variants
| Variant (`tooltipPosition`) | When to use |
|---|---|
| `top` (default) | Tooltip above the trigger, falls back below if it doesn't fit (`tooltip.directive.ts:10-13`, `:76`) |
| `bottom` | Below the trigger, falls back above (`tooltip.directive.ts:14-17`) |
| `left` | To the left, falls back right (`tooltip.directive.ts:18-21`) |
| `right` | To the right, falls back left (`tooltip.directive.ts:22-25`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `medTooltip` | `string` | `''` | The tooltip text (directive selector doubles as the content input) (`tooltip.directive.ts:75`) |
| `tooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | (`tooltip.directive.ts:76`) |
| `tooltipDisabled` | `boolean` | `false` | Suppresses showing (`tooltip.directive.ts:77`) |
| `showDelay` | `number` | `0` | Milliseconds before showing (`tooltip.directive.ts:78`) |
| `hideDelay` | `number` | `150` | Milliseconds before hiding after `mouseleave`/`blur` (`tooltip.directive.ts:79`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (hidden) | Nothing rendered | — |
| Hover / Focus | `bg-surface-900 dark:bg-surface-700` panel with `shadow-overlay-sm`, `max-w-xs`, `text-xs` (`tooltip-panel.component.ts:14`) shown after `showDelay` | Shown on `mouseenter`/`focus`; hidden after `hideDelay` on `mouseleave`/`blur` (`tooltip.directive.ts:96-115`) |
| Touch (tap) | Same visual panel | Opened via a real `pointerdown` with `pointerType === 'touch'`; closes on tapping the trigger again or anywhere outside (`closeOnOutsideClick: true` for touch), never relying on `mouseleave` (`tooltip.directive.ts:92-137`, `:151-167`) |
| Disabled | Not shown at all | `tooltipDisabled` or empty `medTooltip` text short-circuits `onShowTrigger()` (`tooltip.directive.ts:98-100`) |
| Loading | N/A | — |
| Error | N/A | — |

### Accessibility
- **Role/ARIA:** `role="tooltip"` on the panel (`tooltip-panel.component.ts:12`); the host element gets `[attr.aria-describedby]` pointing at the panel's id while open, `null` otherwise (`tooltip.directive.ts:68`) — directly tested end-to-end by `tooltip.directive.spec.ts` — `'sets aria-describedby on the host only while the tooltip is open'`, which asserts both that the attribute is absent initially, matches the panel's `id` while shown, and is removed again on `mouseleave`.
- **Keyboard navigation:** Shown on `focus`, hidden on `blur` — the same content shown on hover is reachable via keyboard, explicitly for WCAG 1.4.13 (`tooltip.directive.ts:37-39`) — directly tested (`tooltip.directive.spec.ts` — `'shows on focus and hides on blur (keyboard accessibility)'`). No focus trap (`trapFocus: false` — nothing inside is focusable) (`tooltip.directive.ts:155`); `restoreFocus: false` is also set explicitly (`tooltip.directive.ts:165`, with a detailed rationale comment about avoiding a focus-stealing chain reaction) — appropriate here since a tooltip never moves real focus itself, so unlike Dialog/Drawer/Popover there is nothing to restore, and the untested-focus-restoration gap noted elsewhere in this batch (`overlay.md`) doesn't apply to Tooltip.
- **Screen reader:** No `aria-live` region; relies on `aria-describedby` association, which most screen readers announce when the described element receives focus. Content is plain-text-only, directly tested against HTML injection (`tooltip.directive.spec.ts` — `'renders content as plain text, never interpreted as HTML'`).

**A11y verdict:** Covered — `role="tooltip"`, the `aria-describedby` lifecycle, keyboard show/hide via focus/blur, delay timing, disabled/empty-content suppression, and plain-text rendering are all directly asserted by `tooltip.directive.spec.ts` (11 tests); the touch-specific lifecycle (`pointerdown`/`pointerType`) is implemented but not separately exercised by a dedicated touch test `[not covered by tests]`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `medTooltip` only for supplementary text — it's plain-text only, no HTML/markup support | Passing HTML strings expecting them to render — they're interpolated as text, not sanitized/parsed |
| Rely on the built-in focus/blur handling for keyboard accessibility | Assuming a tooltip triggered by `click` alone is keyboard-accessible — this directive intentionally ties visibility to hover/focus, not click |
| Trust the touch (`pointerdown`/tap) lifecycle's design rationale (documented at length in `tooltip.directive.ts:40-56`) | Assuming it's regression-proofed the way the mouse/focus paths are — no test in `tooltip.directive.spec.ts` dispatches a `pointerdown` with `pointerType: 'touch'` |

### Code example (Angular)
```html
<!-- projects/showcase/src/app/app.html:882-886 -->
<button medButton type="button" variant="outlined" medTooltip="Saves your current draft" tooltipPosition="top">Top</button>
<button medButton type="button" variant="outlined" medTooltip="Appears below the button" tooltipPosition="bottom">Bottom</button>
<button medButton type="button" variant="outlined" [medTooltip]="'This one has a longer showDelay'" [showDelay]="500">Delayed (500ms)</button>
```

### Source
- `projects/medra/ui/src/lib/tooltip/tooltip.directive.ts`
- `projects/medra/ui/src/lib/tooltip/tooltip-panel.component.ts`
- `projects/medra/ui/src/lib/overlay/overlay.service.ts` (underlying primitive)
