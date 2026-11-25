# Proposal: document-dialog-parity

## Why

`DialogComponent` (`<med-dialog>`) and `DialogService` (`projects/medra/ui/src/lib/dialog/`) already implement declarative and imperative dialogs, `#header`/`#footer`/`#headless` templates, `position`, `maximizable`, `draggable`, `resizable`, scrollable long content, and `closeOnEscape`/`dismissableMask`/`breakpoints`, but `/docs/components/dialog` currently documents only the intro, basic import, `Window-like controls`, and `Dismissal and responsiveness` without `EXAMPLES` or "On this page" anchor navigation.

## What Changes

Structure `/docs/components/dialog` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for all 9 currently supported Dialog sections (before adding `[modal]="false"` / `Without Modal` in a follow-up change).

## Scope

### In scope
- Triage of PrimeNG Dialog candidates (`14-dialog.md`):
  - **Already supported, needs documentation (9 sections):** `Basic`, `Template` (`#header`, `#footer`), `Position` (`position`), `Maximizable` (`maximizable`, covering full-screen expand/restore), `Draggable` (`draggable`), `Resizable` (`resizable`), `Long Content` (scrollable dialog body), `Headless` (`#headless`), `Responsive & Dismissal` (`breakpoints`, `closeOnEscape`, `dismissableMask`).
  - **Missing in MedraUi (deferred to follow-up `add-dialog-modal` change):** `Without Modal` (`modal: boolean`, `hasBackdrop: false`).
  - **Not applicable / other component:** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs); `Confirmation` (covered by `ConfirmDialog`); `Accessibility` documented via the API reference and ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap).
- Update `projects/site/src/app/pages/docs/components/dialog.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 9 sections in order (reusing `DialogBasicDemo`, `DialogWindowControlsDemo`, and `DialogBehaviorDemo` where appropriate).
- Create missing `.demo.ts` / `.demo.html` pairs and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/dialog-docs.spec.ts` (`DLD-001.S1`).

### Out of scope
- Any changes to `projects/medra/ui/src/lib/dialog/` (library code and public API are untouched; `modal` will be implemented in its own follow-up change).

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| dialog | new | DLD-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/dialog.page.ts`, `projects/site/src/app/pages/docs/components/demos/dialog-*.demo.{ts,html}`, `projects/site/src/content/docs/dialog-*.txt`, `e2e/site/dialog-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
