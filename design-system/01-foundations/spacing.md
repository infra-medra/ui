# Spacing

Source: `tailwind-theme-medraui.css` defines a **form-field-specific** padding scale only, the same pattern as typography.md. No general spacing/grid token (e.g. a 4px/8pt base unit) is centralized — components consume Tailwind's default spacing scale (which is itself a 0.25rem/4px unit) directly via `p-*`, `gap-*`, `m-*` utilities.

## Form-field padding (tokenized)

| Token | Value | Uso | Onde foi encontrado |
|---|---|---|---|
| `--spacing-field-x` | `0.75rem` (12px) | Default horizontal padding, form fields | `tailwind-theme-medraui.css:127` |
| `--spacing-field-y` | `0.5rem` (8px) | Default vertical padding, form fields | `tailwind-theme-medraui.css:128` |
| `--spacing-field-sm-x` | `0.625rem` (10px) | Small-size form fields | `tailwind-theme-medraui.css:129` |
| `--spacing-field-sm-y` | `0.375rem` (6px) | Small-size form fields | `tailwind-theme-medraui.css:130` |
| `--spacing-field-lg-x` | `0.875rem` (14px) | Large-size form fields | `tailwind-theme-medraui.css:131` |
| `--spacing-field-lg-y` | `0.625rem` (10px) | Large-size form fields | `tailwind-theme-medraui.css:132` |

## Gap scale in practice (untokenized — Tailwind defaults)

Repo-wide scan of `gap-*` utilities across `lib/**/*.ts`:

| Class | Value | Occurrences |
|---|---|---|
| `gap-2` | 0.5rem (8px) | 32 |
| `gap-1` | 0.25rem (4px) | 23 |
| `gap-3` | 0.75rem (12px) | 9 |
| `gap-1.5` | 0.375rem (6px) | 6 |
| `gap-4` | 1rem (16px) | 5 |
| `gap-6` | 1.5rem (24px) | 3 |
| `gap-0.5` | 0.125rem (2px) | 3 |

De facto, the library follows Tailwind's built-in 4px base unit (`gap-1` = 4px increments), which is consistent with the field-padding tokens above (0.5rem/0.375rem/0.625rem — all multiples of 2px). No inconsistent, off-grid spacing value was found in this scan.

**Finding for the audit report:** spacing is internally consistent (everything aligns to Tailwind's 4px grid) but not documented as a named scale beyond form fields — same gap pattern as typography. Low priority to fix since there's no evidence of drift, but worth naming explicitly (e.g. `--spacing-gap-sm/md/lg`) if the design system wants spacing to be swappable independent of Tailwind's own scale.
