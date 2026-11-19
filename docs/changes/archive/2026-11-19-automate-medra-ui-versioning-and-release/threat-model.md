# Threat Model: automate-medra-ui-versioning-and-release

**Author:** security agent · 2026-11-19
**Stack:** Node 22 (`.nvmrc`; npm CLI version not pinned anywhere) · Angular `@angular/core` 21.2.25 · `@changesets/cli` 2.31.1 (lockfile) · ng-packagr ^21.2.0 · GitHub Actions (hosted runners) · npm Trusted Publishing. No `.github/` or `tools/` exists yet; the workflows are modeled from plan.md. The git repository has no remote configured, so repository visibility and branch rules were not verifiable.

## Scope

- **In:** `ci.yml` and `release.yml`, `tools/release/{policy,check,publish}.mjs`, the OIDC identity and npm trusted-publisher registration, `main` and `release/**` branch protection, third-party action use, and the manual first publish of `21.0.0` (D-07).
- **Out:** the version-policy rule logic itself (REL-002/003/004/008/009; correctness, not a security boundary); docs site and CDN publishing (out of the proposal); npm dependency advisories (no npm dependency is added; `@changesets/cli` is unchanged); consumers installing `@medra/ui`.

## Assets

- npm publish identity (OIDC token from `release.yml`, trusted-publisher registration) — `secret`: whoever can mint it publishes any `@medra/ui` version to every consumer.
- `@medra/ui` package name and published versions — `confidential` until published, then `public` but integrity-critical: a malicious version is a supply-chain compromise of every consumer.
- Repository write rights (`GITHUB_TOKEN` with `contents: write`, `pull-requests: write`) — `secret`: can push tags and branches and open PRs.
- `main` and `release/**` branch history and the workflow, policy and publish scripts — `internal`: they define what may be published.
- Maintainer npm account and 2FA used for the manual first publish — `secret`.

## Trust Boundaries

| ID | Boundary | From → To |
|---|---|---|
| B-01 | Pull request code → CI runner | Fork or branch contributor → `ci.yml` (read-only token, no secrets) |
| B-02 | Repository write access → release workflow | Anyone able to push `main` or create `release/**` → `release.yml` holding `id-token: write` |
| B-03 | Workflow job → npm registry | GitHub OIDC identity → npm trusted publisher |
| B-04 | Third-party and dependency code → release job | Marketplace actions, npm packages, lifecycle scripts → job with write scopes |
| B-05 | Maintainer workstation → npm registry | Local `npm login` + 2FA → first publish of `21.0.0` |

## Entry Points

- `ci.yml` on `pull_request` to `main` and `release/**` (B-01) — runs PR-supplied code; fork PRs get a read-only token and no secrets.
- `release.yml` on `push` to `main` and `release/**` (B-02) — triggered by any actor who can push or create a matching branch.
- `changesets/action` and other `uses:` steps (B-04) — run inside the release job.
- `npm ci`, `npm test`, `npm run build` inside `release.yml` (B-04) — run repository and dependency code before the publish step.
- `tools/release/publish.mjs` (B-03) — runs `npm publish dist/medra/ui` with the OIDC identity.
- npm trusted-publisher registration (workflow filename `release.yml`) (B-03) — configured outside the repository.
- `tools/release/check.mjs` inputs: branch name, base ref, PR diff (B-01, B-02).
- Manual `npm publish` of `21.0.0` (B-05).

## Threats

