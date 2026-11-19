## Component: Galleria

### Description
Galleria is a Tier 4 primitive: a large main image with a synchronized thumbnail strip (`projects/medra/ui/src/lib/galleria/galleria.component.ts:8`). It is a deliberately different composite shape than `Carousel` (one item template panning through a viewport) and is not built on top of it (`galleria.component.ts:8-10`). The main view reuses `ImageComponent` directly with `preview` set, so clicking the large image opens the same full-screen zoom overlay every other `<med-image preview>` uses — broken-image fallback/retry comes along for free too (`galleria.component.ts:10-15`, `:53`).

`activeIndex` is a `model()` (`[(activeIndex)]`), the same two-way-bindable "current position" pattern Carousel/Tabs already use (`galleria.component.ts:17-18`, `:81`). Prev/Next button visual treatment deliberately matches Carousel's own (translucent round button over the image, absolutely positioned) — same role, same look (`galleria.component.ts:18-21`).

**`class` sizes the whole component (host)**, not just the main image box — an earlier version routed `class` only to the main-image `<div>`, causing thumbnails to overflow past the component's own footprint; fixed by making the host the sized box and the main image `flex-1` inside it (`galleria.component.ts:23-36`, `:49,91`).

**Scope cut for v1**: no autoplay, no full-screen "lightbox" mode distinct from `ImageComponent`'s own per-image preview overlay (`galleria.component.ts:38-42`).

