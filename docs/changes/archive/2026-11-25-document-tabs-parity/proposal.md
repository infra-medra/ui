# Proposal: document-tabs-parity

## Why

`TabsComponent` (`<med-tabs>`) and `TabComponent` (`<med-tab>`) (`projects/medra/ui/src/lib/tabs/`) already implement basic tabs, `@for` dynamic tabs, two-way `[(activeIndex)]` control, scrollable overflow with `[showNavigators]`, `<ng-template>` lazy panels, and `[disabled]` tabs, but `/docs/components/tabs` currently documents only the intro, basic import, `Lazy content`, and `Scroll navigators` without `EXAMPLES` or "On this page" anchor navigation.

## What Changes

Structure `/docs/components/tabs` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for all 6 currently supported Tabs sections (before adding `#header` custom tab-header templates in a follow-up change).

## Scope

### In scope
- Triage of PrimeNG Tabs candidates (`16-tabs.md`):
  - **Already supported, needs documentation (6 sections):** `Basic`, `Dynamic` (`@for`), `Controlled` (`[(activeIndex)]`), `Scrollable` (`[showNavigators]="true"`), `Lazy` (`<ng-template>`), `Disabled` (`[disabled]="true"`).
  - **Missing in MedraUi (deferred to follow-up `add-tab-header-template` change):** `Template` (`#header` `TemplateRef` on `<med-tab>`).
  - **Not applicable / other component:** `Pass Through`, `Styled`, `Unstyled`, `Document`; `Tab Menu` (separate `/docs/components/tab-menu` component); `Select on Focus` (already the default automatic-activation keyboard behavior); `Accessibility` documented via the API reference and WAI-ARIA `tablist`/`tab`/`tabpanel` attributes.
- Update `projects/site/src/app/pages/docs/components/tabs.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 6 sections in order (reusing `TabsBasicDemo`, `TabsLazyDemo`, and `TabsNavigatorsDemo`).
- Create missing `.demo.ts` / `.demo.html` pairs (`tabs-dynamic`, `tabs-controlled`, `tabs-disabled`) and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/tabs-docs.spec.ts` (`TBD-001.S1`).

### Out of scope
- Any changes to `projects/medra/ui/src/lib/tabs/` (library code and public API are untouched; `#header` template will be implemented in its own follow-up change).

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| tabs | new | TBD-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/tabs.page.ts`, `projects/site/src/app/pages/docs/components/demos/tabs-*.demo.{ts,html}`, `projects/site/src/content/docs/tabs-*.txt`, `e2e/site/tabs-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
