# Borders & Radius

Source: `tailwind-theme-medraui.css:110-114`.

## Radius tokens

| Token | Value | Uso | Onde foi encontrado |
|---|---|---|---|
| `--radius-xs` | 2px | Smallest interactive elements (e.g. InputOtp cell) | `tailwind-theme-medraui.css:110` |
| `--radius-sm` | 4px | Small-size buttons/fields (`size: sm`) | `tailwind-theme-medraui.css:111`; consumed at `lib/button/button.styles.ts:140` (`rounded-sm` for `size: sm`) |
| `--radius-md` | 6px | Default-size buttons/fields | `tailwind-theme-medraui.css:112`; consumed at `lib/button/button.styles.ts:141` |
| `--radius-lg` | 8px | Large-size buttons, cards, panels, overlays | `tailwind-theme-medraui.css:113`; consumed at `lib/button/button.styles.ts:142`, `lib/card/card.component.ts:49`, `lib/dialog/dialog-shell.component.ts:44` |
| `--radius-xl` | 12px | Rare — largest radius available | `tailwind-theme-medraui.css:114` |

## Radius usage in practice

Repo-wide scan of `rounded*` utilities across `lib/**/*.ts`:

| Class | Occurrences | Notes |
|---|---|---|
| `rounded-full` | 56 | Pills, avatars, toggle knobs, circular icon buttons |
| `rounded-md` | 34 | Matches `--radius-md` token |
| `rounded-lg` | 30 | Matches `--radius-lg` token |
| `rounded` (bare, = Tailwind default `0.25rem`/4px) | 27 | **Not** one of the five named radius tokens — see finding below |
| `rounded-sm` | 10 | Matches `--radius-sm` token |
| `rounded-l` / `rounded-r` | 8 / 7 | Directional, for adjoined elements (InputGroup, Splitter handles) |
| `rounded-none` | 6 | Explicit square corners |
| `rounded-xl` | 1 | Matches `--radius-xl` token |

**Finding for the audit report:** the bare `rounded` class (Tailwind's default 4px) appears 27 times but has no equivalent named token in `@theme` — it sits between `--radius-xs` (2px) and `--radius-sm` (4px)... actually equals `--radius-sm`'s value (4px) but is spelled differently (`rounded` vs `rounded-sm`) in different components. This is a real naming-consistency issue: two spellings produce the same 4px radius. Recommend picking one (`rounded-sm` matches the named token and should win) and updating the 27 call sites that use bare `rounded`.

## Borders

No dedicated border-width token was found; components use Tailwind's default `border` (1px) and `border-2` utilities directly (e.g. `lib/slider/slider.styles.ts:63` uses `border-2` for the slider handle). `[a confirmar]` whether a 1px/2px border-width convention should be tokenized — not enough distinct values found to call this a problem, just undocumented.
