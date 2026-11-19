## Component: TabMenu

### Description
`TabMenu` (`<med-tab-menu>`) is a pure-navigation tab bar: visually and keyboard-wise identical to `Tabs`' roving-tabindex "automatic activation" model, but driven by `MenuItem[]` data (the same shape `Menu`/`SplitButton`/`ContextMenu`/`Dock` share) instead of owning projected `<med-tab>` content panels. It never renders a panel of its own — each item's `command()` is responsible for whatever happens next (routing, swapping some other view). Confirmed as a distinct component from `Tabs` (not a duplicate) per the source comment referencing a 2026-07-02 product decision. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:6-16`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis — one tab-bar visual style, same treatment as `Tabs`. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly MenuItem[]` | `[]` | Flat list of tab entries. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:44` |
| `activeIndex` | `model<number>` | `0` | Two-way bindable (`[(activeIndex)]`) index of the selected tab. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:45` |
| `ariaLabel` | `string` | `'Tab menu'` | Label on the `role="tablist"` container. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:47` |
| `class` | `string` (aliased) | `''` | Extra classes merged onto the tablist container. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:48` |

No `itemSelect`/`activeIndexChange` output is separately declared beyond the `model()`'s implicit `activeIndexChange`; each item's own `command()` callback is the activation hook. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:70-76`

### States
| State | Visual | Behavior |
|---|---|---|
| Default (inactive tab) | `border-transparent text-surface-500`, hover `text-surface-700`. | — |
| Active | `border-brand-500 text-brand-600` (dark: `border-brand-400 text-brand-400`), `aria-selected="true"`. | `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:30,59-67` |
| Hover | `hover:text-surface-700` / dark `hover:text-surface-200`. | `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:65` |
| Focus | Roving `tabIndex` — only the active tab is in the Tab order (`0`), others are `-1`; Arrow keys move real DOM focus. | `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:32` |
| Disabled | `aria-disabled="true"`, `cursor-not-allowed opacity-(--opacity-disabled)`; excluded from Arrow/Home/End navigation targets. | `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:31,66,79-83` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** `role="tablist"` on the container with `aria-label`; each item is a `<button role="tab">` with `aria-selected` and `aria-disabled` as needed. **No `aria-controls`** (unlike `Tabs`, which links each tab to a real panel via `aria-controls`) — expected, since `TabMenu` owns no panel. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:24,29-32`. `role="tablist"`/`role="tab"` and `aria-selected` reflecting the active tab are spec-verified: `tab-menu.component.spec.ts — 'role="tablist" on the container, role="tab" on each item, aria-selected on the active one'`. `[not covered by tests]`: no test asserts the literal `aria-disabled` attribute value on a disabled tab (only its click/keyboard-skip *behavior* is tested — see below).
- **Keyboard navigation:** ArrowRight/ArrowLeft move and immediately activate the next/previous enabled tab, wrapping and skipping disabled tabs — verified by `tab-menu.component.spec.ts — 'ArrowRight moves to the next enabled tab, skipping disabled ones'` and `'ArrowLeft wraps from the first tab to the last enabled one'`; Home/End jump to first/last enabled tab — verified by `tab-menu.component.spec.ts — 'Home/End jump to the first/last enabled tab'`; automatic-activation model (moving focus also switches the active item and calls `command()`, same as `Tabs`) — verified by `tab-menu.component.spec.ts — 'clicking a tab activates it and runs its command'` (click path) and the Arrow-key tests above (`activeIndex` changes on keydown, not just on a separate activation step). Roving `tabIndex` (only the active tab is `0`, all others `-1`) is verified by `tab-menu.component.spec.ts — 'only the active tab has tabindex 0 (roving tabindex)'`. `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts:78-110`
- **Screen reader:** `ariaLabel` defaults to `'Tab menu'`; `aria-selected` communicates current tab, spec-verified as above.

**A11y verdict:** Covered — role/ARIA structure, roving tabindex, and every keyboard path (ArrowRight/Left wrap-and-skip-disabled, Home/End, click activation) are directly exercised by `tab-menu.component.spec.ts`; only the literal `aria-disabled` attribute value is unasserted (its behavioral effect — being skipped by keyboard nav and inert on click — is verified).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `TabMenu` for pure navigation (routing, view-switching) where each item's `command()` drives the effect. | Don't use `TabMenu` when you need Angular to manage panel content for you — it renders no panels; use `Tabs` for that. |
| Bind `[(activeIndex)]` for two-way sync with an external "current view" signal. | Don't expect an `itemSelect` output — react to `activeIndexChange` or each item's own `command()`. |
| Trust ArrowRight/ArrowLeft/Home/End to skip disabled items automatically and wrap at the ends — this exact behavior is spec-verified, not just implemented. | Don't leave disabled items in the DOM expecting them to disappear from the Tab order on their own — they stay rendered (`aria-disabled`) and are simply excluded from Arrow/Home/End targets and no-op on click (`tab-menu.component.spec.ts — 'clicking a disabled tab does nothing'`). |

### Code example (Angular)
```html
<med-tab-menu [items]="tabMenuItems" [(activeIndex)]="tabMenuActiveIndex" class="max-w-lg" />
```

### Source
- `projects/medra/ui/src/lib/tab-menu/tab-menu.component.ts`
- Shared model: `projects/medra/ui/src/lib/menu/menu.types.ts`
- Usage: `projects/showcase/src/app/app.html:1301-1305`
