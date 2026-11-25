# Learnings

## Active

### L-026 [lesson] Scope Playwright bound-value assertions to the output element

**Statement:** Assert interactive model updates on the specific bound output element (such as a Selected paragraph) and confirm the new value is absent before interaction, rather than calling toContainText on the whole demo container. Container-wide checks pass silently against static checkbox or option labels even when binding fails.
**Scope:** paths: e2e/** · stages: tasks, apply, verify
**Evidence:** document-checkbox-parity
**Occurrences:** 1
**Last seen:** 33

## Promoted

### L-001 [lesson] Never run build or test code in a job that holds the publish identity

**Statement:** Build and test in a read-only job, then have the publishing job download that job's artifact; it must not run the build itself. Assert this in a workflow contract test, because skipping install scripts does not stop build tooling from running dependency code.
**Scope:** capabilities: release-versioning · stages: plan, apply, verify
**Evidence:** automate-medra-ui-versioning-and-release, add-data-table-column-filters, data-table-sorting-columns-csv, document-input-text-parity
**Occurrences:** 4
**Last seen:** 31
**Promoted:** Article XII (v1.3)

### L-002 [lesson] Assert every Then clause when retagging a test with a scenario ID

**Statement:** When retagging an existing test with a scenario ID, check that it asserts each Given and Then clause of the scenario, not only the first. Coverage only matches the tag, so an unasserted clause passes it silently.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** extend-data-table-sorting-and-pagination, add-data-table-resize-modes-visibility-groups, add-data-table-pagination-options
**Occurrences:** 3
**Last seen:** 15
**Promoted:** Article XI (v1.2)

## Retired

### L-003 [lesson] Characterization tasks of existing behavior cannot show red evidence

**Statement:** When a change only documents and tests behavior that already works, write its test tasks so they do not require a red run, or the first apply stops on a blocker. State in tasks.md that the tests are expected green from the start.
**Scope:** capabilities: data-display · stages: tasks, apply
**Evidence:** document-row-identity-and-row-labels, add-data-table-row-editing-and-group-modes
**Occurrences:** 2
**Last seen:** 10
**Retired:** Stale since sequence 10: ten consecutive changes completed without characterization-task blockers.

### L-004 [preference] Commit the previous change before verifying the next one

**Statement:** Commit or archive the previous change's working-tree files before running verify, so the diff against diff_base holds only the current change's files.
**Scope:** stages: verify
**Evidence:** document-row-identity-and-row-labels
**Occurrences:** 1
**Last seen:** 6
**Retired:** Stale since sequence 6: every change since then was committed and archived before the next one started, so the verify diff never mixed changes again.

### L-005 [lesson] Record green evidence with the task's own verify command

**Statement:** Run the exact command named in a task's verify (for example the Playwright spec, not a Jest subset) when running medra task done. A done task cannot be reopened or have its evidence re-recorded.
**Scope:** stages: apply, verify
**Evidence:** add-data-table-resize-modes-visibility-groups
**Occurrences:** 1
**Last seen:** 8
**Retired:** Stale since sequence 8: ten consecutive changes followed task verify commands without hitting this error, and L-011 covers medra task done discipline.

### L-006 [lesson] Test each plan guard between two inputs with both inputs enabled

**Statement:** When a plan decision cancels or guards a gesture because another input is active (for example preventDefault on dragstart during a column resize), write a test that enables both inputs together and asserts the cancellation. A bare early return passes every single-input test.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-column-reorder, add-data-table-row-editing-and-group-modes
**Occurrences:** 2
**Last seen:** 10
**Retired:** Stale since sequence 10: ten consecutive changes completed without missing gesture-guard interaction tests.

### L-007 [lesson] Test layout features at every column position, not only the default one

**Statement:** Test rowspan or colspan features with a utility column (selection, reorder, row actions) before the merged column and with the merged column in the middle, and assert that each row's colspans plus its merged cells add up to the total column count. A test with the grouped column first passes while every other layout breaks.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-row-editing-and-group-modes
**Occurrences:** 1
**Last seen:** 10
**Retired:** Stale since sequence 10: ten consecutive changes completed without rowspan/colspan column-position regressions.

### L-008 [lesson] Use theme-defined color tokens for new interactive controls

**Statement:** Style new controls only with tokens the theme defines (for example brand-500, not primary-500); an unknown Tailwind class generates no CSS and silently drops the focus ring. Check the class against tailwind-theme-medraui.css before using it.
**Scope:** capabilities: data-display · stages: apply, verify
**Evidence:** add-data-table-row-editing-and-group-modes
**Occurrences:** 1
**Last seen:** 10
**Retired:** Stale since sequence 10: ten consecutive changes used theme-defined color tokens, which Constitution Article II already enforces.

### L-009 [lesson] Run all component e2e specs when changing wrapper DOM

**Statement:** When a change alters a component's wrapper or scroll-container DOM hierarchy, run every Playwright spec for that component (such as e2e/site/data-table-*.spec.ts), not only the newly added spec. Running only new specs or Jest misses selector regressions in existing e2e files.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-slots-and-skeleton
**Occurrences:** 1
**Last seen:** 12
**Retired:** Stale since sequence 12: ten consecutive changes completed without wrapper-DOM e2e regressions.

### L-010 [lesson] Target component regions with data attributes, not direct-child CSS paths

**Statement:** Query internal component regions like scroll viewports using semantic data-* attributes (such as data-med-scroll-viewport) instead of direct-child utility selectors like > div.overflow-x-auto. Direct-child class paths break whenever an outer wrapper element is added.
**Scope:** capabilities: data-display · stages: tasks, apply
**Evidence:** add-data-table-slots-and-skeleton
**Occurrences:** 1
**Last seen:** 12
**Retired:** Stale since sequence 12: ten consecutive changes completed without direct-child CSS path regressions, and L-016 covers semantic data-* row queries.

### L-011 [lesson] Confirm a red run fails on behavior before recording it

**Statement:** Run the targeted test alone first and confirm it fails on assertions of the missing behavior, then pass --kind red as a medra flag outside the --run string. A usage or setup error also exits non-zero, and a done task's evidence can never be re-recorded.
**Scope:** stages: tasks, apply, verify
**Evidence:** add-data-table-responsive-stack
**Occurrences:** 1
**Last seen:** 16
**Retired:** Stale since sequence 16: ten consecutive changes completed without red-evidence recording errors.

### L-012 [lesson] Keep internal grouping keys on the default comparison

**Statement:** When a column supplies a custom comparator, do not route internal keys such as the row-group field through it; sort those keys with the default comparison and apply custom comparators only to the user's sort entries. Test a grouping key with a comparator that inverts its order, because a default-order test cannot detect the leak.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-column-templates-and-custom-sort
**Occurrences:** 1
**Last seen:** 17
**Retired:** Stale since sequence 17: ten consecutive changes completed without internal grouping-key custom-comparator leaks.

### L-013 [lesson] Hide every utility cell when the stacked layout is active

**Statement:** When a layout mode hides content cells, also hide the utility cells (selection, reorder, row actions) in the same mode, including in footer rows. Assert in a test that no utility cell is visible in the stacked layout, because content-only assertions miss them.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-column-templates-and-custom-sort
**Occurrences:** 1
**Last seen:** 17
**Retired:** Stale since sequence 17: ten consecutive changes completed without visible utility cells in stacked layout.

### L-014 [lesson] Bound every restored field and downstream Array.from allocation

**Statement:** Enforce explicit upper bounds on every string and numeric field restored from storage, including fallback paths when optional allowlists like rowsPerPageOptions are unset. Also clamp downstream Array.from({ length }) allocations to a safe display maximum so extreme values cannot trigger RangeError or DOM stalls.
**Scope:** capabilities: data-display · stages: plan, tasks, apply, verify
**Evidence:** persist-data-table-extended-state
**Occurrences:** 1
**Last seen:** 18
**Retired:** Stale since sequence 18: ten consecutive changes completed without storage-restoration bound or Array.from allocation regressions.

### L-015 [lesson] Map virtualized table DOM rows by aria-rowindex, not local index

**Statement:** When resolving a body <tr> element back to its dataset row, compute the index from aria-rowindex into pagedValue() rather than indexing visibleBodyRows() by DOM position, because virtualScroll renders a windowed slice. Filter direct body cells with :scope > td[data-med-field] so nested tables cannot shift row indices.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** data-table-keyboard-selection
**Occurrences:** 1
**Last seen:** 19
**Retired:** Stale since sequence 19: eleven consecutive changes (including data-display and virtualScroll work) completed without aria-rowindex row-mapping regressions.

### L-016 [lesson] Query table rows by data-* attribute, not positional selectors like :last-child

**Statement:** Select table header and body rows using semantic data-* attributes (such as tr[data-med-header-row]) instead of positional selectors like thead tr:last-child, which break when sibling rows are added. When adding a new row mode, add a test combining existing keyboard focus restoration with the new mode.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** data-table-advanced-filters
**Occurrences:** 1
**Last seen:** 20
**Retired:** Stale since sequence 20: ten consecutive changes (including data-display changes 21-25) completed without positional table-row selector regressions.

### L-017 [lesson] Typecheck the UI library with tsconfig.lib.json after edits

**Statement:** Run npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json after editing UI library source, because npm test can pass while ng build typechecking fails. Fix every reported compiler error before finishing apply or verify.
**Scope:** paths: projects/medra/ui/** · stages: apply, verify
**Evidence:** data-table-sorting-columns-csv
**Occurrences:** 1
**Last seen:** 21
**Retired:** Stale since sequence 21: ten consecutive changes (including seven editing projects/medra/ui/**) completed without tsconfig.lib.json build-typecheck regressions.

### L-018 [lesson] Bind [selected] on @for <option> elements inside Angular <select>

**Statement:** Bind [selected] on each @for <option> inside <select> because Angular sets select.value before @for renders options when an @if block mounts. Disable or guard placeholder options when clearing is disallowed so the displayed label cannot desync from state.
**Scope:** capabilities: data-display · paths: projects/medra/ui/** · stages: apply, verify
**Evidence:** data-table-responsive-stack-enhancements
**Occurrences:** 1
**Last seen:** 22
**Retired:** Stale since sequence 22: eleven consecutive changes completed without Angular <select> @for [selected] desync regressions.

### L-019 [lesson] Verify dark mode and :focus-visible by comparing styles in Playwright

**Statement:** In Playwright tests, assert dark-mode backgroundColor differs from the pre-dark light value rather than a non-empty string, since getComputedStyle never returns "". Verify focus rings using keyboard Tab and computed outlineStyle/outlineWidth instead of programmatic .focus() alone.
**Scope:** paths: e2e/** · stages: tasks, apply, verify
**Evidence:** data-table-responsive-stack-enhancements, add-button-group
**Occurrences:** 2
**Last seen:** 30
**Retired:** stale

### L-020 [lesson] Disconnect DOM observers when resetting observer-backed measurements

**Statement:** When resetting measurements populated by a ResizeObserver or similar DOM observer, disconnect the observer and clear its tracked-elements set so reused @for DOM nodes are re-observed. Test state resets (such as sorting or replacing items) with reused nodes whose dimensions stay unchanged.
**Scope:** capabilities: data-display · paths: projects/medra/ui/** · stages: tasks, apply, verify
**Evidence:** data-table-virtual-variable-height
**Occurrences:** 1
**Last seen:** 23
**Retired:** Stale since sequence 23: ten consecutive changes completed without ResizeObserver reset regressions on reused @for DOM nodes.

### L-021 [lesson] Keep virtual window start off dependent items and test those offsets

**Statement:** When virtualizing paired items (such as an expansion row tied to a parent row), adjust the window start index back onto the parent item so a dependent row never opens a slice without its rowspan context. Always test scroll offsets that land directly on secondary item kinds, not only primary row offsets.
**Scope:** capabilities: data-display · paths: projects/medra/ui/** · stages: tasks, apply, verify
**Evidence:** data-table-virtual-features
**Occurrences:** 1
**Last seen:** 24
**Retired:** Stale since sequence 24: ten consecutive changes completed without paired-item virtual-window regressions.

### L-022 [lesson] Never index virtualized table header cells positionally against visibleColumns

**Statement:** When virtualScrollColumns is active, skip horizontal spacer <th> cells rather than using nextElementSibling or index offsets against visibleColumns(), because spacer cells and windowed slots misalign DOM cell indices. Match rendered columnSlots() directly and fall back to resolved column pixel widths for off-screen columns.
**Scope:** capabilities: data-display · paths: projects/medra/ui/** · stages: tasks, apply, verify
**Evidence:** data-table-virtual-horizontal-columns
**Occurrences:** 1
**Last seen:** 25
**Retired:** Stale since sequence 25: ten consecutive changes completed without virtualScrollColumns spacer-cell index misalignment regressions.

### L-023 [lesson] Monitor console errors and hydration warnings in Playwright docs tests

**Statement:** Attach both pageerror and console listeners in Playwright e2e tests and fail on console.error or Angular hydration messages, because pageerror alone misses console errors and hydration mismatches. Assert element visibility and non-empty rendered text rather than DOM attachment alone.
**Scope:** paths: e2e/** · stages: tasks, apply, verify
**Evidence:** document-date-picker-parity
**Occurrences:** 1
**Last seen:** 26
**Retired:** Stale since sequence 26: ten consecutive changes completed without Playwright console/hydration-listener or DOM-only visibility regressions.

### L-024 [lesson] Read component source and reused doc files before writing docs demos

**Statement:** Verify component behavior in the library source before writing documentation prose instead of assuming overlay or navigation flows. When wiring an existing doc or demo file to a section, read it first to confirm it demonstrates that exact input.
**Scope:** paths: projects/site/** · stages: apply, verify
**Evidence:** document-date-picker-parity
**Occurrences:** 1
**Last seen:** 26
**Retired:** Stale since sequence 26: ten consecutive changes completed without component-source assumptions or unverified reused doc file regressions.

### L-025 [lesson] Accept undefined on constraint inputs for Signal Forms [formField]

**Statement:** Widen numeric constraint inputs (such as min and max) to accept undefined alongside null and normalize with ?? null, because Angular Signal Forms [formField] binds unset constraints as undefined. When a docs change needs this fix, bring it into proposal scope with a changeset and a Jest [formField] bidirectional sync test.
**Scope:** paths: projects/medra/ui/**, projects/site/** · stages: propose, tasks, apply, verify
**Evidence:** document-input-number-parity
**Occurrences:** 1
**Last seen:** 28
**Retired:** stale