### Variants
| Variant | When to use |
|---|---|
| Default (`showThumbnails=true`) | Main image + thumbnail strip below it (`galleria.component.ts:82`, `:68-76`) |
| `showThumbnails=false` | Main image only, no thumbnail row (`galleria.component.ts:82`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly GalleriaItem[]` | `[]` | `{ src, thumbnailSrc?, alt? }[]` — `thumbnailSrc` falls back to `src` when omitted (`galleria.component.ts:80`, `galleria.types.ts:1-6`) |
| `activeIndex` | `model<number>` | `0` | Currently shown item index, two-way bindable (`galleria.component.ts:81`) |
| `showThumbnails` | `boolean` | `true` | Shows/hides the thumbnail strip (`galleria.component.ts:82`) |
| `previousLabel` | `string` | `'Previous image'` | Accessible label for the prev button (`galleria.component.ts:84`) |
| `nextLabel` | `string` | `'Next image'` | Accessible label for the next button (`galleria.component.ts:85`) |
| `thumbnailsAriaLabel` | `string` | `'Image thumbnails'` | `aria-label` for the thumbnail `role="tablist"` (`galleria.component.ts:86`, `:69`) |
| `class` | `string` | `''` | Sizes the whole component (host), not just the main image (`galleria.component.ts:87`, `:23-36`, `:91`) |

Navigation is circular: `prev()`/`next()` wrap around via modulo arithmetic (`galleria.component.ts:101-109`) — unlike Carousel, which clamps at the edges.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Main image + thumbnail strip; active thumbnail has `border-brand-500` (`galleria.component.ts:93-98`) | Prev/Next buttons and thumbnail clicks change `activeIndex` |
| Hover (nav buttons) | `hover:bg-surface-100`/`dark:hover:bg-surface-800` on the round nav buttons (`galleria.component.ts:57,62`) | Pointer only |
| Hover (thumbnails) | Inactive thumbnails go from `opacity-70` to `opacity-100` on hover (`galleria.component.ts:97`) | Pointer only |
| Focus | `focus-visible:ring` on thumbnail buttons (`galleria.component.ts:96`); nav prev/next buttons have no explicit `focus-visible:ring` classes found (`galleria.component.ts:56,61`) | Keyboard-reachable via Tab (native `<button>` elements) |
| Active (current item) | Active thumbnail: `border-brand-500 dark:border-brand-400`, full opacity; others: `border-transparent opacity-70` (`galleria.component.ts:97`) | `aria-selected` set on the active tab (`galleria.component.ts:71`) |
| Disabled | Not implemented — no `disabled` input | — |
| Loading | Not implemented at the Galleria level — falls to `ImageComponent`'s own broken-image handling for the main image | — |
| Error (broken main image) | Falls through to `ImageComponent`'s fallback icon (see `image.md`) since Galleria reuses `<med-image preview>` for the main view (`galleria.component.ts:53`) | — |
| Error (broken thumbnail) | **Resolved 2026-08-19.** Thumbnail `<img>` now has an `(error)` handler; a failed thumbnail swaps to the same `photo` fallback icon `ImageComponent` uses, tracked per-URL so switching `src` always retries (`galleria.component.ts` — `thumbFailed`/`onThumbError`) | — |

### Accessibility
- **Role/ARIA:** Thumbnail strip uses `role="tablist"` with `[attr.aria-label]="thumbnailsAriaLabel()"`, each thumbnail button has `role="tab"` and `[attr.aria-selected]` (`galleria.component.ts:69,71`) — the selected-state binding is verified by `galleria.component.spec.ts — 'marks the active thumbnail with aria-selected'` (:63-67, asserts all three tabs' `aria-selected` values in one pass, not just the active one). Prev/Next buttons have `[attr.aria-label]`, verified indirectly since the spec locates them purely by that label (`spec.ts — navButton()` helper, :34-36, used throughout). Both nav buttons are absent entirely for a single-item gallery, verified by `spec.ts — 'hides prev/next nav when there is only one item'` (:138-142).
- **Keyboard navigation:** **Resolved 2026-08-19.** Thumbnail buttons use roving `tabIndex` (only the active thumbnail is `0`, rest `-1`), verified by `galleria.component.spec.ts — 'roving tabindex: only the active thumbnail is in the tab order'` (:88-92). ArrowRight/ArrowLeft move focus and switch the active image, wrapping at the ends, verified by `spec.ts — 'ArrowRight/ArrowLeft move focus and switch the active image, wrapping at the ends'` (:94-106) — this test specifically asserts `focus()` was actually called on the newly-active thumbnail (via `jest.spyOn`), not just that `activeIndex` changed, which is the detail that makes this real WAI-ARIA APG Tabs "roving tabindex" behavior rather than just an index update. Home/End jump to the first/last thumbnail, verified by `spec.ts — 'Home/End jump to the first/last thumbnail'` (:108-118). Prev/Next buttons are plain native `<button>`s (Tab + Enter/Space); their wraparound behavior at both ends is verified by `spec.ts — 'Next/Previous wrap around at the ends'` (:77-86), but as `.click()` calls, so keyboard-specific (Enter/Space) activation of the nav buttons themselves is `[not covered by tests]` (relies on native button semantics rather than a dedicated keydown test, unlike the thumbnails' explicit `onThumbKeydown`).
- **Screen reader:** `previousLabel`/`nextLabel`/`thumbnailsAriaLabel` provide names for controls. Each item's `alt` (falling back to `''`) is passed to the main `<med-image>`; the main image itself switches correctly on both thumbnail click and nav-button click, verified by `spec.ts — 'clicking a thumbnail sets activeIndex'` (:69-75) and `'shows the active item as the main image'` (:50-53). Thumbnail `thumbnailSrc`-vs-`src` fallback is verified by `spec.ts — 'renders one thumbnail per item, using thumbnailSrc when provided and falling back to src otherwise'` (:55-61). Broken-thumbnail fallback is per-item and doesn't affect siblings, verified by `spec.ts — 'shows a placeholder icon instead of a broken thumbnail image after it fails to load'` (:120-131, explicitly checks the unaffected sibling still renders its `<img>`).
- **A11y verdict:** Covered — the tablist/tab roles, roving-tabindex focus management (including the actual `focus()` call), all three keyboard paths (Arrow/Home/End), aria-selected state, and per-thumbnail broken-image fallback are all directly exercised by tests; only keyboard-specific activation of the plain-`<button>` prev/next controls relies on native semantics rather than a dedicated test.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Size Galleria via `class` on the component itself (e.g. `h-64`) — it sizes the whole widget including thumbnails | Assuming `class` only affects the main image box |
| Provide `alt` per `GalleriaItem` for meaningful accessible descriptions of each image | Leaving `alt` unset across all items |
| Rely on the roving-tabindex thumbnail strip for keyboard users — Arrow/Home/End are all regression-tested (`galleria.component.spec.ts:88-118`) | Add a custom `keydown` listener around Galleria expecting to intercept thumbnail Arrow keys — `onThumbKeydown` already owns that behavior on each tab |
| Omit `thumbnailSrc` when a smaller variant doesn't exist — it correctly falls back to `src` (`spec.ts:55-61`) | Duplicate `src` into `thumbnailSrc` manually "just in case" — the fallback already handles it |

### Code example (Angular)
```html
<med-galleria [items]="galleriaItems" class="h-64 max-w-md" />
```
(from `projects/showcase/src/app/app.html:1255`)

### Source
- `projects/medra/ui/src/lib/galleria/galleria.component.ts`
- `projects/medra/ui/src/lib/galleria/galleria.types.ts`
