## Component: TieredMenu

### Description
`TieredMenu` (`<med-tiered-menu>`) is the same declared-once, imperatively-toggled shape as `Menu` (`<med-tiered-menu #menu [items]="items" /><button (click)="menu.toggle($event.currentTarget)">`), but items can nest arbitrarily deep (`TieredMenuItem.items`), cascading sideways via a recursive `TieredMenuPanelComponent` instead of Menu's flat list or Menubar's one-level dropdown. `projects/medra/ui/src/lib/tiered-menu/tiered-menu.component.ts:10-17`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis — reuses `MENU_PANEL_CLASS`, the same panel styling as `Menu`. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly TieredMenuItem[]` | `[]` | Recursively-nestable entries (`TieredMenuItem extends MenuItem` with optional `items: readonly TieredMenuItem[]`). `projects/medra/ui/src/lib/tiered-menu/tiered-menu.component.ts:30`, `projects/medra/ui/src/lib/tiered-menu/tiered-menu.types.ts:4-6` |
| `itemSelect` (output) | `EventEmitter<MenuItem>` | — | Emitted (bubbled from any nesting depth) when a leaf item is activated; closes the whole tree. `projects/medra/ui/src/lib/tiered-menu/tiered-menu.component.ts:31,59-62` |

Public methods: `toggle(origin)`, `open(origin)`, `close()`, `isOpen` getter — same shape as `Menu`. `projects/medra/ui/src/lib/tiered-menu/tiered-menu.component.ts:35-73`

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Host is `hidden`. | — |
| Open (root panel) | `role="menu"` list, focused on open. | `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts:57-63,118-121` |
| Submenu open | Child panel cascades sideways, flush against the parent item (`end→start`, flipping to `start→end` if it doesn't fit); `aria-haspopup="menu"`/`aria-expanded` on the parent row. | `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts:20-23,74-75` |
| Hover (auto-open submenu) | Hovering a parent row opens its submenu after a 150ms delay; leaving before the delay elapses cancels it. | `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts:157-172` |
| Focus | Roving `aria-activedescendant` per panel level (same as `MenuPanelComponent`), not real per-item DOM focus. | `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts:113-116` |
| Disabled | `aria-disabled="true"`, excluded from navigation/activation. | `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts:73,140-144,157-160` |
| Separator | `role="separator"` row. | `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts:66-67` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA — literal attribute values resolved 2026-08-20:** Each panel level is `role="menu"`; each row `role="menuitem"` with `aria-disabled`, plus `aria-haspopup="menu"`/`aria-expanded` on rows that have children. `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts:59,72-75`. Previously only structural effects (submenu count, row text) were checked; now the literal values are directly asserted too — verified: `tiered-menu.component.spec.ts — 'items carry literal aria-haspopup/aria-expanded/aria-disabled values, updated when a submenu opens'` (a parent row starts `aria-haspopup="menu"`/`aria-expanded="false"`, a disabled leaf carries `aria-disabled="true"` and no `aria-haspopup`, and `aria-expanded` flips to `"true"` once its submenu opens).
- **Keyboard navigation — Home/End/Space resolved 2026-08-19:** ArrowUp/ArrowDown move within the current level — `ArrowDown` path spec-verified (`tiered-menu.component.spec.ts — 'a doubly-nested submenu opens and a selection there also closes everything'`, which uses `ArrowDown` to move active before opening a submenu); ArrowRight opens the active item's submenu and moves focus into it — verified by `tiered-menu.component.spec.ts — 'ArrowRight on a parent item opens its submenu and moves focus into it'`; ArrowLeft collapses back to the parent level only, not the whole tree (does **not** bubble past one level, per ARIA APG submenu pattern) — verified by `tiered-menu.component.spec.ts — 'ArrowLeft in a submenu closes just that submenu, not the whole tree'`; Enter activates a leaf and closes the entire tree — verified by `tiered-menu.component.spec.ts — 'selecting a nested leaf item calls its command(), emits itemSelect once, and closes the entire tree'` and the doubly-nested variant; Tab closes the whole tree (`closeRequested` bubbles all the way up) — verified by `tiered-menu.component.spec.ts — 'Tab closes the entire tree'`. **Escape closes only the deepest open submenu level, not the whole tree** — verified by `tiered-menu.component.spec.ts — 'Escape closes only the deepest open level'`. This is notable because there is **no `Escape` case** in `TieredMenuPanelComponent.onKeydown()`'s switch statement (`tiered-menu-panel.component.ts:174-209` handles `ArrowDown`/`ArrowUp`/`Home`/`End`/`ArrowRight`/`ArrowLeft`/`Enter`/`' '`/`Tab` only) — Escape-to-close is provided generically by `OverlayService.openConnected()`'s `closeOnEscape` option (default `true`, `projects/medra/ui/src/lib/overlay/overlay.service.ts:56-57,335-338`), which closes just the topmost (deepest) overlay in the stack, matching one-level-at-a-time collapse without any tiered-menu-specific code. Home/End (`tiered-menu-panel.component.ts:184-191`) and Space-to-activate (`' '` case, same file, `:200-204`) are now directly exercised: `tiered-menu.component.spec.ts — 'Home/End jump to the first/last enabled item in the panel'` (End correctly skips the disabled "View" item), `'Space on a parent item opens its submenu, same as Enter/ArrowRight'`, `'Space activates a leaf item, same as Enter'`.
- **Screen reader:** `aria-activedescendant` tracks the active row per level; no top-level `aria-label` observed on the root panel itself (relies on the triggering button's accessible name, same as `Menu`).

**A11y verdict:** Covered — **both gaps resolved 2026-08-19/2026-08-20**: the full submenu lifecycle (open/close/nest/collapse), every keyboard path (ArrowRight, ArrowLeft, ArrowDown, Home, End, Enter, Space, Tab, Escape), and the literal ARIA attribute values (`aria-haspopup`, `aria-expanded`, `aria-disabled`) are all now directly spec-verified — see the Role/ARIA and Keyboard navigation sections above for test names.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `TieredMenu` for arbitrarily deep nested command trees triggered from a button. | Don't use it for a persistent, always-visible sidebar tree — use `PanelMenu` (same `TieredMenuItem` data shape) for that instead. |
| Rely on ArrowRight/ArrowLeft to drill into and back out of submenus. | Don't expect ArrowLeft at the root level to do anything — it's explicitly a no-op there (no parent panel to collapse into). |
| Rely on Escape to close only the innermost open submenu, one level at a time — spec-verified (`tiered-menu.component.spec.ts — 'Escape closes only the deepest open level'`), and implemented for free by `OverlayService`'s `closeOnEscape` rather than by any tiered-menu-specific code. | — |
| Rely on Home/End and Space-to-activate being exercised end-to-end (`tiered-menu.component.spec.ts — 'Home/End jump to the first/last enabled item in the panel'`, `'Space on a parent item opens its submenu...'`, `'Space activates a leaf item, same as Enter'`), and on the literal `aria-haspopup`/`aria-expanded`/`aria-disabled` values being asserted, not just their structural effects. | — |

### Code example (Angular)
```html
<button #tieredMenuTrigger medButton type="button" variant="outlined" (click)="tieredMenu.toggle(tieredMenuTrigger)">
  Menu
  <med-icon name="chevron-down" variant="mini" />
</button>
<med-tiered-menu #tieredMenu [items]="tieredMenuItems" (itemSelect)="tieredMenuLog.set('Selected: ' + $event.label)" />
```

### Source
- `projects/medra/ui/src/lib/tiered-menu/tiered-menu.component.ts`
- `projects/medra/ui/src/lib/tiered-menu/tiered-menu-panel.component.ts`
- `projects/medra/ui/src/lib/tiered-menu/tiered-menu.types.ts`
- Usage: `projects/showcase/src/app/app.html:913-923`
