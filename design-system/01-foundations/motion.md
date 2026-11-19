# Motion

Source: `tailwind-theme-medraui.css:117-124, 141-181`.

## Tokens defined

| Token | Value | Uso | Onde foi encontrado |
|---|---|---|---|
| `--transition-duration-base` | `0.2s` | Default transition duration for color/transform transitions across interactive components | `tailwind-theme-medraui.css:124`; consumed at `lib/button/button.styles.ts:125` (`transition-colors duration-(--transition-duration-base)`), `lib/drawer/drawer.styles.ts:37`, `lib/speed-dial/speed-dial.component.ts:99` |
| `--focus-ring-width` | `1px` | Keyboard-focus ring width | `tailwind-theme-medraui.css:117` |
| `--focus-ring-offset` | `2px` | Keyboard-focus ring offset | `tailwind-theme-medraui.css:118` |
| `--animate-progress-indeterminate` | `med-progress-indeterminate 1.5s ease-in-out infinite` | ProgressBar's indeterminate sweep | `tailwind-theme-medraui.css:147`, keyframes at `:162-172` |
| `--animate-skeleton-wave` | `med-skeleton-wave 1.5s ease-in-out infinite` | Skeleton's shimmer sweep | `tailwind-theme-medraui.css:159`, keyframes at `:174-181` |

Both ambient animations share the same 1.5s duration and `ease-in-out` easing by convention (documented explicitly in the source comment at `tailwind-theme-medraui.css:149-158` as a deliberate shared pace), even though each has its own named `--animate-*` key rather than sharing a duration token.

## Easing

No named easing token exists. `ease-in-out` and `ease-out` are used directly as Tailwind utilities.

## Usage in practice — outliers

Repo-wide scan of `duration-*` utilities found exactly two call sites that bypass `--transition-duration-base` (0.2s) with hardcoded values:

| File | Value used | vs. token |
|---|---|---|
| `lib/carousel/carousel.component.ts:54` | `duration-300` (0.3s) | 1.5× the base token |
| `lib/dock/dock.component.ts:96` | `duration-150` (0.15s) | 0.75× the base token |

**Finding for the audit report:** these two are plausibly intentional (a slide track and a dock hover-scale plausibly want different pacing than a color-transition token meant for buttons/inputs), but neither is documented as such — there's no comment explaining why Carousel and Dock opted out of the shared duration token. Recommend either tokenizing a second duration (e.g. `--transition-duration-slow`) if the difference is intentional, or converging on the base token if it isn't. `[a confirmar]` with the component owner — can't tell intent from source alone.
