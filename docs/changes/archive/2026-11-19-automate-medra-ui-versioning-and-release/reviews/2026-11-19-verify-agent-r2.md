# Review: automate-medra-ui-versioning-and-release — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-19

## Summary

Round 2 confirms that F-01, F-02, F-03 and F-05 from r1 are resolved, and it found no regressions. The suite was dispatched as green. REL-005 and REL-006.S1 stay covered only by contract tests. They count as `met` here because the user recorded that decision at round 1: they are accepted as covered by contract tests, and the first real run is confirmed after the repository is on GitHub. The one open finding is F-04, which was left open on purpose (minor).

## Findings

### F-04 [minor] The Version Packages PR can fail its own changeset check

**Where:** `tools/release/check.mjs:79-84`, `.github/workflows/ci.yml` · REL-004, D-18
**Problem:** Carried from r1, left open deliberately. The version PR edits `projects/medra/ui/package.json` and `CHANGELOG.md` and deletes the changesets, so it adds none. If a `pull_request` event ever runs `ci.yml` on it (reopen, or a manual push), `checkChangesetRequired` fails it. The dispatched run avoids this only because `GITHUB_BASE_REF` is empty there, so `safeBase()` returns null and the check returns `[]`.
**Fix:** Exempt head branches that match `changeset-release/*`, or state in `RELEASING.md` that only the dispatched run is expected. Add a unit test for whichever you choose.

## Fixed since r1

| Finding | Status | Evidence |
|---|---|---|
| F-01 | resolved | `release.yml`: the `release` job has no `npm run build`. It downloads `medra-ui-dist` with the SHA-pinned `actions/download-artifact@37930b1c…` into `dist/medra/ui`, before `changesets/action`. `workflows.test.ts:89-96` asserts all three properties. `publish.mjs` reads `dist/medra/ui/package.json`. |
| F-02 | resolved | `workflows.test.ts:74-87` now asserts `policy < tests < build` inside `verify`. REL-005.S2 and REL-006.S1 are covered under the round 1 user decision, so no finding remains. |
| F-03 | resolved | `check.mjs:36-44` uses `matchAll`. Any `major` entry wins, and front matter with no readable bump exits `2` (fail closed). |
| F-05 | resolved | `check.mjs:62-67` exits `2` when `origin/<base>:package.json` cannot be read, instead of skipping REL-009. |

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `REL-001` | carried from r1: `tests/release/baseline.test.ts:7-8`; package `21.0.0` | met |
| `REL-002` | carried from r1: `tests/release/policy.test.ts:20-51` | met |
| `REL-003` | `tests/release/policy.test.ts:55-78`; the F-03 parsing edge is now fail-closed in `check.mjs:36-44` | met |
| `REL-004` | carried from r1: `tests/release/changeset-required.test.ts` (see F-04) | met |
| `REL-005` | `release.yml` triggers and the `version-script` and `publish-script` inputs (`workflows.test.ts:50,98-107`). No run on a real repository yet. Accepted as covered by contract tests, by user decision at round 1; the first real run is confirmed after the repository is on GitHub | met |
| `REL-006` | S2: `needs: verify`, with the ordered policy, test and build steps in `verify` (`workflows.test.ts:63-87`). S1: `release` publishes the verified artifact (`workflows.test.ts:89-96`, `publish.mjs`). The real publish is accepted by the same round 1 user decision | met |
| `REL-007` | `id-token: write` only on `release`, no stored token, D-13 now honored (`workflows.test.ts:68,89-96,109,151`) | met |
| `REL-008` | carried from r1: `tests/release/policy.test.ts:82-116` | met |
| `REL-009` | `tests/release/policy.test.ts:129-153`; the F-05 CLI edge is now closed | met |

Constitution: Article X holds, and Articles V and VII hold. Scope: no file outside the task and plan map was found in this round. Weakening audit: with `diff_base: none` there is no baseline. I read the changed `workflows.test.ts` and found stronger assertions than r1, with no skips and no mocks of the behavior under test. The suite was dispatched as green and was not re-run.
