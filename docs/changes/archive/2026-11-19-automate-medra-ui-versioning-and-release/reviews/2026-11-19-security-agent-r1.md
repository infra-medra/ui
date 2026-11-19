# Security Report: automate-medra-ui-versioning-and-release — round 1

**Stage:** security
**Verdict:** pass-with-findings
**Counts:** critical 0 · high 0 · medium 1 · low 0 · info 1
**Origin mix:** tool 0 · verified 0 · manual 1 · hypothesis 1
**Reviewer:** security agent
**Date:** 2026-11-19

## Summary

pass-with-findings: one medium finding remains (S-01): the `release` job, which alone holds `id-token: write` and `contents: write`, runs `npm run build` (dependency code) and publishes a rebuild instead of the artifact the `verify` job produced, so M-05 is only partly delivered. The other accepted mitigations are present in the repository. The biggest limitation is that GitHub and npm settings (environment reviewers, rulesets, trusted-publisher registration, Actions policy) live outside the repository and the git repository has no remote, so M-02, M-03 and M-07 could not be verified.

## Scope and Method

- **Examined:** `diff_base` is `none`, so the change was read as whole files rather than a diff: 2 workflows, 3 scripts under `tools/release/`, `.changeset/config.json`, `projects/medra/ui/package.json`, `.github/CODEOWNERS`, `.github/dependabot.yml`, `RELEASING.md`, and the workflow contract test. 4 entry points (`ci.yml` PR trigger, `release.yml` push trigger, `check.mjs`, `publish.mjs`), 0 new npm dependencies, 4 pinned third-party actions.
- **Method:** code · configuration · dependencies (action pins checked against upstream tags; `npm audit`) · threat-model conformance.
- **Tools:** `npm audit --offline --json` (npm 11.19.1) exit 0, reported 0 vulnerabilities; it ran offline against the lockfile, so it did not query the live advisory database (see Limitations).

## Findings

### S-01 [medium] Publishing job runs dependency build code and rebuilds instead of publishing the verified artifact

