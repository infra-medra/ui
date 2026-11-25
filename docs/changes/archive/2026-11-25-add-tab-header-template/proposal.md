# Proposal: add-tab-header-template

## Why

In `document-tabs-parity`, all existing `TabsComponent` and `TabComponent` features were documented on `/docs/components/tabs`, leaving custom tab header templates (`#header` `TemplateRef` on `<med-tab>`, corresponding to PrimeNG's `Template` section in `16-tabs.md`) as the remaining parity feature so consumers can render icons, badges, or custom markup inside tab buttons.

## What Changes

Support an optional `<ng-template #header>` template on `TabComponent` rendered inside `TabsComponent`'s `role="tab"` buttons via `NgTemplateOutlet`, make `TabComponent.header` default to `''` when `#header` is provided, preserve lazy `<ng-template>` body detection without colliding with `#header`, document `Template` (`#example-template`) on `/docs/components/tabs`, verify in Jest and Playwright, and add a `minor` changeset.

## Scope

### In scope
- `projects/medra/ui/src/lib/tabs/`:
  - `TabComponent`: add `readonly headerTemplate = contentChild<TemplateRef<void>>('header');`, exclude `headerTemplate` when resolving `contentTemplate` so `<ng-template #header>` never hijacks eager `<ng-content />` or lazy `<ng-template>` body content, and allow `header = input('')` so `header` is optional when `#header` is supplied.
  - `TabsComponent`: import `NgTemplateOutlet` and render `tab.headerTemplate()` inside `button[role="tab"]` when present, falling back to `{{ tab.header() }}`.
  - Add Jest unit tests in `tabs.component.spec.ts`.
- `projects/site/`: add `Template` (`#example-template`) demo, `.txt` prose, and `EXAMPLES` entry in `tabs.page.ts`.
- `e2e/site/tabs-docs.spec.ts`: verify `Template` (`#example-template`) renders custom icons/badges inside `role="tab"` and switches tabs cleanly.
- `.changeset/tabs-header-template.md` (`"@medra.dev/ui": minor`).

### Out of scope
- Changing existing eager/lazy body behavior when `#header` is not used.

## Track

**Track:** full
**Rationale:** Extends `TabComponent` and `TabsComponent` public template API (`#header` `TemplateRef`, optional `header` input), requiring a technical plan, test-first tasks, real-browser verification, and a `minor` changeset.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| tabs | modified | TBD-002, TBD-003 |

## Impact

- **Code:** `projects/medra/ui/src/lib/tabs/{tab.component.ts,tabs.component.ts,tabs.component.spec.ts}`, `projects/site/src/app/pages/docs/components/tabs.page.ts`, `demos/tabs-template.demo.{ts,html}`, `content/docs/tabs-template.txt`, `e2e/site/tabs-docs.spec.ts`, `.changeset/tabs-header-template.md`
- **Interfaces:** Adds `headerTemplate` `contentChild` (`#header`) on `TabComponent` and widens `TabComponent.header` from `input.required<string>()` to `input('')` (backwards-compatible).
- **Data:** None.
- **Dependencies:** None (adds a `minor` changeset for `@medra.dev/ui`).

## Open Questions

None.
