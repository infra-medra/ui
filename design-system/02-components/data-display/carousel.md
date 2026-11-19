## Component: Carousel

### Description
Carousel is a Tier 3 primitive: pages through a `T[]`, `numVisible` items at a time, sliding via a CSS `transform: translateX(...)` track (`projects/medra/ui/src/lib/carousel/carousel.component.ts:17-18`). Item markup is entirely consumer-templated via a single projected `<ng-template let-item>` (`NgTemplateOutlet`) — the same per-item projection pattern `DataView` established for arbitrary item content, as opposed to Select's fixed option shape (`carousel.component.ts:18-22`, `:123`).

**No circular/infinite looping for v1**: prev/next clamp at the edges rather than the clone-the-edge-items trick real seamless looping needs (`carousel.component.ts:24-28`, `:134-135,156-162`). Autoplay *does* wrap back to the first page when it reaches the end, but that's just resetting the index to 0, not seamless sliding (`carousel.component.ts:28-30`, `:172-175`).

**Autoplay pauses via an explicit, always-visible toggle button, not hover/focus**: documented explicitly as avoiding the WCAG 2.2.2 (Pause, Stop, Hide) failure mode where hover-only pausing leaves keyboard/touch users with no way to stop auto-advancing content (`carousel.component.ts:32-37`, `:95-99`).

The last page always shows a full `numVisible` items — `firstIndex` clamps at `value().length - numVisible`, so the last item always lines up with the track's right edge rather than leaving a trailing partial page (`carousel.component.ts:39-43`, `:129`).