**Status:** open
**Confidence:** high · **Origin:** manual
**CWE:** unknown · **CVE:** n/a · **CVSS:** n/a
**Location:** `.github/workflows/release.yml:84-104` · M-05, TM-04
**Evidence:** the `release` job grants `contents: write`, `pull-requests: write`, `actions: write`, `id-token: write` and then runs `- run: npm run build` (line 104) before the publish step. The checkout at line 91 keeps default credentials (no `persist-credentials: false`). The `verify` job uploads `medra-ui-dist` (lines 73-78) but the `release` job never downloads it; line 103 says "actions/download-artifact is not used: the build is repeated from the same commit."
**Attack scenario:** a compromised dependency used by the build (`ng-packagr`, `tailwindcss`, a transitive package) runs its code during `npm run build` inside the job that holds the OIDC identity and the write token. `--ignore-scripts` on `npm ci` stops install-time hooks only. The build code can request an OIDC token or read the token stored in `.git/config`, and publish or push on its own. The `npm-publish` environment gate (M-02) approves the job before it starts, not the steps inside it.
**Impact:** an arbitrary `@medra/ui` version published to every consumer, or a push to the repository, if a build-time dependency is compromised.
**Fix:** build only in `verify` (already done, lines 68-78), download `medra-ui-dist` in `release` with a SHA-pinned `actions/download-artifact` and drop the `npm run build` step there. `publish.mjs` reads `dist/medra/ui`, so it works unchanged. The `npm ci --ignore-scripts` step can stay for `changeset`. Also set `persist-credentials: false` on the release checkout if the Changesets action still works without it (it takes its own token); otherwise record that choice.
**Validation:** extend `tests/release/workflows.test.ts` to assert the `release` job contains no `npm run build` and does contain a download-artifact step; confirm on the first real run that the Changesets action opens the Version PR and publishes.
**References:** https://docs.github.com/en/actions/reference/security/secure-use (as cited in the threat model; not re-fetched in this round)
**Residual risk:** the artifact built in `verify` remains the exposure (accepted in the threat model's TM-04 residual risk); `verify` holds only `contents: read`.

### S-02 [info] Required Actions repository setting is missing from the maintainer runbook

**Status:** open
**Confidence:** low · **Origin:** hypothesis
**CWE:** n/a · **CVE:** n/a · **CVSS:** n/a
**Location:** `RELEASING.md` (section 3, "Actions policy") · M-10, TM-05
**Evidence:** the runbook tells maintainers to set the default workflow token to read-only and "do not allow Actions to approve pull requests", and does not mention that the Changesets action opens its Version PR with `GITHUB_TOKEN`. The threat model's source note says the action depends on the "Allow GitHub Actions to create and approve pull requests" setting; I did not re-read that source in this run.
**Attack scenario:** none; this is an operational gap. A maintainer who cannot get the Version PR to open may enable the setting broadly or add a long-lived token, which weakens TM-05 and TM-08.
**Impact:** possible pressure to add a stored token or loosen review rules on the first run.
**Fix:** after confirming the exact setting name in the Changesets action documentation, document the narrowest configuration that lets the action open the PR while review on `main` still requires a human approval.
**Validation:** a maintainer follows the runbook on a clean repository and the Version PR opens without a stored token.
**References:** none consulted in this run.
**Residual risk:** none once documented.

## Previous Findings

None.

## Threat Model Conformance

| Mitigation | Status | Evidence |
|---|---|---|
| M-01 | implemented | `ci.yml:5-12`: `pull_request` only, top-level `permissions: contents: read`, no secrets, no `id-token`; asserted in `tests/release/workflows.test.ts:32` |
| M-02 | unverified | `release.yml:83` sets `environment: npm-publish`; reviewers, branch restriction and the npm registration are repository settings not verifiable here |
| M-03 | unverified | rulesets live outside the repository; recorded in `RELEASING.md` section 3 |
| M-04 | implemented | `.github/CODEOWNERS` covers `.github/`, `tools/release/`, `.changeset/config.json`, `projects/medra/ui/package.json`; the `@infra-medra/maintainers` team and the required code-owner review are unverified |
| M-05 | partial | `permissions: {}` (`release.yml:46`), `verify` job read-only, `needs: verify`, `npm ci --ignore-scripts` (`:102`); but the artifact is not published and the build runs in the publishing job (S-01) |
| M-06 | implemented | all four `uses:` are 40-hex SHAs with version comments; I confirmed against upstream tags that `actions/checkout` v7.0.1, `actions/setup-node` v7.1.0, `actions/upload-artifact` v7.0.2 and `changesets/action` v2.1.2 (an annotated tag, dereferenced to the commit) resolve to the pinned SHAs; `.github/dependabot.yml` covers `github-actions`; SHA pattern asserted at `workflows.test.ts:111` |
| M-07 | unverified | manual first publish procedure in `RELEASING.md` section 1-2; performed outside the repository |
| M-08 | implemented | `projects/medra/ui/package.json` has `repository.url` `git+https://github.com/infra-medra/ui.git`; Node `22.14` and `npm@11.5.1` in `release.yml:97,100`; no `NPM_TOKEN` (`workflows.test.ts:101`). The exact match with the real GitHub repository is unverified (no remote) |
| M-09 | implemented | `release.yml:115-118` passes `GITHUB_REF_NAME` and the token through `env:`; `check.mjs:13-19` and `publish.mjs:105,123,125` use `execFileSync` with argument arrays; `check.mjs:21-25` and `policy.mjs:5,75-90` validate branch names with `^release/[0-9]+$` |
| M-10 | implemented | `release.yml:113-118` dispatches `ci.yml` on `changeset-release/<base>` when `has-changesets` is true; that the resulting run reports on the Version PR is unverified until the first real run |
| M-11 | implemented | `--provenance` at `publish.mjs:112`; `concurrency` with `cancel-in-progress: false` at `release.yml:48-50`; `alreadyPublished()` at `publish.mjs:103-110` |

## Limitations

- No git remote and no commits: repository visibility, rulesets, the `npm-publish` environment, Actions settings, CODEOWNERS team existence and the npm trusted-publisher registration could not be checked; M-02, M-03, M-04 (team part) and M-07 rest on them.
- `diff_base` is `none` and the repository has no commits, so the audit read whole files rather than a diff; code outside the files listed under Scope was not read.
- The advisory databases (NVD, GitHub Advisory Database, CISA KEV) were not queried because the change adds no npm dependency; `npm audit` ran with `--offline`, so its zero result reflects local data only.
- The GitHub Docs and npm Trusted Publishers pages were not re-fetched in this round; S-01's reference is carried from the threat model and is the one unverified source.
- Changesets action behavior (opening the Version PR, pushing tags after `changeset tag`, which token it uses for git) was not exercised; only a first real run can confirm it.
- `RELEASING.md` section 1 states the trusted publisher can only be registered after the package exists; the threat model recorded that claim as unverified and this audit did not check it.
