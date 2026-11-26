# Proposal: document-slider-parity

## Why

The `/docs/components/slider` page documents only an intro, the basic example and a `Range constraints` block, with no `EXAMPLES` list or "On this page" navigation, although `SliderComponent` (`projects/medra/ui/src/lib/slider/slider.component.ts`) already supports step, range mode, handle distance, per-handle disabling, sizes, disabled and invalid states, and Angular forms. Its `orientation="vertical"` input only sets `aria-orientation`: the track, thumbs and pointer handling stay horizontal, so PrimeNG's Vertical slider has no working equivalent. Readers cannot discover most of these features, and the slider's behavior requirements still live in the `form-choice-inputs` umbrella spec instead of a spec the component owns.

## What Changes

- `orientation="vertical"` renders a real vertical slider: the track runs bottom (`min`) to top (`max`), thumbs and fill follow it, and pointer presses and drags map the vertical position to a value.
- The Slider documentation page lists 14 examples in "On this page", each with English prose, a live demo and its code.
- Slider behavior requirements move into a new `slider` capability that owns `projects/medra/ui/src/lib/slider/**`, matching the per-component specs (checkbox, select-button, dialog…).

## Scope

### In scope

- Triage of the PrimeNG Slider candidates (`qa/parity/prompts/08-slider.md`):
  - **Already supported, needs documentation (14 sections):** `Basic`, `Step` (`step`), `Range` (`range`), `Range Constraints` (PrimeNG "Handles Distance": `minStepsBetweenHandles`, plus `disabledMinHandle`/`disabledMaxHandle`), `Vertical` (see below), `Sizes` (`size`), `Disabled` (`disabled`), `Invalid` (`invalid`), `Controlled` (value changed from outside the slider), `Custom` (consumer `class` override), `Filter` (sliders driving CSS image filters, a usage example), `Signal Forms` (`[formField]`), `Template Driven` (`[(ngModel)]`) and `Reactive Forms` (`[formControl]`).
  - **Missing in MedraUi, implemented here:** `Vertical`. `orientation="vertical"` exists but only sets `aria-orientation`; this change makes the layout, thumbs, fill and pointer handling vertical (new requirement SLD-005), with a `minor` changeset.
  - **Missing in MedraUi, deferred to `add-slider-events`:** `Value Change` (PrimeNG `onChange` and `onSlideEnd`); `SliderComponent` has no outputs today.
  - **Not applicable / grouped:** `Forms` is covered by the three concrete Angular form examples; `Accessibility` is the shared `<app-component-doc>` section, and the intro already describes the keyboard support.
- Rewrite `projects/site/src/app/pages/docs/components/slider.page.ts` to use `EXAMPLES` with `<app-component-doc [examples]="examples">`, in the order above.
- Add the missing `slider-*.demo.{ts,html}` demos and English `.txt` prose files.
- Add Playwright verification in `e2e/site/slider-docs.spec.ts`.
- Move `CHO-012`, `CHO-013` and `CHO-014` from `form-choice-inputs` to the new `slider` capability as `SLD-002`, `SLD-003` and `SLD-004`, and move the `slider/**` path with them.

### Out of scope

- Value-change outputs (`onChange`/`onSlideEnd`), which land in `add-slider-events`.
- Any slider library change other than the vertical orientation.
- Other components still listed in `form-choice-inputs`.

## Track

**Track:** full
**Rationale:** Started as documentation only (fast), then switched to full when the vertical orientation turned out to be aria-only: implementing it changes library behavior and the exported `slider.styles` variants, and needs a `minor` changeset.
**Security:** not-relevant
**Security rationale:** No authentication, data handling, network, or user-supplied HTML is involved; demos render static, typed values.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `slider` | new | SLD-001, SLD-002, SLD-003, SLD-004, SLD-005 |
| `form-choice-inputs` | removed | CHO-012, CHO-013, CHO-014 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/slider.page.ts`, `projects/site/src/app/pages/docs/components/demos/slider-*.demo.{ts,html}`, `projects/site/src/content/docs/slider-*.txt`, `e2e/site/slider-docs.spec.ts`, `projects/medra/ui/src/lib/slider/{slider.component.ts,slider.styles.ts,slider.component.spec.ts}`, `e2e/site/slider-vertical.spec.ts`, `.changeset/slider-vertical.md`
- **Interfaces:** `trackWrapperVariants`, `trackBarVariants`, `trackFillVariants` and `sliderThumbVariants` gain an `orientation` variant (default `horizontal`, backwards-compatible).
- **Data:** None.
- **Dependencies:** None (adds a `minor` changeset for `@medra.dev/ui`).

## Open Questions

None.
