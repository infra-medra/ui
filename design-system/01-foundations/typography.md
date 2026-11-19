# Typography

Source: `tailwind-theme-medraui.css` defines a **form-field-specific** type scale only. No general-purpose typography scale (headings, body, caption) is centralized as a token — components consume Tailwind's default `text-*` utilities directly. This is a real gap, carried into `00-audit-report.md`.

## Font family

No `--font-*` family token and no `font-family` declaration were found anywhere in `lib/` or the theme file, except one component-local utility:

| Token | Value | Uso | Onde foi encontrado |
|---|---|---|---|
| `font-mono` (Tailwind default, not a custom token) | Tailwind's default monospace stack | Terminal component's output area only | `lib/terminal/terminal.component.ts:90` |

The rest of the library relies on the consuming app's own base font (no explicit `font-sans` override found), which matches an Angular *library* (not an app shell) not opinionating on the host's font — but it also means there's no documented, intentional base-font decision to point to. `[a confirmar]` whether this is deliberate.

## Form-field type scale (tokenized)

| Token | Value | Uso | Onde foi encontrado |
|---|---|---|---|
| `--text-field-sm` | `0.875rem` | Small-size form fields (Input, Select, etc.) | `tailwind-theme-medraui.css:133` |
| `--text-field-base` | `1rem` | Default-size form fields | `tailwind-theme-medraui.css:134` |
| `--text-field-lg` | `1.125rem` | Large-size form fields | `tailwind-theme-medraui.css:135` |

## General type scale in practice (untokenized — Tailwind defaults used directly)

Usage counts from a repo-wide scan of `text-*` size utilities across `lib/**/*.ts` (excluding specs):

| Class | Occurrences | Notes |
|---|---|---|
| `text-sm` | 60 | Dominant size; body copy, labels, secondary text |
| `text-xs` | 13 | Captions, badges, helper text |
| `text-lg` | 7 | Emphasis text |
| `text-base` | 6 | Rare — most "default" text is actually `text-sm` in this library |

## Font weight in practice

| Class | Occurrences |
|---|---|
| `font-medium` | 18 |
| `font-semibold` | 14 |

No `font-bold` or `font-normal` usage found — weight vocabulary in practice is limited to medium/semibold, which is a reasonable de-facto convention worth formalizing as a rule ("use `font-medium` for emphasis, `font-semibold` for headings/strong emphasis — nothing else") rather than leaving implicit.

**Finding for the audit report:** typography has a tokenized scale only for form fields; everything else (headings, body, captions) is ad hoc Tailwind utilities with no named scale to reference by design intent (e.g., no `--text-heading-lg` equivalent to `--text-field-lg`). Recommend formalizing the observed `text-xs/sm/lg` + `font-medium/semibold` convention into named tokens before the design system locks it in as "current".
