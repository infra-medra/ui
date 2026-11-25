# Proposal: add-button-group

## Why

In `document-button-parity`, all existing `ButtonDirective` features were documented on `/docs/components/button`, leaving `ButtonGroup` as the sole remaining PrimeNG Button parity feature (`06-button.md`). Systems frequently group related action buttons (e.g., Save / Cancel / Delete or toolbar actions) into a visually connected `role="group"` container with seamless inner borders and corner radii.

## What Changes

Implement `ButtonGroupComponent` (`<med-button-group>`) in `@medra.dev/ui`, export it from `public-api.ts`, add Jest unit tests, document it under `Button Group` (`#example-button-group`) on `/docs/components/button`, verify layout/styling in Playwright, and add a `minor` changeset.

## Scope

### In scope
- Create `projects/medra/ui/src/lib/button-group/` (`button-group.component.ts`, `button-group.styles.ts`, `button-group.component.spec.ts`) and export `ButtonGroupComponent` and `buttonGroupVariants` from `projects/medra/ui/src/public-api.ts`.
- Support `role="group"`, `class` merge via `mergeClasses`, and seamless connected styling for projected `button[medButton]` / `a[medButton]` children (square inner corners, collapsed inner borders, `z-10` on `:focus-visible`/`:hover` so focus rings and borders are never clipped).
- Add `Button Group` (`#example-button-group`) to `projects/site/src/app/pages/docs/components/button.page.ts`, `demos/button-group.demo.{ts,html}`, `projects/site/src/content/docs/button-group.txt`, and `e2e/site/button-docs.spec.ts`.
- Add `.changeset/button-group.md` (`"@medra.dev/ui": minor`).

### Out of scope
- Changing `ButtonDirective` API or existing `Button` styles.
- Vertical button group orientation unless requested later (PrimeNG ButtonGroup is horizontal `inline-flex`).

## Track

**Track:** full
**Rationale:** Adds a new public `@medra.dev/ui` component (`ButtonGroupComponent`) with public API exports, unit tests, real-browser layout checks, docs example, and a `minor` changeset.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| button | modified | BTD-002, BTD-003 |

## Impact

- **Code:** `projects/medra/ui/src/lib/button-group/`, `projects/medra/ui/src/public-api.ts`, `projects/site/src/app/pages/docs/components/button.page.ts`, `projects/site/src/app/pages/docs/components/demos/button-group.demo.{ts,html}`, `projects/site/src/content/docs/button-group.txt`, `e2e/site/button-docs.spec.ts`, `.changeset/button-group.md`
- **Interfaces:** Exports `ButtonGroupComponent` (`<med-button-group>`) and `buttonGroupVariants` from `@medra.dev/ui`.
- **Data:** None.
- **Dependencies:** None (adds a `minor` changeset for `@medra.dev/ui`).

## Open Questions

None.
