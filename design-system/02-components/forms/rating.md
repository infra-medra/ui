## Component: Rating

### Description
`Rating` (`med-rating`) is a row of stars acting as a single discrete value (`number | null`, 1-based), implemented as `role="radiogroup"` of `role="radio"` star buttons with roving tabindex and arrow-key navigation — the same pattern this codebase already established for `SelectButton`'s single mode (there is no official WAI-ARIA APG "Rating" pattern; a radiogroup of N discrete choices is the closest fit). Clicking the already-selected star is a no-op — it never "toggles off" on its own, matching radio semantics. `cancel` (default `true`) adds one more radio option before the stars — a small clear affordance representing "no rating" (`null`) — rather than breaking radio semantics by letting a re-click deselect. `readonly` renders a static, non-interactive summary instead (`role="img"` with a text-equivalent `aria-label`, e.g. "4 out of 5 stars"), appropriate for displaying an existing rating that isn't being edited. Implements `ControlValueAccessor`. `projects/medra/ui/src/lib/rating/rating.component.ts:18-42`

### Variants
| Variant | When to use |
|---|---|
| Interactive (default) | Editable rating input, `role="radiogroup"` of star buttons. |
| `readonly` | Static, non-interactive display of an existing rating (`role="img"`), e.g. in a product card or review list. `projects/medra/ui/src/lib/rating/rating.component.ts:36-42,58-62` |
| `cancel` on (default) vs off | With `cancel`, a clear/"x" option precedes the stars so the rating can be reset to `null`; without it, there's no way to clear a selection once set. `projects/medra/ui/src/lib/rating/rating.component.ts:29-34,64-81` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `stars` | `number` | `5` | Number of stars in the row. `projects/medra/ui/src/lib/rating/rating.component.ts:105` |
| `cancel` | `boolean` | `true` | Adds a clear/"no rating" option before the stars. `projects/medra/ui/src/lib/rating/rating.component.ts:106` |
| `readonly` | `boolean` | `false` | Renders a static summary instead of interactive radio buttons. `projects/medra/ui/src/lib/rating/rating.component.ts:107` |
| `disabled` | `boolean` | `false` | Disables interaction; all buttons get `tabIndex="-1"`. `projects/medra/ui/src/lib/rating/rating.component.ts:108` |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Star icon and hit-target padding size. `projects/medra/ui/src/lib/rating/rating.component.ts:109` |
| `ariaLabel` | `string \| null` | `null` | `aria-label` for the group; in `readonly` mode falls back to an auto-generated "`N` out of `M` stars" string if not set. `projects/medra/ui/src/lib/rating/rating.component.ts:110,131-136` |
| `clearLabel` | `string` | `'Clear rating'` | `aria-label` for the clear/"x" option. `projects/medra/ui/src/lib/rating/rating.component.ts:111` |
| `class` | `string` | `''` | Extra classes merged onto the group wrapper. `projects/medra/ui/src/lib/rating/rating.component.ts:112` |

