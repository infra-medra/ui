# Proposal: document-button-parity

## Why

`ButtonDirective` (`projects/medra/ui/src/lib/button/button.directive.ts`) already implements nearly all PrimeNG Button capabilities, but `/docs/components/button` currently documents only the intro and 4 grouped sections (`Severities`, `Variants`, `States`, `Raised and plain`) without `EXAMPLES` or "On this page" anchor navigation. We need to bring `/docs/components/button` to the same `EXAMPLES` + "On this page" + prose + interactive demo + code block structure as `AutoComplete`, `DatePicker`, and `InputNumber` (before adding `ButtonGroup` in a follow-up change).

## What Changes

Structure `/docs/components/button` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for all 15 currently supported Button features.

## Scope

### In scope
- Triage of PrimeNG Button candidates:
  - **Already supported, needs documentation (15 sections):** `Basic`, `Icons` (projected `<med-icon>`), `Loading` (`[loading]`), `Link` (`a[medButton]`), `Severity` (`severity`), `Rounded` (`[pill]`), `Text` (`variant="text"`), `Raised Text` (`[raised]` + `variant="text"`), `Outlined` (`variant="outlined"`), `Icon Only` (`[iconOnly]`), `Badge` (`badge` / `badgeSeverity`), `Sizes` (`size`), `Fluid` (`[fluid]`), `Disabled` (`disabled`), `Template` (projected custom content inside `button[medButton]`).
  - **Missing in MedraUi (deferred to follow-up `add-button-group` change):** `Button Group` (`<med-button-group>`).
  - **Not applicable / discarded:** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs concepts); `Accessibility` documented via the API reference and ARIA attributes (`aria-busy`, native `<button>`/`<a>` semantics).
- Update `projects/site/src/app/pages/docs/components/button.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 15 sections in order.
- Create missing `.demo.ts` / `.demo.html` pairs and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/button-docs.spec.ts` (`BTN-001.S1`).

### Out of scope
- Any changes to `projects/medra/ui/src/lib/button/` (library code and public API are untouched; `ButtonGroup` will be implemented in its own follow-up change).

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| button | new | BTD-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/button.page.ts`, `projects/site/src/app/pages/docs/components/demos/button-*.demo.{ts,html}`, `projects/site/src/content/docs/button-*.txt`, `e2e/site/button-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
