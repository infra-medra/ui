# Proposal: add-select-button-item-template

## Why

In `document-select-button-parity`, all existing `SelectButtonComponent` features were documented on `/docs/components/select-button`. Two PrimeNG SelectButton features remain missing: custom item content (`Template`, via an item template) and `Fluid` (full-width layout). Consumers need to render icons or rich markup inside options and to stretch the control to its container, which `<med-select-button>` cannot do today.

## What Changes

Add an optional `<ng-template #item>` (`itemTemplate` `contentChild`) rendered inside each option button via `NgTemplateOutlet` with a context exposing the option, its selected state and its index, falling back to `option.label`. Add a `fluid` input (and `MED_FLUID_CONTEXT` support, same as DatePicker) that makes the host `block w-full` and the options share the full width equally. Document `Template` and `Fluid` on `/docs/components/select-button`, verify in Jest and Playwright, and add a `minor` changeset.

## Scope

### In scope
- `projects/medra/ui/src/lib/select-button/select-button.component.ts`:
  - `itemTemplate = contentChild<TemplateRef<SelectButtonItemContext<T>>>('item')` rendered via `NgTemplateOutlet` with context `{ $implicit: option, selected, index }`, falling back to `{{ option.label }}`; export `SelectButtonItemContext` type from the public API.
  - `fluid = input(false, { transform: booleanAttribute })` plus optional `MED_FLUID_CONTEXT` injection; fluid layout: host `block w-full`, group `flex w-full`, option buttons `flex-1 justify-center`.
  - Jest tests in `select-button.component.spec.ts`.
- `projects/site/`: `Template` (`#example-template`) and `Fluid` (`#example-fluid`) demos, `.txt` prose and `EXAMPLES` entries in `select-button.page.ts` (11 sections total, `Template` after `Multiple`, `Fluid` after `Sizes`); update API JSON if it lists inputs.
- `e2e/site/select-button-docs.spec.ts`: extend for the 2 new sections (link count 9 → 11 and new assertions).
- `.changeset/select-button-item-template-fluid.md` (`"@medra.dev/ui": minor`).

### Out of scope
- Changing existing selection, keyboard or ARIA behavior.
- A `filled` variant (not present in PrimeNG SelectButton).

## Track

**Track:** full
**Rationale:** Extends the public API of `SelectButtonComponent` (`#item` template, `fluid` input, new exported context type), requiring a technical plan, test-first tasks, real-browser verification and a `minor` changeset.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| select-button | modified | SLB-002, SLB-003, SLB-004 |

## Impact

- **Code:** `projects/medra/ui/src/lib/select-button/{select-button.component.ts,select-button.component.spec.ts}`, `projects/medra/ui/src/public-api.ts` (if the context type is exported there), `projects/site/src/app/pages/docs/components/select-button.page.ts`, `demos/select-button-{template,fluid}.demo.{ts,html}`, `content/docs/select-button-{template,fluid}.txt`, `e2e/site/select-button-docs.spec.ts`, `.changeset/select-button-item-template-fluid.md`
- **Interfaces:** Adds `itemTemplate` `contentChild` (`#item`), `fluid` input and `SelectButtonItemContext` type to `SelectButtonComponent` (backwards-compatible).
- **Data:** None.
- **Dependencies:** None (adds a `minor` changeset for `@medra.dev/ui`).

## Open Questions

None.
