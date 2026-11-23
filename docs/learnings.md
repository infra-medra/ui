# Learnings

## Active

### L-001 [lesson] Never run build or test code in a job that holds the publish identity

**Statement:** Build and test in a read-only job, then have the publishing job download that job's artifact; it must not run the build itself. Assert this in a workflow contract test, because skipping install scripts does not stop build tooling from running dependency code.
**Scope:** capabilities: release-versioning · stages: plan, apply, verify
**Evidence:** automate-medra-ui-versioning-and-release, add-data-table-column-filters
**Occurrences:** 2
**Last seen:** 11

### L-002 [lesson] Assert every Then clause when retagging a test with a scenario ID

**Statement:** When retagging an existing test with a scenario ID, check that it asserts each Given and Then clause of the scenario, not only the first. Coverage only matches the tag, so an unasserted clause passes it silently.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** extend-data-table-sorting-and-pagination, add-data-table-resize-modes-visibility-groups, add-data-table-pagination-options
**Occurrences:** 3
**Last seen:** 15

### L-003 [lesson] Characterization tasks of existing behavior cannot show red evidence

**Statement:** When a change only documents and tests behavior that already works, write its test tasks so they do not require a red run, or the first apply stops on a blocker. State in tasks.md that the tests are expected green from the start.
**Scope:** capabilities: data-display · stages: tasks, apply
**Evidence:** document-row-identity-and-row-labels, add-data-table-row-editing-and-group-modes
**Occurrences:** 2
**Last seen:** 10

### L-004 [preference] Commit the previous change before verifying the next one

**Statement:** Commit or archive the previous change's working-tree files before running verify, so the diff against diff_base holds only the current change's files.
**Scope:** stages: verify
**Evidence:** document-row-identity-and-row-labels
**Occurrences:** 1
**Last seen:** 6

### L-005 [lesson] Record green evidence with the task's own verify command

**Statement:** Run the exact command named in a task's verify (for example the Playwright spec, not a Jest subset) when running medra task done. A done task cannot be reopened or have its evidence re-recorded.
**Scope:** stages: apply, verify
**Evidence:** add-data-table-resize-modes-visibility-groups
**Occurrences:** 1
**Last seen:** 8

### L-006 [lesson] Test each plan guard between two inputs with both inputs enabled

**Statement:** When a plan decision cancels or guards a gesture because another input is active (for example preventDefault on dragstart during a column resize), write a test that enables both inputs together and asserts the cancellation. A bare early return passes every single-input test.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-column-reorder, add-data-table-row-editing-and-group-modes
**Occurrences:** 2
**Last seen:** 10

### L-007 [lesson] Test layout features at every column position, not only the default one

**Statement:** Test rowspan or colspan features with a utility column (selection, reorder, row actions) before the merged column and with the merged column in the middle, and assert that each row's colspans plus its merged cells add up to the total column count. A test with the grouped column first passes while every other layout breaks.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-row-editing-and-group-modes
**Occurrences:** 1
**Last seen:** 10

### L-008 [lesson] Use theme-defined color tokens for new interactive controls

**Statement:** Style new controls only with tokens the theme defines (for example brand-500, not primary-500); an unknown Tailwind class generates no CSS and silently drops the focus ring. Check the class against tailwind-theme-medraui.css before using it.
**Scope:** capabilities: data-display · stages: apply, verify
**Evidence:** add-data-table-row-editing-and-group-modes
**Occurrences:** 1
**Last seen:** 10

### L-009 [lesson] Run all component e2e specs when changing wrapper DOM

**Statement:** When a change alters a component's wrapper or scroll-container DOM hierarchy, run every Playwright spec for that component (such as e2e/site/data-table-*.spec.ts), not only the newly added spec. Running only new specs or Jest misses selector regressions in existing e2e files.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** add-data-table-slots-and-skeleton
**Occurrences:** 1
**Last seen:** 12

### L-010 [lesson] Target component regions with data attributes, not direct-child CSS paths

**Statement:** Query internal component regions like scroll viewports using semantic data-* attributes (such as data-med-scroll-viewport) instead of direct-child utility selectors like > div.overflow-x-auto. Direct-child class paths break whenever an outer wrapper element is added.
**Scope:** capabilities: data-display · stages: tasks, apply
**Evidence:** add-data-table-slots-and-skeleton
**Occurrences:** 1
**Last seen:** 12

## Promoted

## Retired
