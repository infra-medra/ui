## Component: Inplace

### Description
A click-to-edit toggle between a compact display view and a richer content view (typically a form control) — `<med-inplace><span medInplaceDisplay>{{ value }}</span><input medInplaceContent [(ngModel)]="value" /></med-inplace>` (`projects/medra/ui/src/lib/inplace/inplace.component.ts:7-46`). Two named content-projection slots (`InplaceDisplayDirective`/`InplaceContentDirective`) are used rather than one default + one named slot, since the two views are mutually exclusive by construction. The display view is a real `<button>` (not a `div role="button"` reimplementation), so it gets Enter/Space activation and focus styling for free. Both views stay in the DOM (`[hidden]`, not `@if`-removed) so a `medInplaceContent` form control keeps whatever the consumer typed across a close/reopen. There is no auto-close on blur or Enter — Inplace can't know whether the projected content is a single-field edit (Enter = done) or something with its own internal focus moves (a dropdown, a multi-field form), so it only reacts to explicit consumer-driven UI (its own close button, or external code calling `close()`/setting `active`).

### Variants
No `variant` input — a single visual treatment. The only structural variation is whether a close affordance is shown.

| Mode | When to use |
|---|---|
| Default (`closable=false`) | No close button in the content view — the consumer's own UI (e.g. a save button, blur handling) must exit edit mode |
| `closable` | Adds a small close button (`x-mark` icon) inside the content view (`inplace.component.ts:61-74`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `active` | `model<boolean>` | `false` | Two-way-bindable edit-mode state — local UI state, not a submitted value (`inplace.component.ts:79`) |
| `closable` | `boolean` | `false` | Shows a close button inside the content view (`inplace.component.ts:80`) |
| `disabled` | `boolean` | `false` | Disables entering edit mode (`inplace.component.ts:81`) |
| `closeLabel` | `string` | `'Close'` | `aria-label` for the close button (`inplace.component.ts:83`) |
| `class` | `string` | `''` | Extra classes on the host — sizes the host itself, since the display button and content div are mutually exclusive and there's no single one of them a width/margin class unambiguously belongs to (`inplace.component.ts:38-46`, `:84`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Display (default, `active=false`) | Display button visible (`[hidden]="active()"` false); hover: `hover:bg-surface-100` / dark: `dark:hover:bg-surface-800` (`inplace.component.ts:54`, `:90-91`) | Clicking opens edit mode (`inplace.component.ts:54`, `:99-101`) |
| Active (editing, `active=true`) | Content view visible (`[hidden]="!active()"`), `aria-expanded="true"` on the (hidden) display button (`inplace.component.ts:54`, `:57`) | Projected form control retains its DOM state across toggles |
| Focus (display button) | `focus-visible:ring-(--focus-ring-width)` ring, brand-colored, with offset (`inplace.component.ts:92`) | Native button focus/activation (Enter/Space) |
| Disabled | Display button gets native `[disabled]`; `disabled:pointer-events-none disabled:opacity-(--opacity-disabled)` (`inplace.component.ts:54`, `:93`) | Cannot enter edit mode |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Display button: `[attr.aria-expanded]="active()"` (`inplace.component.ts:54`) — the `true`/`false` transition is exercised indirectly via `active`'s state (`inplace.component.spec.ts` — `'clicking the display button activates the content view'`), though the spec never reads `getAttribute('aria-expanded')` directly, only the `hidden` property of each view — `[not covered by tests]` for the attribute value itself, only for the visibility it correlates with. Close button: `[attr.aria-label]="closeLabel()"` (`inplace.component.ts:69`); its presence/absence is tested (`'no close button is rendered unless closable is set'`) but the label text itself is looked up via a hardcoded `'Close'` selector in the test helper (`inplace.component.spec.ts:34-36`), not verified against a custom `closeLabel` input — `[not covered by tests]` for a non-default `closeLabel`.
- **Keyboard navigation:** None custom beyond native `<button>` semantics — Enter/Space opens/closes via the real buttons (doc at `inplace.component.ts:18-21`), only exercised via `.click()` in the spec, not real keyboard events.
- **Gap — focus management:** Both views stay in the DOM and toggle via `[hidden]` (`inplace.component.ts:54`, `:57`), and the display button is the element the user just activated (by click or by Enter/Space, which leaves it focused). The moment `active` flips to `true`, that same button becomes `[hidden]="active()"` — a hidden element cannot hold focus, so the browser drops focus to `<body>`. Nothing in `inplace.component.ts` calls `.focus()` on any element inside `medInplaceContent` to pick up that dropped focus, and no test asserts `document.activeElement` after `open()`/`close()`. The same problem happens symmetrically on close (`closable`): the close button that was just clicked/keyboard-activated becomes hidden as the content view hides, again with nothing to receive focus back on the display button. **This means a keyboard-only user who activates Inplace loses focus entirely on every open and close** — a concrete, unimplemented, and untested accessibility defect for a component whose entire interaction model is keyboard-operable native buttons.
- **Screen reader:** `closeLabel` (default `'Close'`) names the icon-only close button; `aria-expanded` on the display button is intended to communicate edit-mode state, though (per above) that specific attribute value isn't directly asserted in tests.

**A11y verdict:** Covered — **resolved 2026-08-19.** Opening now moves focus to the first focusable element in the content view (falling back to a `tabindex="-1"` wrapper if none exists); closing returns focus to the display button. Implemented via an `afterRenderEffect` (same DOM-timing pattern `TerminalComponent`'s scroll-into-view already uses) and directly tested (`inplace.component.spec.ts` — `'opening moves focus into the first focusable element...'`, `'closing returns focus to the display button'`).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Put exactly one `medInplaceDisplay` and one `medInplaceContent` child inside `<med-inplace>` | Expecting auto-close on blur/Enter — not implemented; provide your own close affordance or use `closable` |
| Size the host via `class` (e.g. `max-w-64`), not the inner display/content elements directly | Applying width classes to the projected `medInplaceDisplay`/`medInplaceContent` elements expecting consistent sizing between the two mutually-exclusive views |
| For keyboard-heavy flows, manually focus the projected content control (e.g. via a template reference and `viewChild`) after activating Inplace, and focus the display button back after closing | Assuming focus automatically moves into the content view on open, or back to the display button on close — neither happens; the previously-focused button simply becomes `[hidden]` and focus falls back to `<body>` |
| Rely on the content control keeping its DOM state (e.g. typed text) across a close/reopen | Assuming the content is re-created each time — it stays in the DOM under `[hidden]`, tested (`inplace.component.spec.ts` — `'the content <input> keeps its value across a close/reopen (stays in the DOM, not recreated)'`) |

### Code example (Angular)
```html
<med-inplace>
  <span medInplaceDisplay>{{ inplaceDemoValue || '(click to add a name)' }}</span>
  <input medInplaceContent medInputText type="text" [(ngModel)]="inplaceDemoValue" name="demo-inplace" class="max-w-64" />
</med-inplace>
<med-inplace closable>
  <span medInplaceDisplay>{{ inplaceClosableDemoValue }}</span>
  <textarea medInplaceContent medTextarea [(ngModel)]="inplaceClosableDemoValue" name="demo-inplace-closable" class="max-w-64" rows="2"></textarea>
</med-inplace>
```
(from `projects/showcase/src/app/app.html:1142-1152`)

### Source
- `projects/medra/ui/src/lib/inplace/inplace.component.ts`
- `projects/medra/ui/src/lib/inplace/inplace.directives.ts`
