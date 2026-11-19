# Learnings

## Active

### L-001 [lesson] Never run build or test code in a job that holds the publish identity

**Statement:** Build and test in a read-only job, then have the publishing job download that job's artifact; it must not run the build itself. Assert this in a workflow contract test, because skipping install scripts does not stop build tooling from running dependency code.
**Scope:** capabilities: release-versioning · stages: plan, apply, verify
**Evidence:** automate-medra-ui-versioning-and-release
**Occurrences:** 1
**Last seen:** 1

## Promoted

## Retired
