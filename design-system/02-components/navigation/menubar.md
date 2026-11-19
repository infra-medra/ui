## Component: Menubar

### Description
`Menubar` (`<med-menubar>`) renders a horizontal row of top-level commands as real, individually focusable `<button>` elements; entries with `items` open a one-level-deep dropdown reusing the same `MenuPanelComponent` shared with `Menu` and `ContextMenu`. It is a deliberately separate component from `MegaMenu` (which lays a dropdown out as side-by-side columns) and from `TieredMenu` (which nests arbitrarily deep). `projects/medra/ui/src/lib/menubar/menubar.component.ts:11-22`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis. Top-level buttons always render with `variant="text" severity="secondary" size="sm"` (via `ButtonDirective`). | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly MenubarItem[]` | `[]` | Top-level entries; `MenubarItem extends MenuItem` with an optional `items: readonly MenuItem[]` for its dropdown. `projects/medra/ui/src/lib/menubar/menubar.component.ts:65`, `projects/medra/ui/src/lib/menubar/menubar.types.ts:9-11` |
| `ariaLabel` | `string` | `'Menu bar'` | Label on the wrapping `<nav>`. `projects/medra/ui/src/lib/menubar/menubar.component.ts:67` |
| `itemSelect` (output) | `EventEmitter<MenuItem>` | — | Emitted when a leaf item (top-level with no `items`, or a dropdown row) is activated. `projects/medra/ui/src/lib/menubar/menubar.component.ts:68,77-93,104-107` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Row of text-variant buttons. | — |
| Hover/Focus | Native `ButtonDirective` hover/focus styling on each `<button>`. | `projects/medra/ui/src/lib/menubar/menubar.component.ts:35-54` |
| Open (dropdown) | `aria-expanded="true"` on the top-level button; `MenuPanelComponent` opens below it. | `projects/medra/ui/src/lib/menubar/menubar.component.ts:44,99-114` |
| Disabled (per item) | Native `[disabled]` on the top-level `<button>`. | `projects/medra/ui/src/lib/menubar/menubar.component.ts:42` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Wrapping `<nav [attr.aria-label]>`; each top-level entry with children gets `aria-haspopup="menu"` and `aria-expanded`, both absent for a childless item (verified: `menubar.component.spec.ts — 'a top-level item without children has no aria-haspopup/aria-expanded'`); `aria-expanded` flips to `"true"` when its dropdown opens and back to `"false"` when it closes, including when closed indirectly by opening a sibling dropdown or clicking a childless item (verified: `menubar.component.spec.ts — 'clicking an item with children opens its dropdown instead of calling a command'`, `'clicking the same dropdown trigger again closes it'`, `'opening a different dropdown closes the previously open one'`). The open dropdown itself reuses `MenuPanelComponent`'s `role="menu"`/`role="menuitem"` semantics. `projects/medra/ui/src/lib/menubar/menubar.component.ts:31,43-44`
- **Keyboard navigation — resolved 2026-08-19:** **No ArrowLeft/ArrowRight roving focus between top-level buttons** — explicitly scoped out for v1; each top-level entry is a real, individually focusable `<button>`, so plain Tab order reaches all of them. Arrow-key navigation only applies once a dropdown is open (inherited unchanged from `MenuPanelComponent`: ArrowUp/Down, Home/End, Enter/Space, Tab-to-close); a dropdown item's Enter-to-activate is verified end-to-end (`menubar.component.spec.ts — 'selecting a dropdown item calls its command, emits itemSelect, and closes the dropdown'`), and a disabled top-level item is confirmed to never open a submenu or fire a command (`menubar.component.spec.ts — 'never opens a submenu or calls a command for a disabled top-level item'`). `projects/medra/ui/src/lib/menubar/menubar.component.ts:16-22`. Escape-to-close for an open Menubar dropdown — same shared `OverlayService` wiring (`closeOnEscape` default `true`) that Menu and MegaMenu already rely on — is now directly asserted too: `menubar.component.spec.ts — 'closes on Escape'`.
- **Screen reader — resolved 2026-08-19:** `ariaLabel` on `<nav>` defaults to `'Menu bar'`; no per-item `aria-label` beyond the item's own visible `label` text. The default value and a custom override are now both asserted: `menubar.component.spec.ts — 'defaults the <nav> aria-label to "Menu bar" and honors a custom ariaLabel input'`.

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: `aria-haspopup`/`aria-expanded` state transitions and dropdown keyboard activation were already directly tested; Escape-to-close and the `<nav>` `aria-label` value are now also asserted in `menubar.component.spec.ts` — see the Keyboard navigation and Screen reader sections above for the test names. ArrowLeft/ArrowRight roving focus remains a documented, intentional v1 scope reduction, not an accessibility gap.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `Menubar` for a top-level application command bar with at most one dropdown level per entry. | Don't expect nested submenus inside a Menubar dropdown — `MenubarItem.items` is capped at one level; use `TieredMenu` or `MegaMenu` for deeper/wider needs. |
| Rely on Tab order to move between top-level entries. | Don't assume ArrowLeft/ArrowRight roving focus across top-level buttons — it is not implemented (documented scope reduction). |
| Rely on opening one dropdown to automatically close any other open one — verified in `menubar.component.spec.ts — 'opening a different dropdown closes the previously open one'`, including when the newly clicked item itself has no children. | Don't assume Escape-to-close on an open Menubar dropdown is regression-tested — it is not asserted by `menubar.component.spec.ts` (contrast with `Menu`'s and `MegaMenu`'s own specs, which do test it); verify manually if you touch the shared overlay wiring. |

### Code example (Angular)
```html
<med-menubar [items]="menubarItems" (itemSelect)="menubarLog.set('Selected: ' + $event.label)" />
```

### Source
- `projects/medra/ui/src/lib/menubar/menubar.component.ts`
- `projects/medra/ui/src/lib/menubar/menubar.types.ts`
- Reused: `projects/medra/ui/src/lib/menu/menu-panel.component.ts`
- Usage: `projects/showcase/src/app/app.html:946-950`
