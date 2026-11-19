## Component: Menu

### Description
`Menu` (`<med-menu>`) is a popup list of commands, declared once in the template and controlled imperatively by whatever trigger opens it (`menu.toggle($event.currentTarget)`) — rather than a directive-pair pattern like `matMenuTriggerFor`. The host itself renders nothing visible (`class: 'hidden'`); only its overlay panel (`MenuPanelComponent`) is shown once opened, via `OverlayService.openConnected()`. Use it for a button-triggered dropdown of flat commands (no nesting). `projects/medra/ui/src/lib/menu/menu.component.ts:8-18`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis — one visual style for the panel (`MENU_PANEL_CLASS`: rounded, bordered, `shadow-overlay-lg`). | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly MenuItem[]` | `[]` | Flat list of menu entries (`label`, `icon`, `disabled`, `separator`, `command`). `projects/medra/ui/src/lib/menu/menu.component.ts:31`, `projects/medra/ui/src/lib/menu/menu.types.ts:1-8` |
| `itemSelect` (output) | `EventEmitter<MenuItem>` | — | Emitted when an enabled, non-separator item is activated (click/Enter/Space); the menu then closes. `projects/medra/ui/src/lib/menu/menu.component.ts:32,56-59` |

Public methods (not `@Input`s, but part of the component's usable API): `toggle(origin: HTMLElement)`, `open(origin: HTMLElement)`, `close()`, and the read-only `isOpen` getter. `projects/medra/ui/src/lib/menu/menu.component.ts:36-69`

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Host is `hidden`; nothing rendered. | — |
| Open | Panel rendered via CDK connected overlay, `role="menu"`, focused on open. | `projects/medra/ui/src/lib/menu/menu-panel.component.ts:64-66,108-111` |
| Hover/pointer-active row | Row highlighted via `selectOptionVariants({ active })` (reused from Select). | `projects/medra/ui/src/lib/menu/menu-panel.component.ts:117-119,128-132` |
| Focus | Keyboard focus stays on the `<ul>` container; the active row is tracked via `aria-activedescendant`, not real DOM focus per item. | `projects/medra/ui/src/lib/menu/menu-panel.component.ts:67,99-106` |
| Disabled (per item) | `aria-disabled="true"`, excluded from keyboard/pointer activation and from Home/End/Arrow navigation targets. | `projects/medra/ui/src/lib/menu/menu-panel.component.ts:77,121-132,178-182` |
| Separator | Renders `<li role="separator">` instead of an interactive row; every other field on that item is ignored. | `projects/medra/ui/src/lib/menu/menu-panel.component.ts:71-72`, `projects/medra/ui/src/lib/menu/menu.types.ts:5-6` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Panel `<ul>` has `role="menu"`; each row has `role="menuitem"`; separators have `role="separator"` and are excluded from the interactive row count (verified: `menu-panel.component.spec.ts — 'renders separators as role="separator", not role="menuitem"'`); `aria-activedescendant` on the list tracks the active row id, starting on the first enabled item (`menu-panel.component.spec.ts — 'starts active on the first enabled item'`); `aria-disabled="true"` on disabled rows. `projects/medra/ui/src/lib/menu/menu-panel.component.ts:64,67,71,76-77`
- **Keyboard navigation:** ArrowDown/ArrowUp move the active row, wrapping and skipping disabled/separator rows (verified: `menu-panel.component.spec.ts — 'ArrowDown moves to the next item, skipping the separator and disabled items'`, `'ArrowUp wraps from the first enabled item to the last'`); Home/End jump to first/last enabled row (verified: `menu-panel.component.spec.ts — 'Home/End jump to the first/last enabled item'`); Enter/Space activates the current item, calling `command()` and emitting `itemActivated` (verified: `menu-panel.component.spec.ts — 'Enter activates the active item: calls command() and emits itemActivated'`, end-to-end via `menu.component.spec.ts — 'selecting an item closes the menu, calls its command(), and emits itemSelect'`); a disabled item is never activated, even by direct pointerdown (verified: `menu-panel.component.spec.ts — 'never activates a disabled item, even via a direct pointerdown'`); Tab emits `closeRequested` without `preventDefault()`, closing the menu and letting the browser's own pending Tab continue (verified: `menu-panel.component.spec.ts — 'Tab emits closeRequested'`); Escape closes the menu, handled centrally by `OverlayService` (`closeOnEscape` default `true`), confirmed end-to-end (verified: `menu.component.spec.ts — 'closes on Escape'`). `projects/medra/ui/src/lib/menu/menu-panel.component.ts:134-164`, `projects/medra/ui/src/lib/overlay/overlay.service.ts:56-57,335-338`
- **Screen reader — resolved 2026-08-19:** No `aria-label` on the panel `<ul>` itself (relies on the triggering button's own accessible name); focus moves into the panel on open (`listRef().nativeElement.focus()`), and is restored to the trigger on close via `OverlayService`'s default `restoreFocus: true`. `projects/medra/ui/src/lib/menu/menu-panel.component.ts:108-111`, `projects/medra/ui/src/lib/overlay/overlay.service.ts:60-69`. The focus-restore-to-trigger half is generic `OverlayService` behavior already covered by its own shared suite (`overlay.service.spec.ts — 'closing restores focus to whatever was focused before the overlay opened'`); Menu now also has direct, component-level assertions for both halves: the panel's own `ngAfterViewInit` moving real DOM focus into itself (not just `aria-activedescendant`) is confirmed by `menu-panel.component.spec.ts — 'moves DOM focus into the list itself on init, not just aria-activedescendant'`, and Menu wiring that shared `OverlayService` mechanism correctly end-to-end (`document.activeElement` on the panel after open, back on the trigger after close) is confirmed by `menu.component.spec.ts — 'moves focus into the panel on open and restores it to the trigger on close (OverlayService focus management, wired correctly by Menu)'`.

**A11y verdict:** Covered — **resolved 2026-08-19**: role/keyboard/activation/disabled-skip/Escape-close behavior was already thoroughly exercised, and the previously-unasserted focus-management claims (autofocus into the panel on open, focus restored to the trigger on close) are now directly tested — see the Screen reader section above for the specific test names.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Declare `<med-menu #menu>` once and call `menu.toggle(originElement)` from any trigger — no directive pairing needed. | Don't expect `<med-menu>` to render inline; its host is `display: none` — only the overlay panel is visible. |
| Use `separator: true` items to group related commands; every other field on that item is ignored. | Don't rely on hover alone to reach items — the panel exposes full Arrow/Home/End/Enter keyboard support. |
| Rely on `OverlayService`'s built-in Escape/outside-click/focus-restore behavior — Escape-to-close is verified end-to-end (`menu.component.spec.ts — 'closes on Escape'`). | Don't add your own Escape handler on the trigger — it's already wired centrally. |
| Rely on pointerdown (not click) for row activation — verified in `menu-panel.component.spec.ts — 'clicking (pointerdown) an enabled item activates it'`; `event.preventDefault()` on pointerdown deliberately keeps focus on the `<ul>` instead of jumping to the `<li>`. | Don't attach your own `click` handler expecting it to fire before the row's built-in activation — the row already activates on `pointerdown`. |
| Trust that a `disabled: true` item is unreachable by every input method (Arrow skip, Home/End skip, and direct pointerdown all verified). | Don't assume focus placement (initial autofocus, restore-to-trigger) is regression-tested — it currently is not; verify manually if you change overlay/focus wiring near `Menu`. |

### Code example (Angular)
```html
<button #fileMenuTrigger medButton type="button" variant="outlined" (click)="fileMenu.toggle(fileMenuTrigger)">
  Actions
  <med-icon name="chevron-down" variant="mini" />
</button>
<med-menu #menu [items]="fileMenuItems" (itemSelect)="menuLog.set('Selected: ' + $event.label)" />
```

### Source
- `projects/medra/ui/src/lib/menu/menu.component.ts`
- `projects/medra/ui/src/lib/menu/menu-panel.component.ts`
- `projects/medra/ui/src/lib/menu/menu.types.ts`
- Usage: `projects/showcase/src/app/app.html:901-911`
