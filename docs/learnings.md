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
**Evidence:** extend-data-table-sorting-and-pagination
**Occurrences:** 1
**Last seen:** 5

## Promoted

## Retired
