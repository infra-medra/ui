# Plan: automate-medra-ui-versioning-and-release

## Summary

Release automation is built from three parts. A dependency-free Node module, `tools/release/policy.mjs`, holds the pure rules (Angular major, version policy, changeset requirement) and a thin CLI, `tools/release/check.mjs`, feeds it git and file facts (REL-002, REL-003, REL-004, REL-008, REL-009). Two GitHub Actions workflows run it: `ci.yml` on pull requests with read-only permissions, and `release.yml` on pushes to `main` and `release/**`, which gates on tests, builds and the policy check before the Changesets action opens the "Version Packages" PR or publishes (REL-005, REL-006). Publishing runs `tools/release/publish.mjs`, which publishes the built package in `dist/medra/ui` through npm Trusted Publishing, with no stored token (REL-007). The package is baselined at `21.0.0` once, by a one-time repository edit (REL-001).

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | n/a | No Angular class is added or changed; the change adds Node scripts and workflows. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | n/a | No styled element is added. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay or icon is added. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | No input component is added. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every REL scenario to a Jest test; tasks will order each `[TEST]` first. No scenario depends on layout or CSS. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | n/a | No interactive element is added. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All scripts, workflows, comments and the 21.0.0 changelog entry are written from scratch in English; the only third-party code used is the official Changesets action, invoked, not copied. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No UI strings; no translation service added. |
| X | Does this change keep the `@medra/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | D-01 sets `21.0.0` against `@angular/core` `21.2.25`; peer ranges stay `^21.2.0`; the policy check (D-02) enforces it from then on. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest tests/release`
- **Framework:** Jest (`testMatch` already includes `tests/**/*.test.ts`)

| Scenario | Level | Test location |
|---|---|---|
| `REL-001.S1` | unit | `tests/release/baseline.test.ts` |
| `REL-002.S1` | unit | `tests/release/policy.test.ts` |
| `REL-002.S2` | unit | `tests/release/policy.test.ts` |
| `REL-002.S3` | unit | `tests/release/policy.test.ts` |
| `REL-003.S1` | unit | `tests/release/policy.test.ts` |
| `REL-003.S2` | unit | `tests/release/policy.test.ts` |
| `REL-004.S1` | unit | `tests/release/changeset-required.test.ts` |
| `REL-004.S2` | unit | `tests/release/changeset-required.test.ts` |
| `REL-004.S3` | unit | `tests/release/changeset-required.test.ts` |
| `REL-005.S1` | contract | `tests/release/workflows.test.ts` |
| `REL-005.S2` | contract | `tests/release/workflows.test.ts` |
| `REL-006.S1` | contract | `tests/release/workflows.test.ts` |
| `REL-006.S2` | contract | `tests/release/workflows.test.ts` |
| `REL-007.S1` | contract | `tests/release/workflows.test.ts` |
| `REL-008.S1` | unit | `tests/release/policy.test.ts` |
| `REL-008.S2` | unit | `tests/release/policy.test.ts` |
| `REL-009.S1` | unit | `tests/release/policy.test.ts` |
| `REL-009.S2` | unit | `tests/release/policy.test.ts` |

The `contract` tests read the workflow files as text and assert the configuration that produces the behavior: trigger branches, step order (tests, builds and policy check before the Changesets action), permissions, the absence of any npm token reference, and the publish script path. The Changesets action's own behavior (REL-005, REL-006.S1) is confirmed once by the first real run, recorded as manual verification at the verify step.

## Pipeline design