| ID | STRIDE | Threat | Boundary | Severity | Likelihood | Mitigations |
|---|---|---|---|---|---|---|
| TM-01 | E | A fork PR reaches the publishing identity (a future `pull_request_target`/`workflow_run` edit, or `id-token` added to `ci.yml`) | B-01 | low | low | M-01 |
| TM-02 | E | A user or compromised account with write access creates an unprotected `release/x` branch (or pushes `main`) containing a modified `release.yml`/`publish.mjs`, and publishes arbitrary code; the trusted publisher is bound to a filename, not a branch or approver | B-02, B-03 | high | medium | M-02, M-03, M-12 |
| TM-03 | T | A third-party action referenced by mutable tag (`changesets/action`, checkout, setup-node) is compromised and runs with `id-token: write` and `contents: write` | B-04 | high | low | M-05, M-06 |
| TM-04 | E | `id-token: write` is held by the same job that runs `npm ci`, `npm test` and `npm run build`, so a malicious dependency lifecycle script or test code can request the OIDC token and publish | B-04, B-03 | high | medium | M-02, M-05 |
| TM-05 | T | The "Version Packages" PR is opened with `GITHUB_TOKEN`, which does not start `ci.yml`, so required checks never report; maintainers bypass protection, or "Allow Actions to create and approve PRs" weakens the review rule | B-02 | medium | high | M-03, M-10 |
| TM-06 | T | A PR weakens the policy check, `.changeset/config.json`, workflows or `publish.mjs`, and a single reviewer approves it (the gate lives in files the PR can edit) | B-02 | medium | medium | M-03, M-04 |
| TM-07 | S | The manual first publish runs from a workstation: no provenance, an unclean tree or compromised machine can ship content not built from the reviewed commit; the account or scope is a single point of failure | B-05 | medium | low | M-07 |
| TM-08 | D | Trusted publishing is misconfigured (no `repository` in `projects/medra/ui/package.json`, npm below 11.5.1, filename mismatch, registration expired), the publish fails, and the team is tempted to add an `NPM_TOKEN` | B-03 | low | high | M-08 |
| TM-09 | T | Attacker-controlled values (branch name, PR title, base ref) are interpolated into `run:` shell lines or `git` commands in workflows and `check.mjs` | B-01, B-02 | medium | low | M-09 |
| TM-10 | R | A published version cannot be tied to a commit and workflow run | B-03 | low | low | M-11 |
| TM-11 | D | A cancelled or retried run leaves a version published but untagged, or a second run races on the same branch | B-03 | low | low | M-11 |

## Mitigations

<!-- The security agent writes `pending`; the author replaces it with `accepted (D-NN)` or `declined (D-NN)` before the plan gate. -->

| ID | Mitigation | Threats | Decision |
|---|---|---|---|
| M-01 | Keep `ci.yml` on `pull_request` only (never `pull_request_target` or `workflow_run`), top-level `permissions: contents: read`, no secrets, no `id-token`; assert all three in `workflows.test.ts` | TM-01 | accepted (D-10) |
| M-02 | Put the publishing job in a GitHub environment (for example `npm-publish`) with deployment branches limited to `main` and `release/*` and a required reviewer; set the same environment name in the npm trusted-publisher registration so a push to an arbitrary branch cannot mint a valid identity | TM-02, TM-04 | accepted (D-11) |
| M-03 | Repository rulesets on `main` and `release/**`: PR required with approval, required status checks from `ci.yml`, no force-push or deletion, creation of `release/*` restricted to maintainers, no bypass actors; record the settings in the release docs because they live outside the repository | TM-02, TM-05, TM-06 | accepted (D-12) |
| M-04 | Add CODEOWNERS for `.github/`, `tools/release/`, `.changeset/config.json` and `projects/medra/ui/package.json`, with code-owner review required in the ruleset | TM-06 | accepted (D-12) |
| M-05 | Split `release.yml` into a `verify` job (`contents: read`; `npm ci`, policy check, tests, build; uploads `dist/medra/ui`) and a `release` job that `needs: verify` and alone holds `id-token: write`; set workflow-level `permissions: {}`; run `npm ci --ignore-scripts` in the release job when the repository allows it; publish the verified artifact | TM-03, TM-04 | accepted (D-13) |
| M-06 | Pin every `uses:` to a full-length commit SHA taken from the action's own repository, with the version in a comment; enable Dependabot for `github-actions`; assert the SHA pattern in `workflows.test.ts` | TM-03 | accepted (D-14) |
| M-07 | Manual first publish from a clean checkout of the reviewed commit: `npm ci`, `npm run build`, `npm pack` and inspect the tarball, then publish with 2FA; afterwards register the trusted publisher (within its 2-day window), set Publishing access to "Require two-factor authentication and disallow tokens", and revoke any existing tokens | TM-07 | accepted (D-15) |
| M-08 | Add `repository.url` matching the GitHub repository exactly to `projects/medra/ui/package.json`; pin Node 22.14 or later and a step that ensures npm 11.5.1 or later in `release.yml`; keep the contract test that no `NPM_TOKEN` or `NODE_AUTH_TOKEN` appears; document that renaming `release.yml` requires re-registering the publisher | TM-08 | accepted (D-16) |
| M-09 | Pass `github.head_ref`, PR titles and other event fields to steps only through `env:`, never `${{ }}` inside `run:`; in `check.mjs` and `publish.mjs` call `git` and `npm` with argument arrays (no shell) and validate branch names against `^release/[0-9]+$` | TM-09 | accepted (D-17) |
| M-10 | Make required checks run on the Version PR without a bypass: trigger `ci.yml` for the `changeset-release/*` branch through `workflow_dispatch` or a GitHub App token, and do not rely on an Actions-approved review | TM-05 | accepted (D-18) |
| M-11 | Keep `--provenance` on publish and the tag push; set `concurrency` with `cancel-in-progress: false` for `release.yml`; keep `publish.mjs` idempotent (already in the plan) | TM-10, TM-11 | accepted (D-19) |
| M-12 | Optional stronger control: allow only `npm stage publish` for the trusted publisher so each CI publish needs a maintainer's 2FA approval before it becomes public (requires changing `publish.mjs`) | TM-02 | declined (D-20) |