No `invalid` input exists (unlike most other form fields in this batch). No `@Output()`s; value flows through `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Inactive stars `text-surface-300`/dark `text-surface-600`, outline icon variant | — |
| Hover | Hovered star and all stars up to it preview as "active" (filled, warn/amber color) via `hoverValue`; reverts to committed value on `mouseleave` | `projects/medra/ui/src/lib/rating/rating.component.ts:142-146,161-170` |
| Focus | `focus-visible:ring-(--focus-ring-width)` with ring offset, warn color, on the focused star button | `projects/medra/ui/src/lib/rating/rating.styles.ts:16` |
| Active (selected) | Active stars filled/solid icon variant in warn/amber color (`SOLID_SEVERITY_TEXT.warn`) | `isActive()` compares star index against hover or committed value. `projects/medra/ui/src/lib/rating/rating.component.ts:142-146`, `projects/medra/ui/src/lib/rating/rating.styles.ts:42` |
| Disabled | `disabled:opacity-(--opacity-disabled)`, `pointer-events-none`; all buttons `tabIndex="-1"` and `aria-disabled="true"` | `disabled` input OR Reactive Forms `setDisabledState()`; hover/select handlers early-return. `projects/medra/ui/src/lib/rating/rating.styles.ts:17`, `projects/medra/ui/src/lib/rating/rating.component.ts:162,184` |
| Loading | Not implemented | — |
| Error (invalid) | **Not implemented** — no `invalid` input exists on this component. | — |

### Accessibility
- **Role/ARIA:** Interactive mode: wrapper is `role="radiogroup"` with `aria-label`; each star (and the clear option) is `role="radio"` with `aria-checked`, `aria-label` (e.g. "3 stars"), and `aria-disabled` — verified together by `rating.component.spec.ts` — `'sets role="radiogroup" on the container and role="radio" on each button'`. Readonly mode: wrapper is `role="img"` with a computed `aria-label` (e.g. "4 out of 5 stars") — `'renders no buttons, only a static role="img" summary'` (also confirms zero `<button>` elements render in readonly mode) — and a custom `ariaLabel` overrides the generated summary — `'a custom ariaLabel overrides the generated summary'`. `projects/medra/ui/src/lib/rating/rating.component.ts:58,69-71,87-89,131-136`
- **Keyboard navigation:** Roving tabindex across the row (only one button is ever `tabIndex="0"`) — verified on initial state by `'nothing rated: the clear option starts checked, with roving tabindex 0'` and after a selection by `'clicking a star selects it, updates aria-checked/tabindex, and calls onChange'`. ArrowRight/ArrowDown moves to the next option and **wraps around the whole row including the clear option** — `'ArrowRight moves to the next option, wrapping around the whole row (clear included)'`. Home selects the clear option, End selects the last star (with `cancel=true`) — `'Home selects the clear option, End selects the last star'`; with `cancel=false`, Home instead lands on the first star since there's no clear option — `'Home selects the first star (there is no clear option to land on)'`. Arrow-key movement immediately selects the newly focused option (automatic activation). `projects/medra/ui/src/lib/rating/rating.component.ts:172-181,195-225`
- **Screen reader:** Each star button has a descriptive `aria-label` ("1 star"/"2 stars"...), and a custom `clearLabel` is honored — `rating.component.spec.ts` — `'supports a custom clearLabel'`. The group itself is labeled via `ariaLabel` (`'sets aria-label on the group when provided'`) or the auto-generated readonly summary. No `aria-describedby` for external hint/error text found — consistent with there being no `invalid` input at all on this component. `[not covered by tests]`
- **Interaction semantics:** Clicking the already-selected star is a true no-op — `onChange` is not called again and `aria-checked` stays as-is — `'clicking the already-selected star is a no-op (radio semantics, never deselects)'`. Clicking the clear option resets to `null` — `'clicking the clear option resets the rating to null'`. Hovering previews the fill (up to the hovered star) without committing a value, and reverts cleanly on `mouseleave` — `'hovering a star previews the fill without committing a value'`. Disabled state blocks both click and keyboard, and every option gets `aria-disabled="true"` — `'disabled: no interaction happens and every option is aria-disabled'`.

**A11y verdict:** Covered — role/ARIA (`radiogroup`/`radio`/`img`), the full roving-tabindex keyboard matrix (including the wrap-around and `cancel`-dependent Home behavior), radio no-toggle-off semantics, hover-preview isolation from committed value, and disabled-state gating are all directly tested. The only real gap is the well-documented absence of an `invalid`/error state and `aria-describedby`, which is a deliberate design omission rather than an oversight.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `readonly` (not `disabled`) when just displaying an existing rating that isn't being edited — it switches to `role="img"` with a proper text summary instead of fake-looking inert buttons. | Don't use `disabled` for a purely informational rating display — screen readers still see a `radiogroup` of unusable radios rather than a clean image-like summary. |
| Always set `ariaLabel` in interactive mode — it has no auto-generated fallback (only `readonly` mode auto-generates one). | Don't expect an `invalid`/error state — none exists on this component, unlike InputText/Select/etc. |
| Trust that clicking an already-selected star is a genuine no-op (`onChange` doesn't re-fire) — verified by `rating.component.spec.ts` — `'clicking the already-selected star is a no-op (radio semantics, never deselects)'`. | Don't assume ArrowRight/ArrowLeft stop at the row's edges — they wrap around the *entire* row including the clear option when `cancel` is true (`'ArrowRight moves to the next option, wrapping around the whole row (clear included)'`), which changes what Home/End land on depending on `cancel`. |

### Code example (Angular)
```html
<med-rating [cancel]="false" ariaLabel="Rate this product" [(ngModel)]="ratingDemoValue" name="demo-rating" />
<med-rating readonly size="lg" [(ngModel)]="ratingReadonlyDemoValue" name="demo-rating-readonly" />
<med-rating disabled ariaLabel="Disabled example" />
```

### Source
- `projects/medra/ui/src/lib/rating/rating.component.ts`
- `projects/medra/ui/src/lib/rating/rating.styles.ts`
- Usage: `projects/showcase/src/app/app.html:354-367`