- **Files:** `tools/release/policy.mjs` (pure rules plus a sibling `policy.d.mts` so the TS tests type-check), `tools/release/check.mjs` (CLI: `policy`, `changeset`), `tools/release/publish.mjs`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/CODEOWNERS`, `.github/dependabot.yml`, `RELEASING.md` (repository settings and the first-publish procedure). Root `package.json` gets `release:check`, and `release` points at `publish.mjs`; `projects/medra/ui/package.json` gains `repository`.
- **`check.mjs policy`** reads the root `package.json` (`@angular/core` major), `projects/medra/ui/package.json` (version, peer ranges), `.changeset/*.md` front matter (bump types), the branch name, and for PRs the base branch's Angular major and `origin/release/<n>`. It exits `1` listing every violation by name.
- **`check.mjs changeset`** lists files changed against the PR base (`git diff --name-only base...HEAD`) and applies D-05.
- **`ci.yml`** (`pull_request` and `workflow_dispatch`, to `main` and `release/**`; `contents: read` only, no secrets, no `id-token`): changeset check, policy check, `npm test`, `npm run build`.
- **`release.yml`** (`push` to `main` and `release/**`; workflow-level `permissions: {}`; `concurrency` per branch with `cancel-in-progress: false`): job `verify` (`contents: read`: `npm ci`, policy check, `npm test`, `npm run build`, uploads `dist/medra/ui`), then job `release` (`needs: verify`; environment `npm-publish`; `contents: write`, `pull-requests: write`, `actions: write`, `id-token: write`; `npm ci --ignore-scripts`; `changesets/action` with `version: npm run version` and `publish: node tools/release/publish.mjs`; after a version PR is opened it dispatches `ci.yml` on `changeset-release/*`). The exact action input names are confirmed from the action's own documentation at implementation.
- **`publish.mjs`** takes the version from `dist/medra/ui/package.json`, exits `0` if `npm view @medra/ui@<version>` already exists, otherwise runs `npm publish dist/medra/ui --access public --provenance`, then `changeset tag` so the action records the tag.

## Decisions

### D-01: Baseline 21.0.0 set directly, pending changesets folded

**Choice:** One repository edit sets `projects/medra/ui/package.json` to `21.0.0`, moves the text of the pending changesets into a `21.0.0` section of `CHANGELOG.md`, and deletes those changeset files. The first `21.0.0` publish is done manually once (D-07).
**Alternatives:** A temporary `20.x` baseline so changesets bump to `21.0.0`; a `major` changeset (would give `1.0.0`).
**Rationale:** Changesets cannot jump from `0.1.0` to `21.0.0`, and a fake earlier version would never have existed on npm.

### D-02: Policy rules as a dependency-free Node module

**Choice:** Pure functions in `tools/release/policy.mjs` with a thin CLI, tested by Jest.
**Alternatives:** Shell steps inside the workflow; a GitHub Action in TypeScript.
**Rationale:** Pure functions are unit-testable (Article V) and runnable locally before a release; no new dependency (the `Dependency` criterion already fired once).

### D-03: Angular major comes from the root `@angular/core` pin

**Choice:** The repository's Angular major is the major of `@angular/core` in the root `package.json`.
**Alternatives:** `angular.json`; the peer range of the package.
**Rationale:** The root pin is what the repository is built and tested against; peer ranges are checked against it, not used as its source.

### D-04: Publish from `dist/medra/ui`, not from the workspace directory

**Choice:** `publish.mjs` publishes the ng-packagr output in `dist/medra/ui`. Plain `changeset publish` is not used.
**Alternatives:** Keep `npm run release` (`changeset publish`).
**Rationale:** `changeset publish` publishes `projects/medra/ui`, whose `package.json` has no built entry points or `styles.css`; only `dist/medra/ui` is a valid package. `changeset version` still bumps the source `package.json`, which ng-packagr copies.

### D-05: Changeset requirement is a path rule on the PR diff

**Choice:** A PR needs a changeset when any changed file is under `projects/medra/ui/` and is not a `*.spec.ts`/`*.test.ts` file; a new file in `.changeset/` satisfies it. Everything else is exempt.
**Alternatives:** `changeset status --since`; require a changeset on every PR.
**Rationale:** `changeset status` counts test and tooling files as changes (REL-004.S3 needs them exempt), and the user chose the package-source rule.

### D-06: Two workflows, privileges split

**Choice:** Untrusted PR code runs only in `ci.yml` with read-only permissions; `release.yml` runs only on pushes to protected branches and alone holds `id-token: write`.
**Alternatives:** One workflow with conditional jobs.
**Rationale:** A PR from a fork must never reach the publishing identity.

### D-07: First release is a one-time manual publish, then OIDC

**Choice:** A maintainer publishes `21.0.0` once by hand (`npm login`, 2FA), then registers `release.yml` as trusted publisher; every later version goes through the pipeline.
**Alternatives:** A temporary CI token for the first run.
**Rationale:** The trusted publisher is registered after the package exists; whether npm allows registering earlier is unverified, and this order does not depend on it. The user chose this over a short-lived secret. REL-007 forbids only stored tokens in the pipeline.

### D-08: Gates run as steps ahead of the Changesets action

**Choice:** Policy check, tests and builds are steps in `release.yml` before `changesets/action`; a failure stops the job, so nothing is versioned or published.
**Alternatives:** Gate inside the publish script only.
**Rationale:** Failing before the action guarantees REL-006.S2 without relying on script internals.

### D-09: Branch rules live in the policy check

**Choice:** On `release/<n>` the check requires `n` to equal the Angular major; on a PR that moves the major, it requires `origin/release/<previous major>` to exist.
**Alternatives:** GitHub branch protection only.
**Rationale:** Rules in the repository are testable and survive changes to repository settings.

### D-10: PR workflow cannot reach the publish identity

**Choice:** Accepts M-01. `ci.yml` uses only `pull_request`/`workflow_dispatch`, top-level `contents: read`, no secrets and no `id-token`; `workflows.test.ts` asserts all three.
**Alternatives:** `pull_request_target` for richer PR checks.
**Rationale:** A fork PR must never run with the publish identity.

### D-11: Publish job in a protected environment

**Choice:** Accepts M-02. Job `release` uses GitHub environment `npm-publish`, limited to branches `main` and `release/*` with a required reviewer; the npm trusted publisher is registered with the same environment name.
**Alternatives:** No environment, filename-only trust.
**Rationale:** The trusted publisher binds to a workflow filename, so branch and approver restrictions must come from the environment.

### D-12: Rulesets and code owners guard the pipeline files

**Choice:** Accepts M-03 and M-04. Rulesets on `main` and `release/**` (PR with approval, required `ci.yml` checks, no force-push or deletion, restricted `release/*` creation, no bypass) are recorded in `RELEASING.md` because they live outside the repository; `.github/CODEOWNERS` covers `.github/`, `tools/release/`, `.changeset/config.json` and `projects/medra/ui/package.json`.
**Alternatives:** Rely on defaults.
**Rationale:** The gate lives in files a PR can edit, so changing them needs owner review.

### D-13: Split verify and release jobs

**Choice:** Accepts M-05. Untrusted build and test code runs in `verify` with read-only permissions; only `release` holds `id-token: write` and publishes the artifact `verify` built.
**Alternatives:** One job.
**Rationale:** A dependency script in `npm ci`, tests or the build must not be able to request the OIDC token.

### D-14: Actions pinned to commit SHAs

**Choice:** Accepts M-06. Every `uses:` is a full commit SHA with the version in a comment; Dependabot watches `github-actions`; `workflows.test.ts` asserts the pattern.
**Alternatives:** Version tags.
**Rationale:** A moved tag would run attacker code with write and OIDC scopes.

### D-15: First publish procedure is written down

**Choice:** Accepts M-07. `RELEASING.md` describes the manual `21.0.0` publish from a clean checkout of the reviewed commit (`npm ci`, build, `npm pack` and tarball inspection, 2FA), then registering the trusted publisher, setting "Require two-factor authentication and disallow tokens", and revoking tokens.
**Alternatives:** A temporary CI token.
**Rationale:** Limits the one publish that has no provenance.

### D-16: Trusted-publishing prerequisites are pinned

**Choice:** Accepts M-08. `repository.url` in `projects/medra/ui/package.json` matches the GitHub repository exactly; `release.yml` uses Node 22.14 or later and installs npm 11.5.1 or later; a test keeps `NPM_TOKEN` and `NODE_AUTH_TOKEN` out of the workflows; `RELEASING.md` notes that renaming `release.yml` means re-registering.
**Alternatives:** Leave versions unpinned.
**Rationale:** A misconfiguration fails the publish and tempts a stored token.

### D-17: No untrusted value reaches a shell

**Choice:** Accepts M-09. Event fields reach steps only through `env:`; `check.mjs` and `publish.mjs` call `git` and `npm` with argument arrays and validate branch names against `^release/[0-9]+$`.
**Alternatives:** Inline `${{ }}` in `run:`.
**Rationale:** Branch names and PR titles are attacker-controlled.

### D-18: Version PR gets its checks by dispatch

**Choice:** Accepts M-10. After the Changesets action opens or updates the PR, `release` dispatches `ci.yml` on `changeset-release/*` with the built-in token (hence `actions: write`).
**Alternatives:** A GitHub App token (rejected by the user: needs an App and secrets).
**Rationale:** `GITHUB_TOKEN`-created PRs do not start workflows, so required checks would never report.

### D-19: Provenance, serial runs and idempotent publish

**Choice:** Accepts M-11. `--provenance` and tag creation stay in `publish.mjs`, which skips versions already on npm; `release.yml` runs serially per branch.
**Alternatives:** Allow cancelling in-progress runs.
**Rationale:** A cancelled run must not leave a version published but untagged.

### D-20: `npm stage publish` declined

**Choice:** Declines M-12. Publication needs the `npm-publish` environment reviewer (D-11) but no further per-publish 2FA approval. Threat TM-02 stays partly open: a solo admin can approve their own deployment.
**Alternatives:** Stage publish with maintainer 2FA approval for each version.
**Rationale:** The user declined it for now as an extra step; revisit when the team grows or the package has real consumers.
