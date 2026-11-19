## Component: Image

### Description
Image is a Tier 3 primitive rendering a plain `<img>` with an optional full-screen preview overlay (`projects/medra/ui/src/lib/image/image.component.ts:8`). `preview` (default `false`) wraps the thumbnail in a `<button>` that opens `ImagePreviewComponent` — a full-screen overlay with pan-free zoom in/out and a close button — via `OverlayService.openGlobal()` (`image.component.ts:8-12`). Escape/backdrop-click/focus-trap/focus-restore all come from the shared `OverlayService`, the same as every other overlay in the library.

Broken-image fallback reuses Avatar's exact technique: a `failedUrl` signal tracks the URL that errored, and `imageFailed` compares it against the current `src`, so switching to a new URL always retries loading (`image.component.ts:14-19`). The fallback (a generic `photo` icon) is never itself clickable, even with `preview` on.

### Variants
| Variant | When to use |
|---|---|
| Plain (default, `preview=false`) | A static, non-interactive image |
| `preview` | Click-to-zoom — wraps the image in a button that opens a full-screen preview overlay (`image.component.ts:32-38`, `:49`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `src` | `string` (required) | — | Image URL (`image.component.ts:47`) |
| `alt` | `string` | `''` | Alt text (`image.component.ts:48`) |
| `preview` | `boolean` | `false` | Enables click-to-open full-screen preview overlay (`image.component.ts:49`) |
| `previewLabel` | `string` | `'View larger image'` | Accessible label for the preview trigger button (`image.component.ts:50`) |
| `class` | `string` | `''` | Extra classes merged onto the `<img>`/fallback element (`image.component.ts:51`, `:58-59`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Plain `<img class="block max-w-full">` (`image.component.ts:40`, `:58`) | — |
| Hover (`preview` mode only) | Dark overlay (`bg-surface-950/40`) fades in with a magnifying-glass icon, via `group-hover:opacity-100` (`image.component.ts:35`) | Pointer/focus (group hover on the button) |
| Focus (`preview` mode only) | Native button focus (no explicit `focus-visible:ring` classes found on the preview trigger button itself, `image.component.ts:33`) | Keyboard-reachable via Tab |
| Active | N/A explicitly styled | Click opens the preview overlay (`image.component.ts:33`, `:65-77`) |
| Disabled | Not implemented — no `disabled` input | — |
| Loading | Not implemented — no loading/skeleton state while the image downloads | — |
| Error (broken image) | Falls back to a `photo` icon on a neutral background (`bg-surface-100`/`dark:bg-surface-800`), sized `size-32` by default or by `class` (`image.component.ts:28-31`, `:59`) | Fallback is never clickable, even with `preview` on (comment at `image.component.ts:18-19`); retried automatically if `src` changes |

### Accessibility
- **Role/ARIA — dialog gap resolved 2026-08-19:** The preview trigger is a real `<button>` with `[attr.aria-label]="previewLabel()"` (`image.component.ts:33`), and it disappears entirely when the image is broken — verified by `image.component.spec.ts — 'the broken-image fallback is never wrapped in a preview button'`. Inside the opened overlay, `ImagePreviewComponent`'s zoom-out/zoom-in/close buttons all carry `[attr.aria-label]` (`image-preview.component.ts` — `'Zoom out'`/`'Zoom in'`/`'Close'` by default), verified by `image.component.spec.ts — 'the close button in the preview closes the overlay'` (queries `[aria-label="Close"]`) and `'zoom in/out buttons scale the previewed image and disable at the min/max bound'` (queries `[aria-label="Zoom in"]`/`[aria-label="Zoom out"]`). `ImagePreviewComponent`'s host now sets `role="dialog"`/`aria-modal="true"` directly (same convention `DialogShellComponent` established, `dialog-shell.component.ts:42-48`) plus `aria-label` (the consumer's `alt` when set, else a generic `'Image preview'` fallback) so a screen reader entering the full-screen preview gets a proper "dialog opened, named X" announcement instead of only the focus trap silently redirecting focus. Confirmed by `image.component.spec.ts — 'the preview overlay panel has role="dialog"/aria-modal and an accessible name from alt (Wave 2 fix — 2026-08-19)'` and `'the preview overlay panel falls back to a generic aria-label when alt is empty'`.
- **Keyboard navigation:** In `preview` mode, the trigger is a native `<button>` (Tab-reachable, Enter/Space activates). The opened overlay closes on Escape, verified by `image.component.spec.ts — 'closes on Escape'`; focus-trap/focus-restore come from `OverlayService` (`trapFocus` defaults to `hasBackdrop`, which itself defaults to `true` for `openGlobal` — `overlay.service.ts:277-306`) and are exercised indirectly (destroying the host while open also cleanly closes it, `image.component.spec.ts — 'destroying the host while the preview is open closes the overlay'`), but the spec never asserts where focus actually lands after open/close — `[not covered by tests]`.
- **Screen reader — fallback-icon gap resolved 2026-08-19:** `alt` is passed straight through to the `<img>` and forwarded verbatim into the preview overlay's own `<img alt>` and its dialog `aria-label`. `previewLabel` announces the zoom trigger's purpose. The broken-image fallback icon now carries `[ariaLabel]` — reusing `IconComponent`'s own existing `ariaLabel`-or-`aria-hidden` mechanism (`icon.component.ts:48-50,63-64`) rather than new plumbing: when `alt` was provided, the fallback announces `"Image failed to load: {alt}"`, preserving what the broken image was supposed to show; with no `alt` at all there's nothing meaningful to say, so it falls through to `IconComponent`'s own decorative default (`aria-hidden="true"`) — the same decorative-by-default call Avatar's own all-defaults fix makes. Confirmed by `image.component.spec.ts — 'the broken-image fallback icon is labeled from alt (Wave 2 fix — 2026-08-19)'` and `'the broken-image fallback icon is aria-hidden (decorative) when there is no alt at all'`.

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: the trigger button, its disappearance on broken images, and all three preview-overlay controls (zoom in/out, close) remain directly tested as before; the overlay panel now announces `role="dialog"`/`aria-modal` with a real accessible name, and the broken-image fallback icon now has a context-aware accessible name (or is correctly decorative when there's no context to give).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Always set `alt` — it's the only accessible name for the image, is forwarded into the preview overlay's `<img alt>` and dialog `aria-label`, and now also drives the broken-image fallback's accessible name | Leaving `alt` empty for meaningful (non-decorative) images — the broken-image fallback then has nothing to announce and is correctly `aria-hidden` instead |
| Use `preview` for images the user might want to inspect closer (photos, diagrams) | Enabling `preview` on purely decorative images — adds an unnecessary interactive control |
| Rely on `openGlobal`'s default focus trap and Escape-to-close for the preview overlay — both are tested, and the overlay now correctly announces itself as `role="dialog"`/`aria-modal="true"` to screen readers | Assume the preview overlay's accessible name is always specific — with no `alt` set it falls back to the generic `'Image preview'` string, not the image's actual content |
| Trigger a fresh `src` (not `preview` toggling) to recover from a broken image — verified to always retry | Toggle `preview` on/off expecting it to clear a broken-image state — only a changed `src` does that |

### Code example (Angular)
```html
<med-image [src]="imageDemoSrc" alt="Demo graphic" class="rounded-lg" />
<med-image [src]="imageDemoSrc" alt="Demo graphic" preview class="rounded-lg" />
<med-image [src]="imageBrokenSrc" alt="Broken" class="size-32 rounded-lg" />
```
(from `projects/showcase/src/app/app.html:492,496,500`)

### Source
- `projects/medra/ui/src/lib/image/image.component.ts`
- `projects/medra/ui/src/lib/image/image-preview.component.ts` (internal preview overlay content, not part of the public API — see its own doc comment at `image-preview.component.ts:5-13`)
