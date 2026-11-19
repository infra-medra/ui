# Shadows & Elevation

Source: `tailwind-theme-medraui.css:137-139`.

## Tokens defined

| Token | Value | Uso | Onde foi encontrado |
|---|---|---|---|
| `--shadow-overlay-sm` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Lighter overlay elevation | `tailwind-theme-medraui.css:138` |
| `--shadow-overlay-lg` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Heavier overlay elevation (modals, popovers) | `tailwind-theme-medraui.css:139` |

Only **two** elevation levels are defined — small and large, both scoped to "overlay" (there is no general-purpose card/resting-state shadow token).

## Usage in practice

| Class | Occurrences | Where |
|---|---|---|
| `shadow-overlay-sm` | 9 | Card (`card.component.ts:49`), Carousel/Galleria nav arrows, Slider handle, ToggleSwitch knob, Tooltip panel, Toast container |
| `shadow-overlay-lg` | 9 | Dialog, Drawer, Menu panel, MegaMenu, Popover, ConfirmPopup, Dock, Select, Overlay service default |
| `shadow-overlay-md` | **2** | `lib/image-compare/image-compare.component.ts:64`, `lib/speed-dial/speed-dial.component.ts:99` |
| `shadow-none` | 2 | Explicit no-shadow override |

**Finding for the audit report (bug, not just inconsistency):** `shadow-overlay-md` is referenced in two components (ImageCompare's drag handle, SpeedDial's action button) but **is not defined anywhere in `@theme`** — only `-sm` and `-lg` exist. Tailwind v4 will not generate a utility for an undefined theme key, so `shadow-overlay-md` most likely resolves to **no shadow at all** on both call sites, silently. This should be either (a) added as a real token between the two existing ones, or (b) the two call sites switched to the nearest existing token — needs a decision, not a guess, since I can't tell from source alone whether "medium" elevation was an intentional third step or a typo for `-lg`. Flagged as a priority action in `00-audit-report.md`, not fixed here per the read-only rule for Phases 1-7.

## Elevation model

No numbered elevation scale (elevation-1, elevation-2, …) exists — the model is binary (sm/lg) plus the undefined -md gap above. `[a confirmar]` whether a 3rd or 4th level is needed once ImageCompare/SpeedDial's intent is clarified.
