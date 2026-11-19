## Component: Card

### Description
A container primitive (`med-card`, Tier 1 per its doc comment): a rounded surface with an optional title/subtitle and default body content, plus two named projection slots — `[medCardHeader]` (typically a full-bleed image banner, deliberately unstyled/full-bleed rather than padded like the body) and `[medCardFooter]` (an actions row). The footer's border/padding only render when a `medCardFooter` element is actually projected, so an empty divider bar is never drawn under a footer-less card (`card.component.ts:6-13`). Use it as a generic content grouping surface (plan summary, product tile, etc.), not an interactive control.

### Variants
| Variant | When to use |
|---|---|
| Title/subtitle (`title`/`subtitle` set) | Shows an `<h3>` title and/or a subtitle paragraph above the body — `card.component.ts:23-28,40-41` |
| Header slot (`<div medCardHeader>` projected) | Full-bleed banner content above the title/body, unstyled/unpadded by Card itself — `card.component.ts:21`, `card.directives.ts:11-12` |
| Footer slot (`<div medCardFooter>` projected) | Actions row below the body; border/padding only appear when this slot is actually used — `card.component.ts:33-35,44-45,53-55` |
| No footer | No divider/padding drawn at the bottom — `card.component.ts:53-55` |

### Props (Angular Inputs/Outputs)
**`CardComponent` (`med-card`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `title` | `string \| null` | `null` | Optional title text, rendered as `<h3>` — `card.component.ts:40` |
| `subtitle` | `string \| null` | `null` | Optional subtitle text — `card.component.ts:41` |
| `class` | `string` | `''` | Extra classes on the card surface — `card.component.ts:42` |

**Companion structural directives (`card.directives.ts`)**
| Selector | Type | Description |
|---|---|---|
| `[medCardHeader]` | `Directive` | Marks an element to project into the header slot (`<ng-content select="[medCardHeader]">`); also detected via `contentChild` — actually only `CardFooterDirective` is queried by `CardComponent` to compute `hasFooter`, `medCardHeader` is purely a projection marker — `card.component.ts:21,44-45`, `card.directives.ts:11-12` |
| `[medCardFooter]` | `Directive` | Marks an element to project into the footer slot; also queried via `contentChild(CardFooterDirective)` to conditionally render the footer's border/padding — `card.component.ts:33-35,44-45`, `card.directives.ts:14-15` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Rounded surface, border, background, resting shadow — `card.component.ts:47-51` | — |
| Hover | N/A — Card is a static container, not documented/styled as clickable in source | — |
| Focus | N/A — Card renders no focusable element of its own | — |
| Active | N/A — no pressed/active state found | — |
| Disabled | Not implemented | — |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** None found — Card renders a plain `<div>` wrapper with no `role`/`aria-*` attributes of its own; heading semantics come from the real `<h3>` used for `title()` (`card.component.ts:24`). Confirmed by spec: `card.component.spec.ts` — `'renders the title and subtitle when provided'` asserts a real `<h3>` element carries the title text (native heading semantics, no ARIA role needed) and a `<p>` carries the subtitle; `'renders neither heading element when title/subtitle are omitted'` confirms no stray empty `<h3>`/`<p>` is left in the DOM when unused (so screen readers never encounter an empty heading).
- **Keyboard navigation:** None found — Card is not an interactive element. No spec test dispatches any keyboard/click event on the card surface itself — every test asserts structure/content (title/subtitle/body/header/footer projection), consistent with Card being a static, non-interactive container by design.
- **Screen reader:** No `aria-label`/`aria-labelledby` found; relies on the visible `<h3>` title (when provided) for context. Confirmed by spec that the `<h3>` only appears when `title` is actually set (`'renders neither heading element when title/subtitle are omitted'`), so a screen reader never reads a misleading empty heading for title-less cards.

**A11y verdict:** Covered — Card correctly relies on native `<h3>`/`<p>` heading semantics rather than custom ARIA, and its non-interactive nature (no role, no keyboard handling) matches its "static container" design intent; the spec directly confirms the heading only renders when `title` is set, avoiding empty-heading noise for assistive tech.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `[medCardFooter]` for the actions row — it's the only way to get the footer's border/padding to render (`card.component.ts:33-35,53-55`); confirmed by spec `'draws the footer divider/padding only when a medCardFooter element is projected'` and `'does not draw a footer divider when nothing is projected into it'` | Don't expect the header slot to be padded — `[medCardHeader]` content is deliberately full-bleed/unstyled by Card, unlike the body (`card.component.ts:6-13`); confirmed by spec `'projects a medCardHeader element without wrapping it in the padded body'` |
| Use `title`/`subtitle` inputs for the standard heading pattern rather than hand-rolling your own `<h3>` in the default content — keeps consistent typography (`card.component.ts:23-28`) and correct native heading semantics (spec-verified) | Don't treat Card as a clickable/interactive surface — no hover/focus/active states or `role="button"` exist in source, and no spec test wires up any interaction handler |
| Trust default (unslotted) content lands in the padded body — confirmed by spec `'projects default content into the body'` | Don't render your own `<h3>`/`<p>` alongside `title`/`subtitle` inputs — you'll get duplicate headings since Card only omits its own when the inputs are unset, not when you supply your own markup |

### Code example (Angular)
```html
<med-card title="Plan: Pro" subtitle="Renews on Aug 1" class="w-full sm:w-72">
  <p>Unlimited projects, priority support, and advanced analytics.</p>
  <div medCardFooter class="flex justify-end gap-2">
    <button medButton type="button" variant="text" size="sm">Details</button>
    <button medButton type="button" size="sm">Manage</button>
  </div>
</med-card>
```
(Lifted from `projects/showcase/src/app/app.html:728-734`.)

### Source
- `projects/medra/ui/src/lib/card/card.component.ts`
- `projects/medra/ui/src/lib/card/card.directives.ts`
- Showcase usage: `projects/showcase/src/app/app.html:726-738`

### Notes for design-token audit
- Card's resting surface uses `rounded-lg` and `shadow-overlay-sm` together (`card.component.ts:49`): `--radius-lg` is documented in `design-system/01-foundations/borders-radius.md`, and `--shadow-overlay-sm` in `design-system/01-foundations/shadows-elevation.md`. Using an "overlay" shadow token for Card's non-overlay resting elevation is slightly unusual naming-wise (Card is a static, non-floating container, not a popover/dropdown), though visually it is simply the smallest available shadow step — worth a design-token note that `--shadow-overlay-sm` currently doubles as "smallest resting elevation" outside of true overlay contexts.
