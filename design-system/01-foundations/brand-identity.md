# Brand identity

Source: brand guideline slide provided by the user (2026-09-07), plus the SVG files it
references, stored in [`assets/brand/`](../../assets/brand/). This foundation doc
transcribes that guideline into English per this repo's language policy (see
[CLAUDE.md](../../CLAUDE.md)) — the original slide is in Portuguese.

## Primary lockup

A nine-module grid with the top-right cell empty. Each module grows by five points per
diagonal step; the three largest modules get an increasingly rounded corner. The final
(largest) module is the only one in teal — everything else is ink (`#1a1c1b`).

Symbol and wordmark are separated by a gap equal to one grid cell.

Files: [`lockup.svg`](../../assets/brand/lockup.svg) (light background),
[`lockup-inverted.svg`](../../assets/brand/lockup-inverted.svg) (dark background, ink
swapped for `#f4f4f1`), [`lockup-mono.svg`](../../assets/brand/lockup-mono.svg)
(one-color, the accent module also collapses to ink).

## Symbol only

The nine-module grid without the wordmark, for contexts too small for the lockup (app
icon, favicon, avatar).

Files: [`symbol.svg`](../../assets/brand/symbol.svg),
[`symbol-inverted.svg`](../../assets/brand/symbol-inverted.svg),
[`symbol-mono.svg`](../../assets/brand/symbol-mono.svg).

## App icon / favicon

Export sizes: 72, 44, 32, 16 px.

Files: [`app-icon.svg`](../../assets/brand/app-icon.svg) (180×180 source, rounded-square
container), [`favicon-16.svg`](../../assets/brand/favicon-16.svg) (64×64 source, used as
`favicon.svg` in the showcase — see `projects/showcase/public/favicon.svg` and
`projects/showcase/src/index.html`).

## Clear space and minimum size

Clear space around the lockup equals one grid cell on every side. Minimum size is 24 px
/ 8 mm; below that, use the symbol alone.

## Don'ts

- No gradient fills.
- No rotation of the symbol.
- No typeface substitution for the wordmark.

## Color palette

| Value | Role |
|---|---|
| `#1a1c1b` | Ink — text, symbol |
| `#14b8a6` | Primary accent |
| `#0d9488` | Hover / action |
| `#0f766e` | Outline, teal text |
| `#134e4a` | Monochrome |
| `#ccfbf1` | Tint — soft background |

These values line up exactly with the Tailwind `teal` ramp already aliased as
`--color-brand-*` in `tailwind-theme-medraui.css` (see [colors.md](colors.md)) —
`#14b8a6` is `teal-500`, `#0d9488` is `teal-600`, `#0f766e` is `teal-700`, `#134e4a` is
`teal-900`, `#ccfbf1` is `teal-100`. No new tokens are needed for the library itself;
this palette is a naming/role layer on top of the existing brand ramp, primarily for the
public site and marketing surfaces (Trilha 6).

## Typography

- **Space Grotesk Medium** — logotype and titles. Tracking −5%, always lowercase in the
  mark itself.
- **IBM Plex Sans Regular** — body copy, interface, documents.

Neither is currently loaded by the component library (see the "no `--font-*` family
token" gap noted in [typography.md](typography.md)) — this is a brand-level pairing for
the marketing site, not yet wired into `medra/ui`.

## Before filing a trademark

Simple geometric marks are common in this space. Run a prior-art search at INPI (Brazil),
class 42, with a trademark attorney before filing.
