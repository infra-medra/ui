## Component: ContextMenu

### Description
`ContextMenu` (`[medContextMenu]`) is an **attribute directive**, not a component — applied to any host element (`[medContextMenu]="items"`) to show a menu on the browser's native `contextmenu` (right-click) event. It reuses `MenuPanelComponent`/`openMenuPanel()` unchanged (same shared internals as `Menu`/`Menubar`), with the only addition being that `OverlayService.openConnected()` accepts a bare viewport point (cursor position) as its origin instead of an element. `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:23-33`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis — reuses `MenuPanelComponent`'s panel styling. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `medContextMenu` | `readonly MenuItem[]` | `[]` | The menu items to show; the directive's own selector doubles as the input name. `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:58` |
| `contextMenuDisabled` | `boolean` (`booleanAttribute`) | `false` | When `true` (or `items` is empty), the native browser context menu is left alone (no `preventDefault()`). `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:59,66-68` |
| `itemSelect` (output) | `EventEmitter<MenuItem>` | — | Emitted when an item is activated; closes the menu. `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:60,75-78` |

Public method: `close()`. `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:86-88`

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Nothing rendered until right-click. | — |
| Open | Panel opens flush at the cursor (`{x: event.clientX, y: event.clientY}` origin), below-then-above fallback only (no left/right split, since the origin is a zero-width point). | `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:9-21,72` |
| Re-trigger | Right-clicking again (same element or elsewhere) always closes whatever instance is open and opens a fresh one at the new cursor position — unlike `Menu`'s toggle-on-click, a second right-click is never treated as "close the same activation." | `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:39-45,70-71` |
| Disabled | `contextMenuDisabled` or empty `items` — native browser context menu shows through untouched. | `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts:66-68` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Inherits `MenuPanelComponent`'s `role="menu"`/`role="menuitem"`/`aria-disabled`/`aria-activedescendant` — see `menu.md`. The panel opens and the native browser context menu is suppressed via `event.preventDefault()`, both verified together (`context-menu.directive.spec.ts — 'opens the panel on right-click and suppresses the native context menu'`).
- **Keyboard navigation:** Same as `Menu`'s panel once open (ArrowUp/Down, Home/End, Enter/Space, Tab-to-close); an Arrow-then-Enter selection path is verified end-to-end, including that it calls `command()`, emits `itemSelect`, and closes the panel (`context-menu.directive.spec.ts — 'selecting an item calls its command(), emits itemSelect, and closes the panel'`). Escape closes the panel, handled centrally by `OverlayService` and confirmed directly (`context-menu.directive.spec.ts — 'closes on Escape'`). **No keyboard *trigger* for the context menu itself** — it only opens via the `contextmenu` mouse/touch event (`[to confirm]` whether a keyboard-accessible open path, e.g. the "Menu" key or Shift+F10, is supported by the underlying browser event and thus works for free); no spec exercises a keyboard-dispatched `contextmenu` event, so this is genuinely unverified either way. Re-triggering is verified to be idempotent — right-clicking again (even at a different point) always closes the previous instance and leaves exactly one panel open, never two stacked (`context-menu.directive.spec.ts — 'right-clicking again closes the previous instance and opens exactly one fresh panel'`).
- **Screen reader:** No `aria-label` provided by the directive itself on the host element; relies on the host's own accessible name/content. `contextMenuDisabled` and an empty `items` array both leave the native context menu (and its own accessible affordances) intact rather than replacing it with an empty/broken custom one, verified for both cases (`context-menu.directive.spec.ts — 'does nothing (native menu allowed through) when there are no items'`, `'does nothing when contextMenuDisabled is true'`).

**A11y verdict:** Covered — **resolved 2026-08-19.** The directive now listens for `(keydown)` directly and opens on the `ContextMenu` key or Shift+F10 — the two conventional keyboard triggers — anchored to the host element's own position (no cursor coordinates exist for a keyboard trigger, unlike the mouse path). No longer depends on the host being focusable or on browser-synthesized `contextmenu` events. Directly tested: `context-menu.directive.spec.ts` — `'opens the panel on the ContextMenu key'`, `'opens the panel on Shift+F10'`, `'plain F10 (no Shift) does not open the panel'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Apply `[medContextMenu]` directly on the element that should show a right-click menu (a table row, an image, a whole panel). | Don't rely on `medContextMenu` alone as the only way to reach these commands — right-click has no reliable keyboard-only equivalent; provide an alternative trigger (e.g. a visible "..." button that calls the same `MenuItem[]` through `Menu`) for full keyboard/AT support. |
| Set `contextMenuDisabled` to fall back to the native browser menu when there's nothing useful to show. | Don't pass an empty `items` array expecting the custom menu to open — it silently falls back to the native menu instead (verified: `context-menu.directive.spec.ts — 'does nothing (native menu allowed through) when there are no items'`). |
| Trust that a second right-click (anywhere) always leaves exactly one panel open, never a stacked duplicate — verified in `context-menu.directive.spec.ts — 'right-clicking again closes the previous instance and opens exactly one fresh panel'`. | Don't add your own outside-click or duplicate-instance guarding logic — the directive already closes any prior instance itself before opening the new one (`context-menu.directive.ts:70-71`). |

### Code example (Angular)
```html
<div
  class="flex h-32 w-full max-w-sm items-center justify-center rounded-lg border border-dashed"
  [medContextMenu]="contextMenuItems"
  (itemSelect)="contextMenuLog.set($event.label + ' clicked')"
>
  Right-click this area
</div>
```

### Source
- `projects/medra/ui/src/lib/context-menu/context-menu.directive.ts`
- Reused: `projects/medra/ui/src/lib/menu/menu-panel.component.ts`
- Usage: `projects/showcase/src/app/app.html:867-877`
