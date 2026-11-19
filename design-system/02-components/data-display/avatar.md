## Component: Avatar

### Description
Avatar is a Tier 1 primitive representing a person/entity as a small circular (or square) badge (`projects/medra/ui/src/lib/avatar/avatar.component.ts:14`). It has a three-level fallback priority, documented directly in the component's own doc comment: `image` (until it fails to load, then falls through) → `label` (rendered as up to 2 uppercase initials) → a generic `user` icon (`avatar.component.ts:8-11`). `severity` only colors the solid background used by the label/initials or icon fallback — it has no effect once a real image is showing (`avatar.component.ts:11`, `:60`).

### Variants
| Variant | When to use |
|---|---|
| `shape="circle"` (default) | Standard person avatar (`rounded-full`, `avatar.styles.ts:19`) |
| `shape="square"` | Entity/team avatar or any context wanting a rounded-rect (`rounded-md`, `avatar.styles.ts:20`) |
| `size="sm" \| "default" \| "lg" \| "xl"` | Scale from 32px to 64px (`avatar.styles.ts:4-9`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `image` | `string \| null` | `null` | Image URL; on load error falls through to the initials/icon fallback (`avatar.component.ts:32`, `:66-68`) |
| `alt` | `string` | `''` | Alt text for the `<img>` (`avatar.component.ts:33`) |
| `label` | `string \| null` | `null` | Source text for the initials fallback — first + last word's first letter, uppercased (`avatar.component.ts:34`, `:43-51`) |
| `severity` | `ButtonSeverity` (`'primary' \| 'secondary' \| 'info' \| 'success' \| 'warn' \| 'help' \| 'danger' \| 'contrast'`) | `'secondary'` | Colors the solid background for the label/icon fallback only, via `SOLID_SEVERITY_BG` (`avatar.component.ts:2`, `:35`, `:60`) |
| `size` | `'sm' \| 'default' \| 'lg' \| 'xl'` | `'default'` | Overall size + icon size scale (`avatar.component.ts:36`, `avatar.styles.ts:1,4-16`) |
| `shape` | `'circle' \| 'square'` | `'circle'` | Corner shape (`avatar.component.ts:37`, `avatar.styles.ts:2,18-21`) |
| `class` | `string` | `''` | Extra classes merged onto the inner container (`avatar.component.ts:38`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Image, or solid severity-colored background with initials/icon | — |
| Hover | N/A — not implemented, purely a static display element | N/A |
| Focus | N/A — not implemented (no interactive element, no `tabindex`) | N/A |
| Active | N/A | N/A |
| Disabled | N/A — no `disabled` input found | N/A |
| Loading | Not implemented — no loading/skeleton state | — |
| Error (broken image) | Falls back to initials (if `label` set) or a generic `user` icon on a solid severity-colored background (`avatar.component.ts:21-27`, `:40-41`, `:66-68`) | Retried automatically if `image` changes to a new URL (comparison is against the specific failed URL, `avatar.component.ts:41`) |

### Accessibility
- **Role/ARIA:** When showing the fallback background (no image, or image failed), the container gets `[attr.aria-label]` set to `label() || alt() || null` via the `fallbackAriaLabel` computed (`avatar.component.ts:20,45-46`) — verified by `avatar.component.spec.ts — 'sets aria-label to the label when showing a fallback'`. When a real image is shown, no extra `aria-label` is added — the `<img alt>` carries the accessible name instead, verified by `avatar.component.spec.ts — 'does not set aria-label on the container when an image is showing (the <img> alt already covers it)'`.
- **Keyboard navigation:** None found — Avatar is not a focusable/interactive element (no `tabindex`, no keydown handlers in `avatar.component.ts`), and the spec has no keyboard tests, consistent with it being a static display primitive.
- **Screen reader:** Image case relies on `[alt]`, verified by `avatar.component.spec.ts — 'renders an <img> when image is set'` (asserts `img.alt`). Fallback case relies on the computed `aria-label` (label or alt). Broken-image recovery is also verified: `avatar.component.spec.ts — 'falls back to initials when the image fails to load'` and `'recovers once a new (different) image URL is set after a failure'` confirm the `<img>` is removed from the DOM (not just visually hidden) once it errors, so assistive tech never reads a broken-image placeholder.
- **All-defaults "no accessible name" state — resolved 2026-08-19:** with zero props set (no `image`, no `label`, no `alt`), the container now gets `aria-hidden="true"` via the `isDecorative` computed (`avatar.component.ts:20,47-48`) — since there is genuinely no identifying information to announce in that exact state, hiding it from assistive tech avoids an unlabeled, confusing stop, rather than inventing a generic placeholder string. Any real `label` or `alt` still produces a real `aria-label` as before and is never `aria-hidden`. Confirmed by `avatar.component.spec.ts` — `'is marked aria-hidden when there is no image, label, or alt at all (Wave 2 fix — 2026-08-19)'`, `'is not aria-hidden once a label is set, even with no image'`, `'is not aria-hidden once alt is set, even with no label'`.

**A11y verdict:** Covered — **the all-defaults "no name" gap resolved 2026-08-19**: the previously-untested no-accessible-name state is now both fixed (decorative-by-default via `aria-hidden`) and spec-verified; the fallback-priority and error-recovery paths remain directly exercised by tests as before.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Provide `label` (a full name) so the fallback shows meaningful initials and an accessible name | Rely on the all-defaults state (no `image`/`alt`/`label`) to be announced to screen readers — it's now deliberately `aria-hidden`, since there's nothing to say |
| Use `severity` to convey status via the fallback background color (e.g. `success` for "online") | Expecting `severity` to visibly affect anything once a real image loads — it's fallback-only |
| Pass a `label` even when `image` is set, as a safety net — spec confirms a broken image cleanly falls through to initials with no manual retry logic needed | Assume a failed `image` needs app-level error handling — the component already tracks the failed URL itself (`avatar.component.ts:40-41`) and self-heals if the URL changes |

### Code example (Angular)
```html
<med-avatar label="Jane Doe" />
<med-avatar label="Ada Lovelace" severity="info" shape="square" />
<med-avatar size="lg" severity="success" label="OK" />
<med-avatar size="xl" image="https://broken-image-url.example/none.png" label="Fallback" />
```
(from `projects/showcase/src/app/app.html:717-721`)

### Source
- `projects/medra/ui/src/lib/avatar/avatar.component.ts`
- `projects/medra/ui/src/lib/avatar/avatar.styles.ts`
