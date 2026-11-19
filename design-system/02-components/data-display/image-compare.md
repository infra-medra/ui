## Component: ImageCompare

### Description
ImageCompare is a Tier 4 primitive: a before/after slider — two stacked images, with the top image clipped at `position` (a percentage) via `clip-path: inset(...)` rather than resizing an `overflow: hidden` wrapper, avoiding a layout reflow on every drag frame (`projects/medra/ui/src/lib/image-compare/image-compare.component.ts:6-10`). `position` is a `model()` supporting `[(position)]` two-way binding (`image-compare.component.ts:78`).

Pointer handling mirrors Slider's own track: a single set of listeners lives on the *container* (the host itself, not the handle), so a click anywhere on the image jumps the divider there and dragging can start immediately, with pointer capture on the container for "one element owns the whole gesture" (`image-compare.component.ts:12-19`). The handle (`role="slider"`) carries the real keyboard interaction (Arrow keys step by `step`, Home/End jump to 0/100) — the two stacked `<img>` elements themselves are `aria-hidden` with `draggable="false"`, since this is a comparison control, not a place to drag-save either image (`image-compare.component.ts:20-25`, `:51,53`).

**The host itself is the pointer-tracking container** (no separate wrapper `<div>`) — a deliberate fix, per the component's own doc comment, so a consumer's sizing class (e.g. `h-64 w-full`) always lands on the single element whose geometry the whole component depends on (`image-compare.component.ts:27-37`).