## Residual Risks

- TM-02: a maintainer with admin rights or a solo maintainer approving their own deployment still defeats M-02 and M-03; M-12 or a second reviewer would close it. Repository settings are outside the repository and unverified here (no remote).
- TM-03: SHA pinning leaves a compromised version that is later pinned in good faith; Dependabot updates need review.
- TM-04: `--ignore-scripts` may break a dependency that needs a postinstall; with the split in M-05 the remaining exposure is the artifact built in `verify`.
- TM-07: the first `21.0.0` carries no provenance attestation, and its integrity rests on the maintainer's workstation; a later version published by the pipeline does not repair that.
- TM-05: depends on repository settings and a token choice (GitHub App versus `workflow_dispatch`) the author must decide.

## Sources

- https://docs.npmjs.com/trusted-publishers — M-02, M-07, M-08, M-12, TM-08 (npm CLI 11.5.1 and Node 22.14 minimum, `id-token: write`, workflow filename registration, optional environment, exact `repository.url` match, 2-day first-publish window, automatic provenance, "disallow tokens" setting, stage publish). The page does not say whether the package must exist before registering; plan D-07's claim that it must is unverified here.
- https://docs.github.com/en/actions/reference/security/secure-use — M-01, M-05, M-06, M-09 (SHA pinning, least-privilege `GITHUB_TOKEN`, script injection through env vars, avoid `pull_request_target`, OIDC, environments with required reviewers).
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows — TM-01, TM-05, M-10 (fork PRs get a read-only token and no secrets; events created by `GITHUB_TOKEN` do not start workflow runs, except `workflow_dispatch` and `repository_dispatch`).
- https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html — M-03, M-04, TM-06 (protected branches, non-bypassable review, least-privilege pipeline identities, lockfile enforcement).
- https://github.com/changesets/action — M-05, TM-05 (permissions `contents: write`, `pull-requests: write`, `id-token: write` for trusted publishing; the "Allow GitHub Actions to create and approve pull requests" setting). The page's input names differed from plan.md's `version:`/`publish:`, and its sub-action recommendation was only summarized; confirm the exact inputs at implementation. Not covered by the page: the effect of GITHUB_TOKEN-created PRs on workflows (taken from the events page above).
