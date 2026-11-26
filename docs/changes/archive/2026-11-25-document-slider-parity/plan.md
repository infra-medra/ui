# Plan: document-slider-parity

## Summary

`SliderComponent` gets a working vertical layout (SLD-005) and the docs page gets 14 structured examples (SLD-001). The four slider style recipes in `projects/medra/ui/src/lib/slider/slider.styles.ts` gain an `orientation` variant (default `horizontal`, so every current class string is unchanged). The component passes `orientation()` to each recipe, positions thumbs with `bottom` instead of `left` and the fill with `bottom`/`height` instead of `left`/`width` when vertical, and maps pointer events through `clientY` against the track's height instead of `clientX` against its width. Keyboard handling is untouched. The docs page follows the AutoComplete/Checkbox layout, with one demo, `.txt` prose and code block per example. The slider requirements move from `form-choice-inputs` to the new `slider` capability, which also takes ownership of `projects/medra/ui/src/lib/slider/**`.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | The component keeps its signal inputs and `computed` styles; demos are standalone and use signals or plain fields with forms directives. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Vertical classes are new CVA variants using existing spacing and color tokens; the wrapper still merges `class` through `mergeClasses`, which lets consumers override the default vertical height. Colors are unchanged, so dark mode is unchanged. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlays or icons. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | pass | The existing `ControlValueAccessor` is unchanged; value 0 and `min` handling are untouched. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | T003 (Jest, SLD-005.S1/S2) and T004 (Playwright, SLD-005.S3) come before T005; SLD-001.S1 is covered by T001 (Playwright), already recorded red. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Thumbs keep `role="slider"`, `aria-orientation`, the same keyboard map (ArrowUp/ArrowRight increase) and focus-visible ring; SLD-002.S1 covers keys and SLD-005.S3 covers vertical drag in a real browser. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Demos and prose are written for this API, in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | No new internal strings; demo labels are consumer content. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Adds `.changeset/slider-vertical.md` as `minor`. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | SLD-005.S2 leaves `min`/`max` at their defaults of 0 and 100, and each test asserts its Given state before acting. |
| XII | Does this change keep every install, build and test step out of the job that holds the publish identity, with a workflow contract test asserting it? | n/a | No CI workflow changes. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/slider` and `npx playwright test --project=site e2e/site/slider-docs.spec.ts e2e/site/slider-vertical.spec.ts`
- **Framework:** Jest (jsdom) and Playwright

| Scenario | Level | Test location |
|---|---|---|
| `SLD-001.S1` | e2e | `e2e/site/slider-docs.spec.ts` |
| `SLD-002.S1` | unit | `projects/medra/ui/src/lib/slider/slider.component.spec.ts` |
| `SLD-003.S1` | unit | `projects/medra/ui/src/lib/slider/slider.component.spec.ts` |
| `SLD-004.S1` | unit | `projects/medra/ui/src/lib/slider/slider.component.spec.ts` |
| `SLD-005.S1` | unit | `projects/medra/ui/src/lib/slider/slider.component.spec.ts` |
| `SLD-005.S2` | unit | `projects/medra/ui/src/lib/slider/slider.component.spec.ts` |
| `SLD-005.S3` | e2e | `e2e/site/slider-vertical.spec.ts` |

## Decisions

### D-01: Default vertical height on the track wrapper

**Choice:** The vertical wrapper variant sets `h-56`. Because the wrapper merges the consumer `class`, `class="h-40"` replaces it.
**Alternatives:** Require the consumer to size a container (the reason the original v1 cut vertical); read the height from the host element.
**Rationale:** A slider with no height collapses to nothing, so a default is needed. Putting it on the element that already receives `class` gives one obvious override path, consistent with how width already defaults to full.

### D-02: Orientation as a CVA variant, not separate recipes

**Choice:** Add `orientation: { horizontal, vertical }` to the existing four recipes, with `compoundVariants` for size-dependent thickness and padding.
**Alternatives:** New `verticalTrack…Variants` exports.
**Rationale:** Keeps one recipe per part, so consumers who already compose these exports get vertical support through one extra prop, and the horizontal output stays byte-identical by default.
