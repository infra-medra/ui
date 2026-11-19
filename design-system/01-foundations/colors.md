# Colors

Source: `projects/medra/ui/src/styles/tailwind-theme-medraui.css` (Tailwind v4, CSS-first `@theme`). All color tokens are aliases onto Tailwind's default palette — the primitive palette itself was not rebuilt (per the file's own header comment).

## Brand

| Token | Value | Uso | Onde foi encontrado |
|---|---|---|---|
| `--color-brand-50` … `--color-brand-950` | Alias of Tailwind `teal-50…950` | Primary brand color across all interactive components (filled/outlined/text/link "primary" severity) | `tailwind-theme-medraui.css:18-28` |

Rationale documented in the source comment: teal was chosen to evoke growth with a more technical/trustworthy feel while avoiding a direct collision with Supabase's brand (which uses emerald). Confirmed in use: `lib/button/button.styles.ts:24` (`bg-brand-500`, `hover:bg-brand-600`, etc.).

## Semantic / severity

Six severities share one ramp shape (50→950), each aliased onto a Tailwind hue:

| Token | Aliased to | Semantic use |
|---|---|---|
| `--color-info-*` | `sky` | Informational state |
| `--color-success-*` | `green` | Success state |
| `--color-warn-*` | `amber` | Warning state |
| `--color-help-*` | `purple` | Help/assistive state |
| `--color-danger-*` | `red` | Error/destructive state |
| `--color-brand-*` (reused as "primary") | `teal` | Primary/default emphasis |

`tailwind-theme-medraui.css:35-93`. `secondary` and `contrast` severities (used throughout Button, Tag, Badge, etc.) intentionally have **no dedicated ramp** — they reuse `--color-surface-*` directly inside each component's CVA (documented inline at `tailwind-theme-medraui.css:33`).

## Surface (neutral) scale

Redefined per color scheme, not per component:

| Token | Light (`:root`) | Dark (`.dark`) |
|---|---|---|
| `--color-surface-0` | `#ffffff` | `#ffffff` (unchanged) |
| `--color-surface-50` … `-950` | Tailwind `slate-50…950` | Tailwind `zinc-50…950` |

`tailwind-theme-medraui.css:96-107` (light), `:193-207` (dark override). Note the light/dark surface scales alias to two **different** neutral hue families (`slate` vs `zinc`) rather than the same one — intentional per the source, but worth confirming it reads as a deliberate design decision rather than drift, since it's easy to mistake for an inconsistency.

## Hardcoded values audit

A repo-wide scan for literal hex colors (`grep -rEo '#[0-9a-fA-F]{3,8}'` across `lib/**/*.{ts,html,css}`, excluding specs) found hardcoded hex almost exclusively inside `color-picker/`:

| File | Values | Assessment |
|---|---|---|
| `lib/color-picker/color-picker.component.ts` | `#000000`, `#3b82f6` (default color) | Expected — a color picker's default/model value is inherently a raw hex string, not a design token. Not a violation. |
| `lib/color-picker/color-picker-panel.component.ts` | `#fff`, `#f00`, `#0f0`, `#00f`, `#ff0`, `#0ff`, `#f0f`, `#000` | Preset swatch values for the picker's hue/preset grid. Same reasoning — domain data, not theme color. |

No hardcoded hex found in any other component's styling logic. Two other files matched the same regex on literal `#`-prefixed record-number strings in demo/test data, not colors; false positives, noted here so the next audit pass doesn't re-flag them without checking.

**Finding for the audit report:** color token coverage is good — no real hardcoded color leakage found outside the one component whose whole job is to produce raw color values.