### Variants
| Variant | When to use |
|---|---|
| Static (`autoplayInterval=null`, default) | Manual prev/next/page-dot navigation only; no pause/play toggle renders (`carousel.component.ts:113`, `:95-99`) |
| Autoplay (`autoplayInterval` set) | Auto-advances every N ms; renders a play/pause toggle button (`carousel.component.ts:95-99,113,142-149`) |
| `numVisible` / `numScroll` | Controls how many items show at once and how many advance per prev/next click (`carousel.component.ts:108-110`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly T[]` | `[]` | Items to page through (`carousel.component.ts:107`) |
| `numVisible` | `number` | `1` | Items shown at once (`carousel.component.ts:108`) |
| `numScroll` | `number \| null` | `null` (falls back to `numVisible`) | Items prev/next advances by (`carousel.component.ts:109-110`, `:128`) |
| `showIndicators` | `boolean` | `true` | Shows the page-dot indicators (`carousel.component.ts:111`, `:79`) |
| `autoplayInterval` | `number \| null` | `null` | Milliseconds between auto-advances; `null` disables autoplay and hides the toggle button entirely (`carousel.component.ts:112-113`, `:95`) |
| `ariaLabel` | `string` | `'Carousel'` | `aria-label` on the `role="region"` wrapper (`carousel.component.ts:116`, `:52`) |
| `previousLabel` | `string` | `'Previous slide'` | Prev button label (`carousel.component.ts:117`) |
| `nextLabel` | `string` | `'Next slide'` | Next button label (`carousel.component.ts:118`) |
| `goToLabel` | `string` | `'Go to page'` | Prefix for each page-dot's `aria-label` (`carousel.component.ts:119`, `:85`) |
| `playLabel` | `string` | `'Play'` | Toggle button label when paused (`carousel.component.ts:120`) |
| `pauseLabel` | `string` | `'Pause'` | Toggle button label when playing (`carousel.component.ts:121`) |

Content projection: a required `<ng-template let-item>` via `contentChild.required(TemplateRef)` (`carousel.component.ts:123`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Track showing `numVisible` items, page dots if `pageCount > 1` and `showIndicators` (`carousel.component.ts:79-94`) | Prev/Next buttons only render when `canPrev()`/`canNext()` are true (edge-clamped, `carousel.component.ts:63,70,134-135`) |
| Hover (nav/dot buttons) | `hover:bg-surface-100`/`dark:hover:bg-surface-800` on nav buttons (`carousel.component.ts:65,72`) | Pointer only |
| Focus | **Resolved 2026-08-19.** Prev/next/dot/play-pause buttons now all have an explicit `focus-visible:ring-(--focus-ring-width)` (brand-colored, with offset), matching the rest of the library instead of relying on the browser default | Keyboard-reachable via Tab (native `<button>`s) |
| Active (current page) | Current page dot: `bg-brand-500 dark:bg-brand-400`; others: `bg-surface-300 dark:bg-surface-600` (`carousel.component.ts:88`) | `aria-current="true"` on the active page dot (`carousel.component.ts:86`) |
| Paused (autoplay) | Play icon shown, `paused()` signal true — toggled by the play/pause button (`carousel.component.ts:95-99,126,168-170`) | Autoplay `setInterval` is torn down via `onCleanup` while paused (`carousel.component.ts:142-149`) |
| Disabled | Not implemented — no `disabled` input | — |
| Loading | Not implemented | — |
| Error | N/A — Carousel itself renders consumer-templated content, no image-loading concerns of its own | — |

### Accessibility
- **Role/ARIA:** Outer wrapper is `role="region"` with `[attr.aria-roledescription]="'carousel'"` and `[attr.aria-label]="ariaLabel()"` (`carousel.component.ts:52`). A hidden `<span class="sr-only" aria-live="polite">` announces `"Page N of M"` on every page change, verified by `carousel.component.spec.ts — 'announces the current page via a polite live region'` (:184-192, checks both the initial text and the update after clicking Next). The active page dot's `aria-current="true"` is verified by `spec.ts — 'renders one dot per page and highlights the current one via aria-current'` (:108-118). Prev/Next buttons are conditionally rendered — absent entirely when at an edge or when everything fits in one page — verified across `spec.ts — 'starts at the first page: prev disabled, next enabled'` (:60-65), `'clamps at the end so the last page always shows a full numVisible items...'` (:75-88), and `'hides indicators when there is only one page (everything fits in numVisible)'` (:125-130).
- **Keyboard navigation:** All controls (prev/next, page dots, play/pause) are native `<button>` elements — Tab + Enter/Space; every one of them is exercised via `.click()` across the spec (`carousel.component.spec.ts:60-192`). No arrow-key navigation within the carousel track itself was found, and none is tested — this is a buttons-only interaction model (consistent with the simpler of the two WAI-ARIA APG Carousel patterns, which doesn't require arrow-key roving focus when prev/next/dot buttons are all independently focusable), not an oversight, but it is `[not covered by tests]` as a deliberate scope statement rather than as a regression guard.
- **Screen reader:** The `aria-live="polite"` region announces page changes on both manual navigation and autoplay-driven advances (the live-region test only exercises the manual-click path, :184-192; autoplay's own page-change announcements are implied by the same binding but not independently asserted for the `aria-live` text — `[not covered by tests]` for that specific combination, though `'autoplay advances on its own and wraps back to the first page at the end'`, :137-157, does verify the underlying index/transform state changes). Prev/next/page-dot/play-pause buttons all carry `aria-label`s built from the configurable label inputs, and the play/pause button's label itself flips between `'Pause'`/`'Play'` on toggle, verified by `spec.ts — 'clicking the pause/play toggle stops and resumes autoplay'` (:159-182, asserts both the label swap and that autoplay actually stops/resumes).
- **A11y verdict:** Covered — the region role, live-region page announcements, edge-clamped button visibility, aria-current on dots, and the full play/pause toggle cycle (including that pausing genuinely halts the timer) are all directly exercised by tests; only the interaction between autoplay and the live-region text, and the deliberate absence of arrow-key navigation, are unverified/undocumented as explicit test cases.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Provide a persistent pause control whenever `autoplayInterval` is set — this is automatic (the toggle button always renders when autoplay is on) | Relying on hover-to-pause patterns elsewhere in the app for auto-advancing content — this component deliberately avoids that WCAG 2.2.2 failure mode |
| Keep the item `<ng-template>` lightweight since it's cloned/rendered once per visible+buffered item | — |
| Trust the edge-clamping for both manual and autoplay navigation — both are regression-tested (`carousel.component.spec.ts:75-88`, `:137-157`) to never overshoot past the last full page | Assume autoplay needs its own bounds-checking logic distinct from `next()` — it reuses the same clamped advance, then explicitly wraps to 0 only once at the true end |
| Set `numScroll` explicitly when you want prev/next to advance by fewer items than are visible (e.g. a "peek" carousel) — verified independent of `numVisible` (`spec.ts:100-106`) | Assume `numScroll` defaults to `1` — it defaults to `numVisible`, so an unset `numScroll` on a `numVisible=3` carousel advances a full 3 items per click |

### Code example (Angular)
```html
<med-carousel [value]="carouselImages" [numVisible]="1" [autoplayInterval]="2500">
  <ng-template let-slide>
    <div class="flex h-40 items-center justify-center rounded-lg text-lg font-semibold text-white" [style.backgroundColor]="slide.color">
      {{ slide.label }}
    </div>
  </ng-template>
</med-carousel>
<med-carousel [value]="carouselImages" [numVisible]="3" [numScroll]="1">
  <ng-template let-slide>
    <div class="mx-1 flex h-24 items-center justify-center rounded-lg text-sm font-semibold text-white" [style.backgroundColor]="slide.color">
      {{ slide.label }}
    </div>
  </ng-template>
</med-carousel>
```
(from `projects/showcase/src/app/app.html:466-482`)

### Source
- `projects/medra/ui/src/lib/carousel/carousel.component.ts`
