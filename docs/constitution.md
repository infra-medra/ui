# Constitution

**Status:** ratified
**Version:** 1.2
**Ratified:** 2026-11-19
**Last amended:** 2026-11-23

## Articles

### Article I: Modern Angular only

Every component, directive and service MUST be standalone and use signal-based APIs (`input()`, `output()`, `model()`, `viewChild()`). It MUST NOT use NgModule, and it MUST NOT depend on zone.js behavior to update its view.

**Gate:** Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js?
**Rationale:** The library targets Angular 21+ and zoneless-ready apps; a legacy-style component would break zoneless consumers and contradict the rewrite's signal-first premise.

### Article II: Self-contained styling and class override

Component styling MUST come from Tailwind v4 utilities driven by the MedraUi design tokens, with variants composed through CVA. Every component MUST expose a `class` input merged through the shared `tailwind-merge` helper so the consumer's classes win on conflict. All visual states MUST work under the root `dark` class. A component MUST NOT require the consumer to configure Tailwind.

**Gate:** Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class?
**Rationale:** The pre-generated `styles.css` is the product's delivery model; hard-coded colors or ad hoc class merging break theming, dark mode and the supported override path.

### Article III: Shared primitives first

Overlays (dialog, popover, menu, toast) MUST be built on the shared `OverlayService`, with a focus trap and Esc/outside-click close that returns focus to the opener. Icons MUST go through the Heroicons wrapper (or an own-drawn icon in the same wrapper). A component MUST NOT ship its own isolated overlay or icon implementation.

**Gate:** Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation?
**Rationale:** Per-component overlays have already caused layering and focus bugs (z-index conflicts, misplaced portal content); one shared primitive fixes them once.

### Article IV: Form controls follow the CVA contract

Every component that accepts user input MUST implement `ControlValueAccessor` for Reactive Forms and MUST treat falsy values (`false`, `0`, empty string) as distinct from `null` and `undefined`. It MUST cover default, hover, focus, disabled and invalid states.

**Gate:** Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states?
**Rationale:** The Checkbox `false`-binding bug showed that falsy normalization is easy to get wrong and breaks real forms.

### Article V: Test-first, with real-browser verification

Every behavior change and every bug fix MUST be covered by a Jest test that is written and seen failing before the implementation. Behavior that depends on computed layout, CSS or real `:hover`/focus MUST additionally be verified in a real browser (the showcase or a Playwright test), because jsdom does not cover it.

**Gate:** Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification?
**Rationale:** Several DatePicker, Select and Toast bugs passed all Jest tests and were only caught in a real browser.

### Article VI: Accessibility and keyboard operation

Every interactive component MUST meet WCAG 2.1 AA: correct ARIA roles and attributes, full keyboard operation, visible focus and sufficient contrast. Composite widgets MUST follow the matching ARIA Authoring Practices pattern.

**Gate:** Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each?
**Rationale:** Accessibility is a stated product pillar; retrofitting roles and keyboard handling after release changes public behavior.

### Article VII: Original work, in English

Component logic, documentation prose, demo code and datasets MUST be written from scratch. A change MUST NOT copy third-party source, docs or icon shapes, and MUST NOT use Font Awesome as a drawing reference. All text in source files MUST be English (comments, TSDoc, identifiers, test descriptions, log messages, CSS comments, changelog and changeset entries); only files under `roadmap/` MAY be written in Portuguese.

**Gate:** Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English?
**Rationale:** The rewrite exists to be a clean, MIT-licensed public library, so copied code or proprietary icon shapes would undermine the license, and CLAUDE.md makes English mandatory outside the Portuguese roadmap hub.

### Article VIII: Text through inputs, not a translation service

Any text a component renders internally (labels, aria-labels, default messages) MUST be exposed as an input, or as a per-call field for imperative services, with an English default. The library MUST NOT introduce a translation service or global text-defaults provider.

**Gate:** Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service?
**Rationale:** Consumers already use their own i18n tooling; a built-in service would force a second API to learn and keep in sync.

### Article IX: Retired (English source)

**Retired:** v1.1 (merged into Article VII)

### Article X: Version follows the Angular major

The `@medra.dev/ui` major version MUST equal the Angular major that the repository is built and tested against (the `@angular/core` version in the root `package.json`). Changesets MUST use only `minor` (features) and `patch` (fixes) while that Angular major stays the same, and breaking API changes MUST NOT ship until the Angular baseline moves to a new major. The peer dependency ranges in `projects/medra/ui/package.json` MUST target that same Angular major.

**Gate:** Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major?
**Rationale:** Consumers pick the library version from their Angular version, and an unmanaged major (the package is still 0.x while targeting Angular 21) hides which Angular a release supports.

### Article XI: Tests assert every clause of the scenario they cover

Every test tagged with a scenario ID MUST assert each Given and Then clause of that scenario, including the library's own defaults when the scenario relies on them, with the inputs left unset. A test MUST NOT satisfy a Given clause by passing the expected value in from its host.

**Gate:** Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them?
**Rationale:** Coverage matches only the scenario tag, so an unasserted clause passes silently. This was found in extend-data-table-sorting-and-pagination, add-data-table-resize-modes-visibility-groups and add-data-table-pagination-options.

## Amendments

| Version | Date | Change | Source |
|---|---|---|---|
| 1.0 | 2026-11-19 | Initial constitution | init |
| 1.1 | 2026-11-19 | Add Article X (version follows Angular major); retire IX into VII | init |
| 1.2 | 2026-11-23 | Add Article XI (tests assert every clause of the scenario they cover), promoted from L-002 (Tiago Cavalli) | L-002 |
