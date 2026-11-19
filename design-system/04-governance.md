# Governance

This document is derived from what the audit (`00-audit-report.md`) actually found in this codebase, not a generic design-system governance template. Update it as new gaps get found in Phase 4/5.

## Proposing a new component

1. **Check for an existing primitive first.** This library already has 89 components across 6 categories (`02-components/_index.md`) — before adding a new one, check whether an existing component's variant system can absorb the need (e.g. a new severity-colored small element is probably a Tag/Chip/Badge variant, not a new component; the audit found these three already share Button's severity vocabulary in places — verify against `02-components/data-display/` docs once Phase 4 lands).
2. **Reuse the token layer.** Any new component must consume the existing tokens documented in `01-foundations/` — brand/semantic/surface colors, the 5-step radius scale, the 2-step overlay shadow scale, `--transition-duration-base`, `--focus-ring-*`, `--opacity-disabled`. Do not introduce a new hardcoded value where a token already covers the case (e.g. don't hardcode a 6px radius when `--radius-md` already is 6px).
3. **If a genuinely new token is needed** (the audit found real gaps here — no general typography/spacing scale beyond form fields, only 2 shadow levels), add it to `tailwind-theme-medraui.css` under `@theme`, name it consistently with the existing pattern (`--category-purpose-step`, e.g. `--shadow-overlay-md` if that gap ever gets filled), and update the relevant `01-foundations/*.md` file in the same change.
4. **Follow the selector convention already in use**: Angular components get `med-kebab-case` element selectors; directives get `[medCamelCase]` attribute selectors. This split was confirmed consistent across all 89 existing components/directives during the audit — don't deviate.
5. **CVA is the preferred variant mechanism** when a component has more than one dimension of visual variation (severity × style × size, as in Button). Only 21 of 89 components currently use a dedicated `*.styles.ts` CVA file — the rest inline their classes. A new component with genuine variant complexity should use CVA from the start rather than inline conditionals, since that's what let this audit extract Button's full variant matrix mechanically instead of by inspection.

## Versioning breaking changes

The library is currently pre-1.0 (`package.json` version `0.1.0`), so this section describes intent, not enforced tooling — no changelog or semver-enforcement mechanism was found in the repo during this audit. `[to confirm]` whether one exists elsewhere (e.g. CI-side) outside what this read-only pass could see.

- **Token value changes** (e.g. changing `--radius-md` from 6px to 8px) ripple to every component consuming it silently — treat any `01-foundations/` token value change as a breaking visual change requiring a full visual regression pass (Phase 7's style guide preview is exactly the tool for this: diff the "Atual" vs. "Proposta" render before merging).
- **Token renames/removals** (e.g. deciding `shadow-overlay-md` should be added, or that the two call sites referencing it should be redirected instead) are breaking for any external consumer using the removed name directly, even though today's only consumers are internal.
- **Prop renames** on any `@Input()`/`@Output()` are breaking for `@medra.dev/ui` consumers by definition (Angular template bindings fail silently-to-loudly depending on strict template checking). Deprecate with a clear migration note in the component's own doc page before removing.
- **Selector or directive-attribute renames** are breaking and highly visible (templates stop compiling) — avoid unless the current audit's naming-consistency findings (e.g. the `rounded` vs `rounded-sm` radius spelling) specifically require it.

## Minimum quality checklist for a new component

Directly built from what this audit's Phase 2/3 pass found missing or inconsistent in the existing 89:

- [ ] Uses only tokens from `01-foundations/` for color, radius, shadow, motion, and (once formalized) typography/spacing — no new hardcoded hex/px/duration values.
- [ ] Selector follows the `med-kebab-case` (component) / `[medCamelCase]` (directive) convention.
- [ ] Every interactive state that applies to the component's type is implemented and visible: default, hover, focus (with `--focus-ring-*`), active, disabled (with `--opacity-disabled`), plus loading/error if the component handles async data or user input validation.
- [ ] Has an explicit ARIA role and keyboard-navigation story if it's interactive — the audit found 83 of 89 folders reference `aria-*` at all, but per-component completeness hasn't been verified yet; a new component should not join that ambiguous majority.
- [ ] Ships a `.spec.ts` (all 89 existing components already do — this is the one convention with 100% compliance found in the audit, keep it that way).
- [ ] Gets a `02-components/<category>/<name>.md` doc page following the Phase 4 template before or immediately after merge — not "eventually."
- [ ] If it shares a severity/variant vocabulary with existing components (Button's severity scale is reused by several), reuse the same variant names — don't invent a parallel vocabulary for the same concept.

## Open questions this governance doc can't resolve alone

These came out of the audit and need a product/design decision, not an engineering default:

- Is `shadow-overlay-md`'s absence a bug (two components silently render no shadow) or should those two call sites be redirected to `-sm`/`-lg`? (`00-audit-report.md`, priority action 1)
- Should Ripple's adoption be extended to the rest of the Button family, or was Button-only intentional? (`03-patterns/ripple-interaction.md`)
- Should the general typography/spacing scales be formalized as named tokens now, before more components lock in today's ad hoc values as precedent?
