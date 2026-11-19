## Component: MegaMenu

### Description
`MegaMenu` (`<med-mega-menu>`) is visually the same top-level row as `Menubar`, but a triggered entry opens its panel as side-by-side columns (`MegaMenuItem.columns`, each a flat `MegaMenuColumn { header?, items }`) rather than Menubar's single flat dropdown list. It is a deliberately separate component (not a generalization of `Menubar`) to avoid a behavior change to the already-shipped, tested `Menubar`/`MenuPanelComponent`. `projects/medra/ui/src/lib/mega-menu/mega-menu.component.ts:12-21`, `projects/medra/ui/src/lib/mega-menu/mega-menu.types.ts:3-12`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis. Top-level buttons render with `variant="text" severity="secondary" size="sm"`. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly MegaMenuItem[]` | `[]` | Top-level entries; `MegaMenuItem extends MenuItem` with an optional `columns: readonly MegaMenuColumn[]`. `projects/medra/ui/src/lib/mega-menu/mega-menu.component.ts:71`, `projects/medra/ui/src/lib/mega-menu/mega-menu.types.ts:4-11` |
| `ariaLabel` | `string` | `'Mega menu'` | Label on the wrapping `<nav>`. `projects/medra/ui/src/lib/mega-menu/mega-menu.component.ts:73` |
| `itemSelect` (output) | `EventEmitter<MenuItem>` | — | Emitted when a leaf item (top-level with no columns, or a column row) is activated. `projects/medra/ui/src/lib/mega-menu/mega-menu.component.ts:74,83-99,114-117` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Row of text-variant buttons. | — |
| Open (panel) | `aria-expanded="true"`; panel opens with columns laid out `flex gap-6 p-4`. | `projects/medra/ui/src/lib/mega-menu/mega-menu-panel.component.ts:26-33` |
| Active cell (2D) | Highlighted via `selectOptionVariants({ active })`, tracked as `(activeColumn, activeRow)`, not a single flat index. | `projects/medra/ui/src/lib/mega-menu/mega-menu-panel.component.ts:68-76,89-91` |
| Disabled (per item) | `aria-disabled="true"`, skipped by keyboard/pointer navigation. | `projects/medra/ui/src/lib/mega-menu/mega-menu-panel.component.ts:44,93-109,160-171` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Wrapping `<nav [attr.aria-label]>`; top-level entries with columns get `aria-haspopup="menu"`/`aria-expanded`. Panel root has `role="menu"`; each cell has `role="menuitem"` with `aria-disabled` as needed; `aria-activedescendant` on the panel tracks the active cell. `projects/medra/ui/src/lib/mega-menu/mega-menu.component.ts:49-50`, `projects/medra/ui/src/lib/mega-menu/mega-menu-panel.component.ts:28,43-44,73-76`
- **Keyboard navigation — ArrowLeft/Home/End resolved 2026-08-19:** Genuinely 2D: ArrowUp/ArrowDown move within the current column, wrapping (verified: `mega-menu.component.spec.ts — 'ArrowDown/Up move within the current column, wrapping'`); ArrowRight hops to the neighboring column, landing as close as possible to the same row (verified: `mega-menu.component.spec.ts — 'ArrowRight moves to the neighboring column, landing near the same row'`); ArrowLeft is implemented symmetrically (`mega-menu-panel.component.ts:125-128`) and is now spec-verified too, both the wraparound-from-the-first-column case and the round-trip back to the original column/row (verified: `mega-menu.component.spec.ts — 'ArrowLeft moves to the neighboring column (wrapping from the first), landing near the same row'`, `'ArrowRight then ArrowLeft returns to the original column and row'`); a fully-disabled column is correctly skipped, confirmed via a mixed case where the destination row itself is disabled (verified: `mega-menu.component.spec.ts — 'disabled items are skipped by keyboard navigation and never activate'`). Home/End jump to first/last enabled row in the current column — implemented (`mega-menu-panel.component.ts:129-136`) and now spec-verified (verified: `mega-menu.component.spec.ts — 'Home jumps to the first enabled row, End jumps to the last enabled row, within the current column'`, `'Home returns to the first enabled row after moving away from it'`). Enter/Space activates, verified end-to-end via mouse (pointerdown) and keyboard paths (`mega-menu.component.spec.ts — 'clicking an item calls its command(), emits itemSelect, and closes the panel'`, and the ArrowDown/ArrowRight/ArrowLeft/Home/End tests above which each finish with Enter). Tab emits `closeRequested`; Escape closes the panel, verified (`mega-menu.component.spec.ts — 'closes on Escape'`) — unlike `Menubar`, whose own spec previously had no Escape test (now resolved, see `menubar.md`). No ArrowLeft/ArrowRight roving focus between the *top-level* buttons themselves (same explicit scope reduction as Menubar). `projects/medra/ui/src/lib/mega-menu/mega-menu-panel.component.ts:111-146,183-210`, `projects/medra/ui/src/lib/mega-menu/mega-menu.component.ts:23-28`
- **Screen reader — column-header association resolved 2026-08-20:** each column's `<ul>` now carries `role="group"` with `[attr.aria-labelledby]` pointing at its own header element's `id` (only when a `header` is set) — a screen reader now announces the category name when entering that column's group of items, not just the visible styled text. Verified: `mega-menu.component.spec.ts — 'each column list is a role="group" whose aria-labelledby points at its own header element'` (asserts two distinct group elements, each `aria-labelledby` resolving via `document.getElementById` to the correct header text). `projects/medra/ui/src/lib/mega-menu/mega-menu-panel.component.ts:36-39,89-92`

**A11y verdict:** Covered — **both gaps resolved 2026-08-19/2026-08-20**: the full keyboard navigation model (ArrowDown/Up, ArrowRight, ArrowLeft, Home, End, disabled-cell skipping, Enter activation, Escape-close) and the column-header/list ARIA association (`role="group"` + `aria-labelledby`) are both directly tested — see the Keyboard navigation and Screen reader sections above for test names.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `MegaMenu` when a top-level entry needs multiple side-by-side columns of commands (e.g. a marketing site's product mega-dropdown). | Don't nest a column's items further — `MegaMenuColumn.items` is a flat `MenuItem[]`; use `TieredMenu` for deeper nesting. |
| Give columns a `header` for visual grouping — it's now also programmatically associated with its list via `role="group"`/`aria-labelledby`, confirmed by `mega-menu.component.spec.ts — 'each column list is a role="group" whose aria-labelledby points at its own header element'`. | — |
| Rely on ArrowRight/ArrowLeft/Home/End and disabled-column skipping being regression-tested (`mega-menu.component.spec.ts` covers all four directions plus the disabled case). | — |

### Code example (Angular)
```html
<med-mega-menu [items]="megaMenuItems" (itemSelect)="megaMenuLog.set('Selected: ' + $event.label)" />
```

### Source
- `projects/medra/ui/src/lib/mega-menu/mega-menu.component.ts`
- `projects/medra/ui/src/lib/mega-menu/mega-menu-panel.component.ts`
- `projects/medra/ui/src/lib/mega-menu/mega-menu.types.ts`
- Usage: `projects/showcase/src/app/app.html:925-929`
