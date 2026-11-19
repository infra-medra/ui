## Component: Dock

### Description
`Dock` (`<med-dock>`) is a macOS-style row of icon launchers that magnify near the pointer, reusing `MenuItem` (same `label`/`icon`/`command`/`disabled` shape as `Menu`/`SplitButton`/`ContextMenu`) rather than a parallel `DockItem` type. Magnification is index-distance-based (a small discrete falloff table keyed on `|hoveredIndex - itemIndex|`), not true pixel-distance/Gaussian — a deliberate simplification that needs no `getBoundingClientRect()` calls or a `pointermove` listener. The host element itself is the visible dock pill (no wrapper `<div>`). `projects/medra/ui/src/lib/dock/dock.component.ts:7-19,21-53`

### Variants
| Variant | When to use |
|---|---|
| `position="bottom"` (default) | Dock sits at the bottom of the screen; items scale with `origin-bottom`. |
| `position="top"` | Dock sits at the top; items scale with `origin-top`. |

Note: horizontal orientation only for v1 — no vertical (`left`/`right`) dock. `projects/medra/ui/src/lib/dock/dock.component.ts:41-46,80,100`

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly MenuItem[]` | `[]` | Launcher entries. `projects/medra/ui/src/lib/dock/dock.component.ts:79` |
| `position` | `'bottom' \| 'top'` | `'bottom'` | Which screen edge the dock sits against; flips the magnify transform origin. `projects/medra/ui/src/lib/dock/dock.component.ts:80` |
| `ariaLabel` | `string` | `'Dock'` | Label on the host `role="toolbar"`. `projects/medra/ui/src/lib/dock/dock.component.ts:82` |
| `class` | `string` (aliased) | `''` | Extra classes merged onto the host (the host itself is the dock pill). `projects/medra/ui/src/lib/dock/dock.component.ts:83` |

No `itemSelect` output declared; activation runs each item's own `command()` directly. `projects/medra/ui/src/lib/dock/dock.component.ts:113-118`

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Rounded pill (`rounded-2xl`), translucent background (`bg-surface-0/80`), `shadow-overlay-lg`, `backdrop-blur-sm`. | `projects/medra/ui/src/lib/dock/dock.component.ts:87-92` |
| Hover (per item) | Scales up per the falloff table (center-hovered item ×1.5, immediate neighbors ×1.25, next ×1.1, rest ×1); label tooltip appears via `medTooltip`. | `projects/medra/ui/src/lib/dock/dock.component.ts:7-19,68-73,104-107` |
| Focus | `focus-visible:ring` using `--focus-ring-width`/`--focus-ring-offset` tokens. | `projects/medra/ui/src/lib/dock/dock.component.ts:98` |
| Disabled | `[disabled]` on the native `<button>`; `disabled:pointer-events-none disabled:opacity-(--opacity-disabled)`; `command()` is skipped. | `projects/medra/ui/src/lib/dock/dock.component.ts:66,99,113-118` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

**Design-token flag — resolved 2026-08-19:** the magnify transition (150ms, faster than `--transition-duration-base`'s 200ms) now references the named `--transition-duration-fast` token instead of a hardcoded `duration-150` — same visual timing, now traceable instead of a magic number. `projects/medra/ui/src/lib/dock/dock.component.ts`

### Accessibility
- **Role/ARIA:** Host has `role="toolbar"` with `aria-label`; each launcher button gets `aria-label` from the item's `label`. Confirmed by `dock.component.spec.ts — 'renders one button per item, labeled for accessibility from item.label'` and `'role="toolbar" on the container'`. `projects/medra/ui/src/lib/dock/dock.component.ts:59,67`
- **Keyboard navigation — resolved 2026-08-19:** `role="toolbar"` now implements the ARIA APG roving-tabindex pattern: one item is the toolbar's single Tab stop at a time, Arrow keys move (and re-magnify) between items, Home/End jump to the first/last enabled item, and a disabled item is skipped over rather than being a dead stop. Confirmed by `dock.component.spec.ts` — `'roving tabindex: only one item is in the Tab order at a time...'`, `'ArrowRight moves the roving tab stop to (and focuses) the next enabled item, skipping a disabled one'`, `'ArrowLeft from the first item wraps around to the last enabled item'`, `'Home/End jump the roving tab stop to the first/last enabled item'`. `projects/medra/ui/src/lib/dock/dock.component.ts:141-194`
- **The signature magnify effect is pointer-only, not keyboard-equivalent:** the scale transform is driven solely by `(pointerenter)="hoveredIndex.set(i)"` / `(pointerleave)` — there is no `(focus)`/`(blur)` handler setting `hoveredIndex`, so Tabbing to a dock item does not trigger the same magnify feedback a mouse hover does; keyboard users get only the `focus-visible` ring. Every magnify/reset test in `dock.component.spec.ts` (`'hovering an item scales it up...'`, `'leaving the dock resets every item back to scale(1)'`) dispatches `pointerenter`/`pointerleave`, never a focus event, which is consistent with this being pointer-only by design rather than an oversight in the tests. `projects/medra/ui/src/lib/dock/dock.component.ts:70,109-111`
- **Disabled items use native `disabled`, not just visual dimming:** confirmed by `dock.component.spec.ts — 'a disabled item is a real disabled <button> and never runs its command'`, so a disabled launcher is correctly removed from the Tab order and unclickable/unfocusable by assistive tech, not merely styled. `projects/medra/ui/src/lib/dock/dock.component.ts:66,113-118`
- **Screen reader:** Each item's hover-revealed label reuses `TooltipDirective` (`medTooltip`) for the same accessible name shown visually, plus `aria-label` on the button itself — the `aria-label` (not the tooltip) is what a screen reader actually announces, since the tooltip is a visual/pointer affordance layered on top. `projects/medra/ui/src/lib/dock/dock.component.ts:67-69`. `[not covered by tests]` — no spec asserts on the rendered tooltip text or its `tooltipDisabled` state; only `aria-label` is exercised.

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: each item button updates the shared `hoveredIndex` on `(focus)` (and clears it on `(blur)`), the same signal pointer-hover already drives, so Tab-focusing or Arrow-navigating to an item magnifies it identically to a pointer hover; directly tested by `dock.component.spec.ts` — `'keyboard focus magnifies an item the same way pointer hover does'`, `'blurring an item resets every item back to scale(1)'`. The toolbar now also implements roving tabindex (single Tab stop, Arrow/Home/End move focus, disabled items skipped) — the product decision (does Dock adopt the ARIA APG toolbar model, changing its Tab-order semantics from "every item tabbable" to "one tab stop, Arrow keys roving") was made in favor of the standard pattern; see the Keyboard navigation section above for the tests.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Give every item an `icon` and a `label` — the label drives both the tooltip and `aria-label`. | Don't expect vertical orientation — only `top`/`bottom` (horizontal) positions exist. |
| Use `Dock` for a small set of icon-only launcher actions. | Don't expect every item to be individually Tab-reachable — the toolbar uses roving tabindex, so Tab lands on one item and Arrow keys move (and re-magnify) between the rest. |
| Set `item.disabled` (not a custom CSS class) to remove a launcher from interaction — it becomes a real `disabled` `<button>`, verified by `dock.component.spec.ts — 'a disabled item is a real disabled <button> and never runs its command'`. | Don't expect the magnify/hover effect to give keyboard users the same feedback mouse users get — it's wired to `pointerenter`/`pointerleave` only, with no focus-driven equivalent (`dock.component.ts:70,109-111`). |

### Code example (Angular)
```html
<div class="flex justify-center rounded-lg bg-surface-100 p-8 dark:bg-surface-900">
  <med-dock [items]="dockItems" />
</div>
```

### Source
- `projects/medra/ui/src/lib/dock/dock.component.ts`
- Shared model: `projects/medra/ui/src/lib/menu/menu.types.ts`
- Usage: `projects/showcase/src/app/app.html:1232-1238`
