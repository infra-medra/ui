## Component: Button

### Description
Button is implemented as an **attribute directive** (`ButtonDirective`), not a wrapping component — it is applied directly to a native `<button>` or `<a>` element (`projects/medra/ui/src/lib/button/button.directive.ts:15`). This preserves native semantics for free: native `disabled` attribute/`:disabled` pseudo-class, native `submit`/`reset` `type`, anchor `href` navigation, and full control over content via normal projection (no `label`/`icon` string inputs to keep in sync — confirmed by the directive's own doc comment at `button.directive.ts:6-13`). It also carries a `RippleDirective` as a host directive (`button.directive.ts:17`), so every `medButton` gets a ripple interaction feedback effect automatically. Use it for any clickable action — primary/secondary actions, icon-only actions, links styled as buttons.

### Variants
| Variant | When to use |
|---|---|
| `filled` (default) | Primary/default emphasis — solid background fill (`button.styles.ts:13`, `:23-32`) |
| `outlined` | Secondary emphasis — bordered, transparent background (`button.styles.ts:34-43`) |
| `text` | Low emphasis — no border/background until hover (`button.styles.ts:45-54`) |
| `link` | Lowest emphasis, reads as an inline hyperlink (underline on hover, no padding treatment change) (`button.styles.ts:56-65`) |

Each `variant` is combined with a `severity` (`primary`, `secondary`, `info`, `success`, `warn`, `help`, `danger`, `contrast` — `button.styles.ts:3-11`) to pick the actual color classes via `cva` compound variants (`button.styles.ts:153-160`).

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `severity` | `'primary' \| 'secondary' \| 'info' \| 'success' \| 'warn' \| 'help' \| 'danger' \| 'contrast'` | `'primary'` | Color/semantic emphasis (`button.directive.ts:23`) |
| `variant` | `'filled' \| 'outlined' \| 'text' \| 'link'` | `'filled'` | Visual style (`button.directive.ts:24`) |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Padding/font-size/radius scale (`button.directive.ts:25`; `default`/`lg` meet the ~44px touch-target guideline, `sm` is for dense UI — comment at `button.styles.ts:133-138`) |
| `pill` | `boolean` | `false` | Fully rounded corners (`rounded-full`) (`button.directive.ts:26`) |
| `iconOnly` | `boolean` | `false` | Square padding matching the button's height, for icon-only buttons (`button.directive.ts:28`) |
| `class` | `string` | `''` | Extra classes merged onto the host (`button.directive.ts:29`) |
| `medRippleDisabled` | `boolean` | inherited from `RippleDirective` | Disables the ripple effect (exposed via `hostDirectives` input passthrough, `button.directive.ts:17`) |
| `invalid` | `boolean` | `false` | **Added 2026-08-19.** Error/validation state — applies the shared `INVALID_RING_CLASS` danger ring on top of whatever severity/variant is set, plus `aria-invalid="true"`. Extracted from what ToggleButton/SelectButton were each duplicating (`button.directive.ts`, `button.styles.ts`) |
| `loading` | `boolean` | `false` | **Added 2026-08-19.** Sets `aria-busy="true"` and dims/disables pointer interaction (same visual treatment as `disabled`). **Does not render a spinner** — see Loading state below |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Severity/variant color per `button.styles.ts` compound variants | — |
| Hover | `hover:*` background/text shift, e.g. `hover:bg-brand-600` for filled primary (`button.styles.ts:24`) | Pointer only |
| Focus | `focus-visible:ring-(--focus-ring-width)` + severity-colored ring, offset by `--focus-ring-offset` (`button.styles.ts:126`, `:68-77`) | Keyboard-visible focus ring |
| Active | `active:*` darker shade, e.g. `active:bg-brand-700` (`button.styles.ts:24`) | Pointer/keyboard press |
| Disabled | `disabled:pointer-events-none disabled:opacity-(--opacity-disabled)` (`button.styles.ts:127`) | Not interactive — uses native `disabled` attribute, so `:disabled` pseudo-class applies automatically |
| Loading | `pointer-events-none opacity-(--opacity-disabled)` + `aria-busy="true"` (`button.directive.ts`) | Not interactive, but **no spinner is rendered** — `ButtonDirective` is a plain attribute directive on consumer-authored content, with no template of its own to inject one into. Project a `<med-progress-spinner>` yourself alongside the label when `loading` is true; a built-in spinner would need Button to become a wrapping component, a breaking API change not made here |
| Error | `invalid` input applies `INVALID_RING_CLASS` (danger ring) + `aria-invalid="true"` (`button.directive.ts`, `button.styles.ts`) | Same shared treatment ToggleButton/SelectButton now consume instead of duplicating |

### Accessibility
- **Role/ARIA:** Relies on the native element's implicit role (`button` or `link`, depending on host tag). `aria-invalid`/`aria-busy` are set when `invalid`/`loading` are true — directly tested (`button.directive.spec.ts` — `'applies aria-invalid and the shared danger ring when invalid is true'`, `'omits aria-invalid when invalid is false'`, `'sets aria-busy and dims interaction when loading is true, without rendering a spinner'`, `'omits aria-busy when loading is false'`).
- **Keyboard navigation:** None custom-implemented for the normal case — inherited for free from the native `<button>`/`<a>` element (Enter/Space activation, native `Tab` focusability); the directive only verifies `disabled`/`type` are preserved (`button.directive.spec.ts` — `'preserves native button semantics (disabled attribute, type)'`).
- **Keyboard activation while `loading` — resolved 2026-08-19:** previously `loading` only set `aria-busy` and `pointer-events-none opacity-(--opacity-disabled)`, which blocks a *mouse* click (no pointer event ever reaches a `pointer-events-none` element) but not a *keyboard*-triggered one — pressing Enter/Space on a focused button is the HTML spec's own "activation behavior," independent of pointer events, that synthesizes a `click` as the keydown's default action. The fix adds a host `(keydown)` listener that calls `event.preventDefault()` on Enter/Space while `loading` is true, which cancels that default action outright (deliberately not the native `disabled` attribute/property — that's already fully consumer-managed via a plain `[disabled]="..."` binding directly on the native element, and a directive host binding to the same DOM property would race with, and can clobber, that binding on every change-detection pass). Confirmed by `button.directive.spec.ts` — `'cancels the Enter-key activation behavior when loading is true, so a real browser never synthesizes the resulting click (Wave 2 fix)'`, `'cancels the Space-key activation behavior when loading is true'`, `'a non-loading button leaves Enter/Space activation alone'`, `"a non-loading button still runs the consumer's declaratively-bound (click) handler"`.
- **Screen reader:** No `aria-label`/`aria-live` wiring in the directive; consumers are expected to supply their own (e.g. `aria-label="Icon only"` in the showcase, `app.html:31`). `aria-busy`/`aria-invalid` give assistive tech the state changes, but there's no `aria-live` announcement when `loading` turns on, so a screen reader user isn't proactively told the button became busy — only discovers it if they re-inspect the button.

**A11y verdict:** Covered — **the keyboard-activation gap is resolved 2026-08-19**: `loading` now cancels Enter/Space's default "synthesize a click" activation behavior at the keydown, on top of the pre-existing `pointer-events-none` blocking mouse clicks, so a busy button is genuinely non-activatable by either input modality. `aria-invalid`/`aria-busy` remain directly tested as before. The remaining screen-reader item above (no `aria-live` announcement when `loading` turns on mid-interaction) is a real but separate enhancement, not part of this gap.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Apply `medButton` to a real `<button>` or `<a>` element | Applying it to a non-interactive element (loses native keyboard/focus semantics the directive relies on) |
| Add your own `aria-label` for icon-only buttons | Leaving an `iconOnly` button with no accessible name |
| Use `type="button"` explicitly for non-submit actions | Relying on default `type="submit"` inside a `<form>` when the action isn't a submit |
| Rely on `loading` alone to block both mouse and keyboard activation — it now does both (`button.directive.ts` host `[attr.aria-busy]`/`(keydown)`, resolved 2026-08-19) | Also binding `[disabled]="loading()"` "just in case" — redundant now, and on `<a medButton>` the native `disabled` attribute has no effect anyway |

### Code example (Angular)
```html
<button medButton type="button" [severity]="severity" [variant]="variant">
  {{ severity }}
</button>

<button medButton type="button" iconOnly aria-label="Icon only">
  <med-icon name="plus" ariaLabel="Add" />
</button>
```
(from `projects/showcase/src/app/app.html:16`, `:31-33`)

### Source
- `projects/medra/ui/src/lib/button/button.directive.ts`
- `projects/medra/ui/src/lib/button/button.styles.ts`
