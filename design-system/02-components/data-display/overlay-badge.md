## Component: OverlayBadge

### Description
OverlayBadge (Tier 3) is the positioning wrapper that overlays a small `Badge` on a corner of whatever it wraps, e.g. `<med-overlay-badge value="5"><med-icon name="bell" /></med-overlay-badge>` (`projects/medra/ui/src/lib/overlay-badge/overlay-badge.component.ts:14-20`). It composes `BadgeComponent` directly (`imports: [BadgeComponent]`, `overlay-badge.component.ts:49,55`) rather than reimplementing badge styling — OverlayBadge only adds corner positioning and a separating ring around the composed badge. The wrapped content is projected via `<ng-content />` and the host is `position: relative` so the badge can be absolutely positioned against it (`overlay-badge.component.ts:51,53`).

`value` is treated as plain data (a count/status), not owned UI text — the visible digit is rendered `aria-hidden`, and an optional `badgeAriaLabel` renders as a separate `sr-only` span (`overlay-badge.component.ts:24-31`, `:57-60`).

### Variants
| Variant | When to use |
|---|---|
| Value badge (default) | Shows a count/short value (`value` input), e.g. notification count (`overlay-badge.component.ts:67`, `:57`) |
| `dot` | Contentless status dot overlay, e.g. "online" indicator (`overlay-badge.component.ts:70`, `:56`) |
| `position` (`'top-right'` default, `'top-left'`, `'bottom-right'`, `'bottom-left'`) | Which corner the badge sits on (`overlay-badge.component.ts:7-12`, `:71`) |
| `hidden` | Suppresses the badge entirely (e.g. a count of 0) while still rendering wrapped content (`overlay-badge.component.ts:72-73`, `:54`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| number \| null` | `null` | Badge content, rendered `aria-hidden` (`overlay-badge.component.ts:67`, `:57`) |
| `severity` | `ButtonSeverity` | `'danger'` | Badge color — note this differs from plain `Badge`'s own default of `'primary'` (`overlay-badge.component.ts:68`; compare `badge.component.ts:33`) |
| `size` | `BadgeSize` (`'sm' \| 'default' \| 'lg'`) | `'sm'` | Badge size — deliberately smaller than Badge's own `'default'`, documented as avoiding a wide `"99+"` value swallowing small wrapped icon content (`overlay-badge.component.ts:33-39`, `:69`) |
| `dot` | `boolean` | `false` | Renders a dot instead of a value badge (`overlay-badge.component.ts:70`) |
| `position` | `OverlayBadgePosition` | `'top-right'` | Corner placement (`overlay-badge.component.ts:71`, `overlay-badge.types.ts:1`) |
| `hidden` | `boolean` | `false` | Hides the badge, keeps wrapped content (`overlay-badge.component.ts:73`) |
| `badgeAriaLabel` | `string \| null` | `null` | Optional `sr-only` accessible announcement for the badge (`overlay-badge.component.ts:74`) |
| `class` | `string` | `''` | Extra classes merged onto the badge (not the host) (`overlay-badge.component.ts:75`, `:77-79`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Badge positioned on the specified corner, with a ring separating it from wrapped content | — |
| Hover | N/A — static, non-interactive | N/A |
| Focus | N/A | N/A |
| Active | N/A | N/A |
| Disabled | N/A — no `disabled` input | N/A |
| `hidden` | Badge not rendered; wrapped content still shows | Controlled by the `hidden` input |
| Loading | Not implemented | — |
| Error | N/A | — |

Ring styling: `ring-2` in value/count mode vs. `ring-1` in `dot` mode — documented as intentional: a small 6px `sm`-size dot would otherwise be visually swallowed by a ring proportioned for the larger value badge (`overlay-badge.component.ts:41-44`, `:78`).

### Accessibility
- **Role/ARIA:** The badge's visible value is `aria-hidden="true"` (`overlay-badge.component.ts:57`), verified by `overlay-badge.component.spec.ts — 'shows the badge with the given value, hidden from AT by default'` (:44-48, asserts the text lives inside `span[aria-hidden="true"]`) and `'omits the value text in dot mode'` (:50-53, confirms no `aria-hidden` span at all in dot mode since there's no value to hide). An optional `badgeAriaLabel` renders as an `sr-only` `<span>` alongside it (`overlay-badge.component.ts:59-61`), verified by `spec.ts — 'renders an sr-only announcement when badgeAriaLabel is provided'` (:67-71) and its converse `'renders no sr-only span when badgeAriaLabel is not provided (purely decorative)'` (:73-76) — both branches of the opt-in are directly tested. Left unset, the badge is purely decorative to assistive tech — documented as correct when meaning is already carried by context (e.g. next to a "Cart" label) but wrong for a bare icon (`overlay-badge.component.ts:24-31`).
- **Keyboard navigation:** None found — OverlayBadge itself is not interactive; wrapped content (if a button/icon) carries its own keyboard behavior independently. No keyboard tests in the spec.
- **Screen reader:** Use `badgeAriaLabel` (e.g. `"5 unread notifications"`) whenever the wrapped content alone doesn't convey the badge's meaning; `hidden` fully removes `<med-badge>` from the DOM rather than just hiding it visually, verified by `spec.ts — 'is hidden entirely when hidden is true, without removing the wrapped content'` (:55-59), so a screen reader never encounters a stray empty badge.
- **A11y verdict:** Covered — both the `aria-hidden` value path and the opt-in `badgeAriaLabel`/`sr-only` path are exercised by dedicated tests in both their present and absent states (`overlay-badge.component.spec.ts:44-76`); the only residual risk is a consumer forgetting to set `badgeAriaLabel`, which is a usage error rather than an implementation gap.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `badgeAriaLabel` when wrapping a bare icon with no other accessible context | Leaving a bare-icon + count badge with no `badgeAriaLabel` — screen reader users get no announcement of the count |
| Use `hidden` (not conditionally removing the component) to represent a zero/empty count while still rendering the wrapped icon | Manually toggling `*ngIf` on the whole component just to hide a zero count |
| Trust the default `sm` size and `ring-1`/`ring-2` split for overlaying icon-scale content — both are regression-tested (`overlay-badge.component.spec.ts:81-97`) against a specific past bug (a wide value pill swallowing a small icon, and a thick ring swallowing a small dot) | Override `size` to `'default'`/`'lg'` on icon-scale wrapped content without checking it doesn't recreate the swallowed-icon regression the `sm` default exists to prevent |

### Code example (Angular)
```html
<med-overlay-badge value="5" badgeAriaLabel="5 unread notifications">
  <med-icon name="bell" class="size-6 text-surface-600 dark:text-surface-300" />
</med-overlay-badge>
<med-overlay-badge dot severity="success">
  <med-avatar label="Jane Doe" />
</med-overlay-badge>
<med-overlay-badge value="99+" severity="info">
  <med-icon name="star" variant="solid" class="size-6 text-warn-500" />
</med-overlay-badge>
<med-overlay-badge [value]="0" [hidden]="true">
  <med-icon name="bell" class="size-6 text-surface-600 dark:text-surface-300" />
</med-overlay-badge>
```
(from `projects/showcase/src/app/app.html:1337-1348`)

### Source
- `projects/medra/ui/src/lib/overlay-badge/overlay-badge.component.ts`
- `projects/medra/ui/src/lib/overlay-badge/overlay-badge.types.ts`
- `projects/medra/ui/src/lib/badge/badge.component.ts` (composed internally)