### Variants
| Variant | When to use |
|---|---|
| Default | Interactive drag/keyboard-operable comparison slider |
| `disabled` | Freezes the slider at its current `position`, pointer-events disabled, dimmed opacity (`image-compare.component.ts:79`, `:93`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `beforeSrc` | `string` (required) | — | "Before" image URL, shown clipped on top (`image-compare.component.ts:74`) |
| `afterSrc` | `string` (required) | — | "After" image URL, shown full underneath (`image-compare.component.ts:75`) |
| `beforeAlt` | `string` | `''` | Alt text for the before image (rendered but the `<img>` is `aria-hidden`, `image-compare.component.ts:53,76`) |
| `afterAlt` | `string` | `''` | Alt text for the after image (same `aria-hidden` caveat, `image-compare.component.ts:51,77`) |
| `position` | `model<number>` | `50` | Divider position, 0–100, two-way bindable via `[(position)]` (`image-compare.component.ts:78`) |
| `disabled` | `boolean` | `false` | Disables drag/keyboard interaction (`image-compare.component.ts:79`) |
| `step` | `number` | `1` | Keyboard arrow-key step size (`image-compare.component.ts:80`) |
| `handleAriaLabel` | `string` | `'Comparison position'` | Accessible label for the slider handle (`image-compare.component.ts:82`) |
| `class` | `string` | `''` | Extra classes merged onto the host (`image-compare.component.ts:83`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Divider at `position`%, both images visible split at the clip line (`image-compare.component.ts:52,55,98`) | Draggable via pointer, operable via keyboard on the handle |
| Hover | `cursor-ew-resize` on the whole container (`image-compare.component.ts:93`) | Pointer only |
| Focus | `focus-visible:ring-(--focus-ring-width)` + `ring-brand-500` on the handle (`image-compare.component.ts:64`) | Keyboard-visible focus ring on the `role="slider"` handle |
| Active (dragging) | Handle follows pointer position, clamped to `step` (`image-compare.component.ts:106-120`) | Pointer capture set on the host for the duration of the drag |
| Disabled | `pointer-events-none opacity-(--opacity-disabled)`, handle `tabIndex=-1`, `aria-disabled="true"` (`image-compare.component.ts:58,63,93`) | Not interactive — pointer/keydown handlers no-op when `disabled` (`image-compare.component.ts:112-115,133-136`) |
| Loading | Not implemented — no loading/skeleton state for the two images | — |
| Error (broken image) | **Resolved 2026-08-19.** Both `beforeSrc`/`afterSrc` `<img>` elements now have an `(error)` handler, independently tracked per-URL (same "track the failed URL, retry on `src` change" technique as `Image`/`Avatar`) — a failed image swaps to a `photo` fallback icon on a neutral background, sized to fill the same box so the slider's drag math is unaffected | — |

### Accessibility
- **Role/ARIA:** The handle has `role="slider"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `[attr.aria-valuenow]="position()"`, `[attr.aria-label]="handleAriaLabel()"`, and `[attr.aria-disabled]` when disabled (`image-compare.component.ts:69-76`). Default `aria-valuenow` is verified by `image-compare.component.spec.ts — 'defaults position to 50, reflected in the handle aria-valuenow'` (:66-69). Both `<img>` elements are `aria-hidden="true"` and `draggable="false"`, verified together by `spec.ts — 'both images are aria-hidden and not draggable — this is a comparison control, not a place to drag-save either image'` (:150-155). `[not covered by tests]`: `aria-valuenow` updating live as `position` changes via keyboard/drag is only implied by the Angular binding (`image-compare.component.ts:73`) — every keyboard/drag test asserts `fixture.componentInstance.position`, not the handle's `aria-valuenow` attribute after the interaction; likewise `aria-disabled="true"` in the `disabled` state is asserted only via `tabindex="-1"` and no-op behavior (`spec.ts:139-148`), not the `aria-disabled` attribute itself.
- **Keyboard navigation:** ArrowRight/ArrowUp increases `position` by `step`, ArrowLeft/ArrowDown decreases it, verified by `spec.ts — 'ArrowRight/ArrowLeft step the position on the handle'` (:118-127, with a custom `step=5`). Home jumps to 0, End jumps to 100, verified by `spec.ts — 'Home/End jump to 0/100'` (:129-137). All input is a no-op when `disabled`, and the handle itself is removed from the tab order (`tabindex="-1"`), verified by `spec.ts — 'disabled: pointer and keyboard input have no effect, handle is not tabbable'` (:139-148) — both the pointer path (`pointerdown`) and the keyboard path (`ArrowRight`) are exercised in the same test.
- **Screen reader:** `handleAriaLabel` (default `'Comparison position'`) plus `aria-valuenow` on the slider role communicate current position. The two images themselves have no accessible text (`aria-hidden`), a deliberate choice reasoned in the component's own doc comment (`image-compare.component.ts:23-25`) and confirmed by `spec.ts:150-155`. Broken-image recovery is independent per image, verified by `spec.ts — 'shows a placeholder icon instead of the "after" image once it fails to load, independent of "before"'` (:157-166) and its "before" counterpart (:168-177) — each fallback icon has no text label of its own, same open question as Image/Avatar's fallback icon.
- **A11y verdict:** Covered — the slider role's static attributes, both keyboard paths (Arrow/Home/End), the disabled no-op guard, and per-image `aria-hidden`/broken-image fallback are all directly exercised by tests; only the live `aria-valuenow`/`aria-disabled` attribute updates after an interaction go unasserted (implied by the Angular binding, not independently checked).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Size the component via a `class` on the element itself (e.g. `h-64 w-full`) — the host is the sized box | Wrapping it in an extra sizing `<div>` expecting the component's own geometry to follow — the host itself owns `relative`/`overflow-hidden` |
| Set `handleAriaLabel` to something contextual (e.g. "Before/after comparison") when multiple instances exist on a page | Leaving the default generic label across several instances on the same page |
| Trust that `disabled` fully guards both input paths at once — `image-compare.component.spec.ts:139-148` exercises pointerdown and ArrowRight in the same assertion, both no-ops | Assume `disabled` only blocks one input modality (e.g. keyboard) and needs a separate guard for pointer input — one `disabled` input covers both |
| Set both `beforeAlt`/`afterAlt` for documentation/DOM completeness even though they render `aria-hidden` — future non-`aria-hidden` reuse of these `<img>`s would then already carry correct alt text | Skip `beforeAlt`/`afterAlt` reasoning "it's aria-hidden anyway" — they cost nothing and the images may not stay aria-hidden forever |

### Code example (Angular)
```html
<med-image-compare
  [beforeSrc]="imageCompareBeforeSrc"
  [afterSrc]="imageCompareAfterSrc"
  beforeAlt="Before"
  afterAlt="After"
  [(position)]="imageCompareDemoPosition"
  class="h-64 w-full max-w-md rounded-lg"
/>
```
(from `projects/showcase/src/app/app.html:1242-1249`)

### Source
- `projects/medra/ui/src/lib/image-compare/image-compare.component.ts`

### Known issue — resolved 2026-08-19
The slider handle uses `shadow-overlay-md` (`image-compare.component.ts:64`); `--shadow-overlay-md` is now defined in `tailwind-theme-medraui.css` (interpolated between `-sm`/`-lg`), so the handle renders a real shadow again instead of silently none.
