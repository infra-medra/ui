## Component: PanelMenu

### Description
`PanelMenu` (`<med-panel-menu>`) is an always-visible, inline expand/collapse navigation tree, rendered as nested disclosure lists (`PanelMenuNodeComponent`, recursive) rather than cascading flyout overlays. It reuses `TieredMenuItem`'s recursive shape directly rather than a parallel type. Use `PanelMenu` for a persistent sidebar-style navigation tree; use `TieredMenu` for a transient popup menu triggered from a button. `projects/medra/ui/src/lib/panel-menu/panel-menu.component.ts:6-13`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly TieredMenuItem[]` | `[]` | Recursive tree of entries (same `TieredMenuItem` shape as `TieredMenu`: `label`, `icon`, `disabled`, `separator`, `command`, `items`). `projects/medra/ui/src/lib/panel-menu/panel-menu.component.ts:30`, `projects/medra/ui/src/lib/tiered-menu/tiered-menu.types.ts:4-6` |
| `ariaLabel` | `string \| null` | `null` | Label on the root `<ul>`. `projects/medra/ui/src/lib/panel-menu/panel-menu.component.ts:31` |
| `itemSelect` (output) | `EventEmitter<MenuItem>` | — | Emitted (bubbled up from any depth via `PanelMenuNodeComponent`'s `activated` output) when a leaf item is activated. `projects/medra/ui/src/lib/panel-menu/panel-menu.component.ts:24,32` |

`PanelMenuNodeComponent` (internal, one per node) also exposes `item` (`input.required<TieredMenuItem>`) and `level` (`input(0)`, incremented per depth for indentation) — not part of `PanelMenu`'s own public API. `projects/medra/ui/src/lib/panel-menu/panel-menu-node.component.ts:74-75`

### States
| State | Visual | Behavior |
|---|---|---|
| Default (collapsed node) | `chevron-right` icon at rest. | — |
| Expanded | Chevron rotates 90°(`rotate-90 transition-transform`); children render inline in a nested `<ul>`. | `projects/medra/ui/src/lib/panel-menu/panel-menu-node.component.ts:79-90` |
| Hover | `hover:bg-surface-100` / dark `hover:bg-surface-800` on the row button. | `projects/medra/ui/src/lib/panel-menu/panel-menu-node.component.ts:37,60` |
| Focus | Native `<button>` focus (no custom focus ring styling observed beyond the browser default / global focus tokens). | — |
| Disabled | `[disabled]` on the native `<button>`; `disabled:pointer-events-none disabled:opacity-(--opacity-disabled)`; toggling/activating is a no-op. | `projects/medra/ui/src/lib/panel-menu/panel-menu-node.component.ts:35,59,87-98` |
| Separator | Renders `<li role="separator">`, indented to match its level. | `projects/medra/ui/src/lib/panel-menu/panel-menu-node.component.ts:29-30` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Deliberately **not** a full ARIA "Tree View" (`role="tree"`/`treeitem`) — plain native `<button aria-expanded>` disclosure semantics instead, reasoned as "navigation menu of links/actions" rather than a selection-model tree. Separator rows get `role="separator"`. `projects/medra/ui/src/lib/panel-menu/panel-menu-node.component.ts:13-21,29-30,36`. `aria-expanded` toggling and the `role="separator"` row are both spec-verified (see below), not just source review.
- **Keyboard navigation — resolved 2026-08-19:** No custom `(keydown)` handler exists anywhere in `PanelMenuNodeComponent` — expand/collapse and leaf activation are wired only to `(click)` (`panel-menu-node.component.ts:39,62`), so keyboard support is entirely whatever the native `<button>` element provides for free (Tab reaches every node in document order; Enter/Space triggers a `click` per the HTML spec). Enter and Space activation of the disclosure toggle are now directly exercised: `panel-menu.component.spec.ts — 'Enter activates the disclosure toggle (expands a collapsed parent)'`, `'Space activates the disclosure toggle (collapses an expanded parent)'`, `'a disabled parent toggle ignores Enter/Space activation, same as a disabled native button would'`. Because jsdom doesn't implement a native `<button>`'s own Enter/Space-triggers-click "activation behavior" the way a real browser does, each test dispatches the `keydown` a keyboard user sends and then the `click` a real browser would synthesize in response, documented inline in the spec — this still exercises the component's own `(click)` handler and its `disabled` guard, which is exactly what keyboard activation of a native button reduces to. There is no Arrow-key roving focus (confirmed absent, not just undocumented) — by design, since this is disclosure semantics, not a `role="tree"` widget.
- **Screen reader:** `aria-expanded` on parent-node buttons reflects expand state — verified by `panel-menu.component.spec.ts — 'clicking a parent item expands it, revealing its children'` (asserts `aria-expanded` becomes `'true'`) and implicitly by `'clicking an expanded parent again collapses it'`. `ariaLabel` labels the root `<ul>` — verified by `panel-menu.component.spec.ts — 'sets aria-label when provided'`. The `role="separator"` row is verified by `panel-menu.component.spec.ts — 'renders a separator between children'`. Disabled leaf items are inert (`disabled` attribute on the native `<button>`, so removed from the Tab order by the browser and unreachable via Enter/Space) — verified by `panel-menu.component.spec.ts — 'a disabled leaf item never activates'`.

**A11y verdict:** Covered — **resolved 2026-08-19**: the ARIA disclosure state (`aria-expanded`, `role="separator"`, `aria-label`, native `disabled`) was already solidly spec-verified, and keyboard activation (Enter/Space toggling the disclosure) is now directly exercised too — see the Keyboard navigation section above for the specific test names and the jsdom caveat behind how they dispatch events.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `PanelMenu` for a persistent sidebar/tree navigation, `TieredMenu` for a transient popup — they share the same `TieredMenuItem` data shape so switching between them needs no data reshaping. | Don't expect ARIA Tree View arrow-key roving focus — native Tab/Enter/Space only, and even that specific combination isn't exercised by any test (`panel-menu.component.spec.ts` only simulates `.click()`). |
| Use `separator: true` nodes to group related entries at any depth. | Don't expect a `separator` item's other fields (`label`, `icon`, etc.) to render — they are ignored. |
| Read `aria-expanded` off a parent button to drive any custom styling — it's the only state signal exposed and is spec-verified to flip on toggle (`panel-menu.component.spec.ts — 'clicking a parent item expands it, revealing its children'`). | Don't rely on a `disabled` node ever emitting `itemSelect` or calling `command()` — both are proven no-ops (`panel-menu.component.spec.ts — 'a disabled leaf item never activates'`). |

### Code example (Angular)
```html
<med-panel-menu [items]="panelMenuItems" ariaLabel="Sidebar navigation" (itemSelect)="panelMenuLog.set('Selected: ' + $event.label)" class="max-w-xs" />
```

### Source
- `projects/medra/ui/src/lib/panel-menu/panel-menu.component.ts`
- `projects/medra/ui/src/lib/panel-menu/panel-menu-node.component.ts`
- Shared model: `projects/medra/ui/src/lib/tiered-menu/tiered-menu.types.ts`
- Usage: `projects/showcase/src/app/app.html:931-935`
