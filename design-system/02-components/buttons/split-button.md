## Component: Split Button

### Description
A primary action button fused to a dropdown-toggle button (`projects/medra/ui/src/lib/split-button/split-button.component.ts:33-60`). Clicking the main (left) segment emits `buttonClick` immediately; clicking the toggle (right, chevron) segment opens a `MenuPanelComponent` dropdown of secondary actions. The two segments are visually connected via a border-collapsing trick (`rounded-*-none` + `-ml-px` + `focus-visible:z-10`) reusing Button's own `buttonVariants` CVA directly (`split-button.component.ts:84-92`), so both sides restyle automatically if Button's CVA changes. The dropdown itself reuses the same `MenuPanelComponent`/`openMenuPanel()` machinery as Menu/Menubar/ContextMenu, so open/close/outside-click/Esc/focus-return come for free (`split-button.component.ts:20-25`). v1 has no content projection — `label`/`icon` are plain string/icon-name inputs (`split-button.component.ts:27-31`).

### Variants
Split Button does not define its own variant vocabulary — it forwards `severity`/`variant`/`size` directly into `buttonVariants` (`split-button.component.ts:69-71`, `:84-92`), i.e. the same variants as Button:

| Variant | When to use |
|---|---|
| `filled` (default) | Primary/default emphasis |
| `outlined` | Secondary emphasis |
| `text` | Low emphasis |
| `link` | Lowest emphasis |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Text on the primary button (`split-button.component.ts:66`) |
| `icon` | `string \| null` | `null` | Optional icon name shown before the label, rendered via `med-icon` (`split-button.component.ts:67`, `:42-44`) |
| `items` | `readonly MenuItem[]` | `[]` | Dropdown menu items (`split-button.component.ts:68`) |
| `severity` | `ButtonSeverity` | `'primary'` | Forwarded to `buttonVariants` (`split-button.component.ts:69`) |
| `variant` | `ButtonStyleVariant` | `'filled'` | Forwarded to `buttonVariants` (`split-button.component.ts:70`) |
| `size` | `ButtonSize` | `'default'` | Forwarded to `buttonVariants` (`split-button.component.ts:71`) |
| `disabled` | `boolean` | `false` | Disables both segments (`split-button.component.ts:72`) |
| `toggleLabel` | `string` | `'More options'` | `aria-label` for the toggle (chevron) button (`split-button.component.ts:73`) |
| `buttonClick` | `output<void>` | — | Emitted when the primary segment is clicked (`split-button.component.ts:75`) |
| `itemSelect` | `output<MenuItem>` | — | Emitted when a dropdown item is picked (`split-button.component.ts:76`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Per `severity`/`variant`/`size` via `buttonVariants` | — |
| Hover | Inherited from `buttonVariants` hover classes | Pointer only |
| Focus | Inherited `focus-visible:ring-*`; toggle segment adds `focus-visible:z-10` to stay above the adjacent segment's ring (`split-button.component.ts:90`) | Keyboard-visible focus ring |
| Active | Inherited `active:*` classes | Pointer/keyboard press |
| Disabled | Both `<button>` elements get native `[disabled]` (`split-button.component.ts:41`, `:50`); `open()` also early-returns if `disabled()` (`split-button.component.ts:103`) | Not interactive |
| Loading | Not implemented | — |
| Error | Not implemented | — |
| Open (dropdown) | `aria-expanded` reflects `isOpen()` signal (`split-button.component.ts:53`, `:82`) | Menu panel shown via `OverlayService`; closes on outside click/Esc/item pick (inherited from `MenuPanelComponent`) |

### Accessibility
- **Role/ARIA:** Toggle button has `aria-haspopup="menu"`, `[attr.aria-expanded]="isOpen()"`, `[attr.aria-label]="toggleLabel()"` (`split-button.component.ts:52-54`) — all directly tested (`split-button.component.spec.ts` — `'renders the primary button with its label and a separate toggle button'` for `aria-haspopup`, `'clicking the toggle button opens the menu and sets aria-expanded'`, `'clicking the toggle button again closes the menu (toggle behavior)'`, `'sets a default toggle aria-label, overridable via toggleLabel'`).
- **Keyboard navigation:** Not custom-implemented beyond native button focus/activation for the two segments; dropdown keyboard handling (Esc, focus return, item activation) is inherited from `MenuPanelComponent`/`openMenuPanel()` (`split-button.component.ts:20-25`) and directly tested at the SplitButton level: `split-button.component.spec.ts` — `'closes on Escape'` (dispatches `Escape` on the menu panel and confirms it closes), `'selecting an item calls its command(), emits itemSelect, and closes the panel'` (dispatches `Enter` on the menu panel to activate the first item). `'destroying the host while open closes the overlay'` confirms cleanup on `ngOnDestroy`.
- **Screen reader:** `toggleLabel` input gives the icon-only toggle button an accessible name (default `'More options'`, `split-button.component.ts:73`), tested as above. `aria-haspopup="menu"` + `aria-expanded` together announce the disclosure relationship to the dropdown.

**A11y verdict:** Covered — `aria-haspopup`/`aria-expanded`/`aria-label` are all directly tested, and the dropdown's Escape-to-close and Enter-to-select behavior (inherited from the shared `MenuPanelComponent`) are exercised by SplitButton's own spec, not just assumed from the shared component's docs.

**Ripple adoption (2026-08-19):** `[medRipple]` now applied to both the primary action button and the toggle button — previously only Button itself had it (see `03-patterns/ripple-interaction.md`). Directly tested: `split-button.component.spec.ts` — `'triggers the ripple effect on both the primary and toggle buttons (Ripple adoption)'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Provide a distinct `toggleLabel` if the default "More options" isn't descriptive enough | Leaving the toggle button unlabeled — it's icon-only |
| Use `itemSelect`/`buttonClick` outputs to distinguish the primary action from a menu pick | Assuming `buttonClick` fires for menu item selections (it doesn't — that's `itemSelect`) |
| Rely on Escape to close the dropdown — it's built in and tested | Assuming `disabled` only affects the primary button — it disables both segments and prevents the menu from opening at all (`split-button.component.spec.ts` — `'disabled: both buttons are disabled and the toggle never opens the menu'`) |

### Code example (Angular)
```html
<med-split-button
  label="Save"
  [items]="splitButtonItems"
  (buttonClick)="splitButtonLog.set('Primary action clicked')"
  (itemSelect)="splitButtonLog.set('Selected: ' + $event.label)"
/>
<med-split-button label="Download" icon="arrow-down-tray" severity="secondary" variant="outlined" [items]="splitButtonItems" />
```
(from `projects/showcase/src/app/app.html:400-401`)

### Source
- `projects/medra/ui/src/lib/split-button/split-button.component.ts`
- Reuses `projects/medra/ui/src/lib/button/button.styles.ts` (`buttonVariants`) and `projects/medra/ui/src/lib/menu/menu-panel.component.ts` (dropdown)
