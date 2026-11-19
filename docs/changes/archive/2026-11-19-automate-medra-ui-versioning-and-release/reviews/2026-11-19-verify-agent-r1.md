# Review: automate-medra-ui-versioning-and-release — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 0 · major 1 · minor 4
**Reviewer:** reviewer agent
**Date:** 2026-11-19

## Summary

The pure policy rules (REL-001 to REL-004, REL-008, REL-009) are implemented and covered by tests that exercise their Given, When and Then. The suite is green, and the TDD evidence is complete: a red line on every `[TEST]` task and a green line on every implementation task. The verdict is `fail` because REL-005 and REL-006.S1 are `unverified`. Only contract tests that read workflow text cover them, and the plan assigns their real behavior to a manual first-run verification that is not recorded. The most important finding is F-01: the `release` job builds dependency code while it holds `id-token: write`, which contradicts D-13.

## Findings

### F-01 [major] Release job runs the build with the publishing identity, contradicting D-13

**Where:** `.github/workflows/release.yml:62-65` · REL-007, task T020, plan D-13 and M-05
**Problem:** D-13 says untrusted build and test code runs only in `verify`, and that `release` "publishes the artifact `verify` built". The `release` job instead runs `npm ci --ignore-scripts` and then `npm run build` (ng-packagr and Tailwind, with all their dependency code) in the job that holds `id-token: write`, `contents: write` and `actions: write`. A comment says "actions/download-artifact is not used: the build is repeated". As a result, `verify` uploads `medra-ui-dist` and nothing consumes it. Skipping install scripts does not remove the exposure, because the build still executes dependency code. `workflows.test.ts` does not assert the D-13 property, so the test suite hides the deviation.
**Fix:** In `release`, replace `npm run build` with a download of the `medra-ui-dist` artifact into `dist/medra/ui`, using a SHA-pinned `actions/download-artifact`. Keep `npm ci --ignore-scripts` only if `changeset version` or `changeset tag` needs it. Add a contract test that the `release` job contains no `npm run build` and does download the artifact.

### F-02 [minor] Contract tests are weaker than their scenario labels

**Where:** `tests/release/workflows.test.ts:267-271`, `:321-333`, `:370-382` · REL-005.S2, REL-006.S1, REL-006.S2
**Problem:**
- The test labelled REL-006.S2 for the step order never compares the positions of the policy check, `npm test` and `npm run build`. It only checks that each exists in `verify`, and that the `changesets/action` text appears after `npm run build` in the file.
- REL-005.S2 is covered by an assertion that the string `changesets/action@` exists, which asserts nothing about "no version PR without changesets".
- The coverage entries for REL-006.S1 point at the concurrency and dispatch tests, which do not show publication.
**Fix:** Assert `policy < tests < build` inside `verify`. Re-label the concurrency and dispatch tests to the requirement they actually serve. Record REL-005.S2 and REL-006.S1 as manual verification, because the contract test cannot prove them.

### F-03 [minor] Changeset bump parsing reads only the first package entry

**Where:** `tools/release/check.mjs:33-35` · REL-003
**Problem:** `/:\s*['"]?(major|minor|patch)['"]?\s*$/m.exec(front)` returns the first match in the front matter. A changeset that lists another package first and `'@medra/ui': major` second passes the policy check. If the front matter does not match, the bump defaults to `patch`, which fails open.
**Fix:** Use `matchAll` over the front matter and report `major` if any entry is `major`, or read the `@medra/ui` entry explicitly. Treat an unparseable front matter as a violation.

### F-04 [minor] The Version Packages PR can fail its own changeset check

**Where:** `tools/release/check.mjs:62-69`, `.github/workflows/ci.yml` · REL-004, D-18
**Problem:** The version PR edits `projects/medra/ui/package.json` and `CHANGELOG.md` and deletes the changesets, so it adds none. If a `pull_request` event ever runs `ci.yml` on it (reopen, or a manual push), `checkChangesetRequired` fails it. The dispatched run avoids this only because `GITHUB_BASE_REF` is empty there, which makes the check return `[]` silently.
**Fix:** Exempt head branches that match `changeset-release/*`, or state in `RELEASING.md` that only the dispatched run is expected. Add a unit test for whichever you choose.

### F-05 [minor] An unreadable base branch silently skips the REL-009 check

**Where:** `tools/release/check.mjs:52-55` · REL-009.S2
**Problem:** When `git show origin/<base>:package.json` fails, `baseAngularMajor` becomes `null`. `movesBaseline` is then false and the missing-release-branch rule never runs, so the check passes.
**Fix:** On a pull request where the base is known but its `package.json` cannot be read, return a violation (or exit `2`) instead of passing.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `REL-001` | `tests/release/baseline.test.ts:7-8` and the green line on T005; `projects/medra/ui/package.json` is `21.0.0` and the CHANGELOG has `## 21.0.0` | met |
| `REL-002` | `tests/release/policy.test.ts:20-51` assert the rule, the message and both majors or the peer name; `policy.mjs` `checkVersionPolicy` | met |
| `REL-003` | `tests/release/policy.test.ts:55-78`; `policy.mjs` major-changeset rule (see F-03 for the parsing edge) | met |
| `REL-004` | `tests/release/changeset-required.test.ts`, including the README and test-only edge cases; `policy.mjs` `checkChangesetRequired` (see F-04) | met |
| `REL-005` | `release.yml` triggers, `version-script` and `publish-script` inputs, which exist in the pinned action's `action.yml`, and `workflows.test.ts:50,88,95`. The version PR and the no-changesets behavior need a real run, and no manual verification is on disk | unverified |
| `REL-006` | S2 is met: `needs: verify`, with policy, tests and build in `verify` (`workflows.test.ts:20-35`). S1, the real publish through `dist/medra/ui`, has no recorded first-run verification, and see F-01 | unverified |
| `REL-007` | `release.yml` has `id-token: write` only on `release`, no `NPM_TOKEN` or `NODE_AUTH_TOKEN`, npm 11.5.1 or later and Node 22.14 or later (`workflows.test.ts:68,99,128`) | met |
| `REL-008` | `tests/release/policy.test.ts:82-116` including the branch-name injection cases; `policy.mjs` | met |
| `REL-009` | `tests/release/policy.test.ts:129-153`; `policy.mjs` (see F-05 for the CLI edge) | met |

Constitution: Article X holds (package `21.0.0`, peers `^21.x`, no `major` changeset pending). Articles I-IV, VI and VIII are not applicable. Articles V and VII hold. No scope creep: every changed file maps to a task or plan section.

Evidence audit: every `[TEST]` task has a red line and every implementation task has a green line. Tasks T009, T011, T013, T016 and T018-T024 carry `[test-edited]`. With `diff_base: none` there is no baseline to diff, so the weakening audit rests on reading the final tests. They keep strong assertions, with no skips and no mocks of the behavior under test. The suite was dispatched as green and was not re-run.
