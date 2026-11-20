# Learnings

## Active

### L-001 [lesson] Never run build or test code in a job that holds the publish identity

**Statement:** Build and test in a read-only job, then have the publishing job download that job's artifact; it must not run the build itself. Assert this in a workflow contract test, because skipping install scripts does not stop build tooling from running dependency code.
**Scope:** capabilities: release-versioning · stages: plan, apply, verify
**Evidence:** automate-medra-ui-versioning-and-release
**Occurrences:** 1
**Last seen:** 1

### L-002 [lesson] Assert every Then clause when retagging a test with a scenario ID

**Statement:** When retagging an existing test with a scenario ID, check that it asserts each Given and Then clause of the scenario, not only the first. Coverage only matches the tag, so an unasserted clause passes it silently.
**Scope:** capabilities: data-display · stages: tasks, apply, verify
**Evidence:** extend-data-table-sorting-and-pagination, add-data-table-resize-modes-visibility-groups
**Occurrences:** 2
**Last seen:** 8

### L-003 [lesson] Characterization tasks of existing behavior cannot show red evidence

**Statement:** When a change only documents and tests behavior that already works, write its test tasks so they do not require a red run, or the first apply stops on a blocker. State in tasks.md that the tests are expected green from the start.
**Scope:** capabilities: data-display · stages: tasks, apply
**Evidence:** document-row-identity-and-row-labels
**Occurrences:** 1
**Last seen:** 6

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

## Promoted

## Retired
