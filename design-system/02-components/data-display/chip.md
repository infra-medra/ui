## Component: Chip

### Description
Chip is a Tier 2 primitive: a small pill representing an entity (`projects/medra/ui/src/lib/chip/chip.component.ts:6`). Label content is projected via `<ng-content />`, same convention as Tag/Badge, so consumers can put rich content inside it rather than passing a `label` string (`chip.component.ts:9`). It supports an optional leading `image` (avatar-style, bleeding to the pill's edge) or `icon` — `image` takes priority over `icon` when both are set, the same fallback order as Avatar (`chip.component.ts:10-11`, `:28-32`). An optional `removable` mode adds a trailing remove `<button>`.

**Reduced v1 scope**, per the component's own doc comment: the removable chip itself is not a focusable widget with its own Backspace/Enter handling — only the explicit remove button is interactive, the same native-button-only pattern used for Select's clear button and Message's close button (`chip.component.ts:13-18`).

### Variants
| Variant | When to use |
|---|---|
| Plain (default) | A static entity pill with projected text only |
| With `icon` | Prefixed with a small icon (`chip.component.ts:30-32`) |
| With `image` | Prefixed with an avatar-style image, bleeding to the pill edge (`chip.component.ts:28-29`, `:61`) |
| `removable` | Adds a trailing remove `<button>` that emits `removed` (`chip.component.ts:34,51`, `:34-43`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `icon` | `string \| null` | `null` | Leading icon name, ignored if `image` is set (`chip.component.ts:48`, `:28-32`) |
| `image` | `string \| null` | `null` | Leading image URL, takes priority over `icon` (`chip.component.ts:49`) |
| `imageAlt` | `string` | `''` | Alt text for `image` (`chip.component.ts:50`) |
| `removable` | `boolean` | `false` | Shows a trailing remove button (`chip.component.ts:51`) |
| `removeLabel` | `string` | `'Remove'` | Accessible label for the remove button (`chip.component.ts:53`) |
| `class` | `string` | `''` | Extra classes merged onto the inner `<span>` (`chip.component.ts:54`) |
| `removed` | `output<void>` | — | Emitted when the remove button is clicked (`chip.component.ts:56`, `:39`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Rounded pill, `bg-surface-100`/`dark:bg-surface-800` (`chip.component.ts:60`) | — |
| Hover (remove button only) | `hover:bg-surface-200`/`hover:text-surface-700` on the remove button (`chip.component.ts:37`) | Pointer only, and only on the remove button, not the chip body |
| Focus | **Resolved 2026-08-19.** The remove `<button>` now has an explicit `focus-visible:ring-(--focus-ring-width)` (brand-colored, with offset), matching the rest of the library instead of relying on the browser default (`chip.component.ts`) | Native button focus |
| Active | N/A on chip body — only the remove button is interactive | N/A |
| Disabled | N/A — no `disabled` input on Chip itself | N/A |
| Loading | Not implemented | — |
| Error | N/A | — |

### Accessibility
- **Role/ARIA:** The remove button has `[attr.aria-label]="removeLabel()"` (`chip.component.ts:38`), verified by `chip.component.spec.ts — 'shows a remove button, labeled by removeLabel, when removable'` (:72-80, asserts the default label is exactly `'Remove'`) and `'applies a custom removeLabel'` (:82-89). The chip body itself (`<span>`) has no `role`. No remove button renders at all unless `removable` is set, verified by `spec.ts — 'has no remove button by default'` (:67-70).
- **Keyboard navigation — resolved 2026-08-19:** Only the remove button is a real interactive element (native `<button type="button">`, `chip.component.ts:35-42`), reachable via Tab + activatable with Enter/Space by native browser semantics — the chip body is not itself focusable/keyboard-operable, a deliberate v1 scope cut (`chip.component.ts:13-18`). Investigated whether this is genuinely keyboard-operable or just an untested claim: dispatching a `KeyboardEvent('keydown', { key: 'Enter' | ' ' })` directly at a native `<button>` does **not** produce a `click` in this repo's jsdom test environment (verified empirically — jsdom doesn't implement the browser's native keydown-to-click activation translation), so a literal keydown-dispatch assertion would be untestable/misleading here, the same category of jsdom gap Fieldset's disabled-cascade test already documents. Instead, `chip.component.spec.ts — 'the remove button is a genuine keyboard-activatable native <button> (Wave 2 fix — 2026-08-19)'` directly asserts the actual preconditions that make native Enter/Space activation work in a real browser: `tagName === 'BUTTON'` (not a `role="button"` div), `type === 'button'` (so Space/Enter never triggers an implicit form submit as a side effect), `tabIndex === 0` (in the tab order), and `disabled === false`.
- **Screen reader:** `removeLabel` (default `'Remove'`) is announced for the remove button, per the aria-label tests above; `imageAlt` provides alt text for the leading image, verified by `spec.ts — 'shows the image, with alt text, when set'`. Image takes priority over icon when both are set, verified by `spec.ts — 'prefers the image over the icon when both are set'`, so a screen reader never gets a redundant icon alongside an already-described image.
- **Focus — resolved 2026-08-19:** the remove button's `focus-visible:ring-(--focus-ring-width)` (`chip.component.ts:37`) now has a dedicated class-assertion regression test: `chip.component.spec.ts — 'the remove button has the focus-visible ring class (Wave 2 fix — 2026-08-19)'` asserts both the ring-width and `ring-brand-500` classes are present in the rendered `className`.

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: the remove button's labeling, conditional rendering, and click-driven `removed` emission remain directly tested as before; keyboard-specific activation is now verified via the native-button-preconditions test (the most that's meaningfully testable given jsdom's lack of native keydown-to-click translation), and the focus-visible ring class now has its own regression test.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set a descriptive `removeLabel` when multiple removable chips exist on a page (e.g. include the chip's own label) so each remove button is distinguishable to screen readers | Leaving all removable chips with the generic default `'Remove'` label when several appear together |
| Use `image` for avatar-style leading content and `icon` for symbolic content — not both (image wins if both are set) | Setting both `image` and `icon` expecting the icon to show |
| Subscribe to `removed` and remove the item from your own data model — Chip does not remove itself, confirmed by `chip.component.spec.ts:91-102` (the click only emits; the chip stays in the DOM) | Assume clicking the remove button makes the chip disappear on its own — the consumer must react to `removed` |

### Code example (Angular)
```html
<med-chip>Angular</med-chip>
<med-chip icon="calendar">Due Friday</med-chip>
<med-chip [image]="chipAvatarImage" imageAlt="Jane Doe">Jane Doe</med-chip>
<med-chip removable (removed)="removeChipSkill(skill)">{{ skill }}</med-chip>
```
(from `projects/showcase/src/app/app.html:1022-1024,1030`)

### Source
- `projects/medra/ui/src/lib/chip/chip.component.ts`
