# Proposal: document-textarea-parity

## Why

`TextareaDirective` (`projects/medra/ui/src/lib/textarea/textarea.directive.ts`) already implements all core PrimeNG Textarea capabilities (`autoResize`, `size`, `variant="filled"`, `fluid`, `invalid`, native `disabled`, `ControlValueAccessor` for Signal Forms / Template Driven / Reactive Forms, plus `<med-float-label>` and `<med-ifta-label>`), but `/docs/components/textarea` currently documents only the intro, basic import, and `Auto-resize` without `EXAMPLES` or "On this page" anchor navigation.

## What Changes

Structure `/docs/components/textarea` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for all 12 Textarea examples.

## Scope

### In scope
- Triage of PrimeNG Textarea candidates (`11-textarea.md`):
  - **Already supported, needs documentation (12 sections):** `Basic`, `Auto Resize` (`[autoResize]`), `Float Label` (`<med-float-label>`), `Ifta Label` (`<med-ifta-label>`), `Sizes` (`sm`, `default`, `lg`), `Fluid` (`[fluid]` — noting `inputTextVariants` already applies `w-full` by default), `Filled` (`variant="filled"`), `Disabled` (`disabled`), `Invalid` (`[invalid]`), `Signal Forms` (`[formField]`), `Template Driven` (`[(ngModel)]`), `Reactive Forms` (`[formControl]`).
  - **Not applicable / grouped:** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs); `Forms` grouped into the three concrete Angular form examples (`Signal Forms`, `Template Driven`, `Reactive Forms`); `Accessibility` documented via the API reference and native `<textarea>` / `aria-invalid` semantics.
- Update `projects/site/src/app/pages/docs/components/textarea.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 12 sections in order (reusing `TextareaBasicDemo` and `TextareaAutoresizeDemo`).
- Create missing `.demo.ts` / `.demo.html` pairs and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/textarea-docs.spec.ts` (`TXA-001.S1`).

### Out of scope
- Any changes to `projects/medra/ui/src/lib/textarea/` (library code and public API are untouched; no changeset required).

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| textarea | new | TXA-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/textarea.page.ts`, `projects/site/src/app/pages/docs/components/demos/textarea-*.demo.{ts,html}`, `projects/site/src/content/docs/textarea-*.txt`, `e2e/site/textarea-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
