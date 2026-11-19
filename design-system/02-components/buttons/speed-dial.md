## Component: Speed Dial

### Description
A circular main (FAB-style) button that reveals a row or column of smaller action buttons (`projects/medra/ui/src/lib/speed-dial/speed-dial.component.ts:9-33`). Item buttons are always in the DOM (not conditionally removed) and toggle between two baked-in transform/opacity states — `pointer-events-none` and `tabIndex={-1}` while closed keep them out of both click and Tab order without forfeiting the CSS transition (`speed-dial.component.ts:15-20`). Scope cut for v1: only linear directions (`up`/`down`/`left`/`right`) — no circular/arc arrangement — and no outside-click auto-close, since SpeedDial isn't rendered through `OverlayService` (`speed-dial.component.ts:22-32`).

### Variants
No `variant` input exists. The main button is always rendered `filled`, `pill`, `iconOnly`, size `lg` via `buttonVariants` (`speed-dial.component.ts:78-80`); item buttons are always `filled`, `secondary`, `pill`, `iconOnly`, size `default` (`speed-dial.component.ts:97`). `severity` only affects the main button's color (`speed-dial.component.ts:65`, `:79`).

| Direction | When to use |
|---|---|
| `up` (default) | Items stack upward from the main button (`speed-dial.component.ts:64`, `speed-dial.styles.ts:5`) |
| `down` | Items stack downward (`speed-dial.styles.ts:6`) |
| `left` | Items stack leftward, row layout (`speed-dial.styles.ts:7`) |
| `right` | Items stack rightward, row layout (`speed-dial.styles.ts:8`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly MenuItem[]` | `[]` | Flat list of actions (label/icon/disabled/command — no nested submenu) (`speed-dial.component.ts:63`) |
| `direction` | `SpeedDialDirection` (`'up' \| 'down' \| 'left' \| 'right'`) | `'up'` | Layout axis for revealed items (`speed-dial.component.ts:64`) |
| `severity` | `ButtonSeverity` | `'primary'` | Main button color (`speed-dial.component.ts:65`) |
| `icon` | `string` | `'plus'` | Main button icon; rotates 45° when open (`speed-dial.component.ts:66`, `:82`) |
| `disabled` | `boolean` | `false` | Disables toggling (`speed-dial.component.ts:67`) |
| `toggleLabel` | `string` | `'Toggle actions'` | `aria-label` for the main button (`speed-dial.component.ts:70`) |
| `itemSelect` | `output<MenuItem>` | — | Emitted when an item is activated; closes the dial (`speed-dial.component.ts:72`, `:109-116`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Closed (default) | Item buttons hidden: `pointer-events-none scale-75 opacity-0` plus a direction-specific offset translate (`speed-dial.component.ts:98`, `speed-dial.styles.ts:17-22`) | Item buttons out of Tab order (`tabIndex="-1"`, `speed-dial.component.ts:49`) |
| Open | Item buttons visible: `scale-100 opacity-100`; main icon rotates 45° (`speed-dial.component.ts:82`, `:98`) | Item buttons in Tab order (`tabIndex="0"`) |
| Hover/Active | Inherited from `buttonVariants` | Pointer only |
| Focus | Inherited `focus-visible:ring-*` from `buttonVariants` | Keyboard-visible focus ring |
| Disabled | Main button gets `pointer-events-none opacity-(--opacity-disabled)` (`speed-dial.component.ts:79`); `toggle()` no-ops (`speed-dial.component.ts:102-107`) | Not interactive |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Main button: `[attr.aria-label]="toggleLabel()"`, `[attr.aria-expanded]="open()"` (`speed-dial.component.ts:42`) — `aria-expanded` toggling directly tested (`speed-dial.component.spec.ts` — `'renders the main button plus one button per item, closed by default'`, `'clicking the main button opens the dial, setting aria-expanded and a real tabIndex on items'`, `'clicking the main button again closes it'`); `toggleLabel` tested (`'sets aria-label on the main button via toggleLabel'`). Item buttons: `[attr.aria-label]="item.label"` (`speed-dial.component.ts:50`) — tested (`'each item button gets its own aria-label from the item label'`).
- **Keyboard navigation:** No arrow-key handling between items, and no `Escape`-to-close handler exist in the source (only `(click)` bindings on both the main and item buttons, `speed-dial.component.ts:43`, `:55`) — relies on native Tab order plus the `tabIndex` toggle (`tabIndex="0"`/`"-1"` on open/close, tested: `'clicking the main button opens the dial...'`, `'closed items are out of the tab order (tabIndex -1)'`). Item buttons respect native `[disabled]` per-item, also tested (`'a disabled item is a real disabled button and never activates'`). **Gap:** opening the dial does not move focus into the first item, and closing it (by item pick or by re-clicking the main button) does not return focus to the main button — nothing in `speed-dial.component.ts` calls `.focus()`, and no test asserts `document.activeElement` after `toggle()`/`activate()`. `[not covered by tests]` — a keyboard-only user who opens the dial has no automatic way to reach the items other than continuing to Tab past whatever follows the SpeedDial in the page.
- **Screen reader:** `toggleLabel` (default `'Toggle actions'`) names the main FAB button for assistive tech. `aria-expanded` communicates open/closed state, but since `role="toolbar"`/`role="menu"` is not used (plain `<button>`s in a `<div>`), assistive tech has no grouping semantics tying the item buttons to the main button beyond DOM adjacency.

**A11y verdict:** Covered — **resolved 2026-08-19.** Escape now closes the dial from anywhere inside it; ArrowRight/Down and ArrowLeft/Up move focus between item buttons (wrapping, skipping disabled — same model `SelectButtonComponent`/`TabsComponent` already use), and Home/End jump to the first/last enabled item. Opening moves focus to the first enabled item automatically; closing (via Escape or an item pick) returns focus to the main button. Directly tested: `speed-dial.component.spec.ts` — `'opening moves focus to the first enabled item button'`, `'Escape closes the dial and returns focus to the main button'`, `'ArrowRight/ArrowDown move focus to the next enabled item...'`, `'Home/End jump to the first/last enabled item'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Keep `items` flat (label/icon/disabled/command) | Passing nested submenu items — not supported (v1 scope cut, `speed-dial.component.ts:22-24`) |
| Pick `direction` based on available screen space around the FAB | Assuming outside-click closes the dial — it doesn't; only the main button or an item pick toggles it (`speed-dial.component.ts:22-32`) |
| Manually manage focus (e.g. focus the main button yourself) after an item is picked, if your use case needs it | Assuming `Escape` closes the dial or that focus automatically returns to the main button — neither is implemented (`speed-dial.component.ts` has no `keydown` handler and no `.focus()` call) |

### Code example (Angular)
```html
<med-speed-dial [items]="speedDialItems" direction="up" (itemSelect)="speedDialLog.set('Selected: ' + $event.label)" />
<med-speed-dial [items]="speedDialItems" direction="right" severity="help" (itemSelect)="speedDialLog.set('Selected: ' + $event.label)" />
```
(from `projects/showcase/src/app/app.html:940-941`)

### Source
- `projects/medra/ui/src/lib/speed-dial/speed-dial.component.ts`
- `projects/medra/ui/src/lib/speed-dial/speed-dial.styles.ts`

### Note for audit
**Resolved 2026-08-19.** Item buttons use `shadow-overlay-md` (`speed-dial.component.ts:99`) — this token is now defined in `@theme` (interpolated between `-sm`/`-lg`, see `design-system/01-foundations/shadows-elevation.md`), so the action buttons render a real shadow again instead of silently none.

**Ripple adoption (2026-08-19):** `[medRipple]` now applied to both the main button and every item button (`medRippleDisabled` bound to `item.disabled` on the latter) — previously only Button itself had it (see `03-patterns/ripple-interaction.md`).
