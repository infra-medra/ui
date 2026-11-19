# Security Report: automate-medra-ui-versioning-and-release — round 2

**Stage:** security
**Verdict:** pass
**Counts:** critical 0 · high 0 · medium 0 · low 0 · info 0
**Origin mix:** tool 0 · verified 0 · manual 1 · hypothesis 1
**Reviewer:** security agent
**Date:** 2026-11-19

## Summary

pass: no finding is open. S-01 (the publishing job rebuilt from dependency code) and S-02 (the runbook omitted the Actions setting) are remediated, with evidence in the current code and docs. The biggest limitation is unchanged from round 1: GitHub and npm settings (environment reviewers, rulesets, trusted-publisher registration) live outside the repository, so M-02, M-03 and M-07 stay unverified.

## Scope and Method

- **Examined:** `diff_base` is `none` and the dispatch carried no `changed_since_previous`, so this round re-read `.github/workflows/release.yml` in full, `tools/release/publish.mjs` (grep of the publish arguments), the release assertions in `tests/release/workflows.test.ts`, `RELEASING.md` section 3, and the root `package.json` scripts. 2 entry points re-checked (`release.yml` push trigger, `publish.mjs`), 0 dependency changes.
- **Method:** code · configuration · threat-model conformance. The dependency lookups of round 1 were carried forward because no manifest or lockfile change was reported.
- **Tools:** None run this round. The `suite: green` the dispatch reports is the implementer's claim and was not re-run.

## Findings

None.

## Previous Findings

| ID | Previous status | Status | Evidence |
|---|---|---|---|
| S-01 | open | remediated | `release.yml:46-81`: the `release` job has no `npm run build`; it downloads `medra-ui-dist` with `actions/download-artifact@37930b1c…` into `dist/medra/ui` before `changesets/action`. `git ls-remote` shows `refs/tags/v7.0.0` resolves to that SHA. `publish.mjs:9` reads `dist/medra/ui`. The test at `tests/release/workflows.test.ts:89-95` asserts there is no build and that the download comes before the Changesets action. The `npm run version` script runs `changeset version` only (`package.json:25`). Residual: the release checkout (`release.yml:57`) still keeps default credentials, because the Changesets action needs them to push. Build code no longer runs in that job, so the exposure the finding described is gone. |
| S-02 | open | remediated | `RELEASING.md:145-150` now says to enable "Allow GitHub Actions to create and approve pull requests", to rely on the ruleset's required human approval, and not to add a stored token. I fetched https://github.com/changesets/action in this run, and it names the same setting under Actions > General. |

## Threat Model Conformance

| Mitigation | Status | Evidence |
|---|---|---|
| M-01 | carried from r1 | implemented; `ci.yml` was not reported as changed |
| M-02 | carried from r1 | unverified; `release.yml:49` sets `environment: npm-publish`, and the reviewers are a repository setting |
| M-03 | carried from r1 | unverified; rulesets are outside the repository |
| M-04 | carried from r1 | implemented, team existence unverified |
| M-05 | implemented | `permissions: {}` (`release.yml:12`), read-only `verify` job (`:21-22`), `needs: verify` (`:47`), `npm ci --ignore-scripts` (`:68`), and the artifact built in `verify` is published without a rebuild (`:69-75`) |
| M-06 | implemented | all five `uses:` in `release.yml` are 40-hex SHAs with version comments; the new `download-artifact` pin was checked against the upstream tag in this run; `ci.yml` pins were checked in r1 |
| M-07 | carried from r1 | unverified; the manual first publish happens outside the repository |
| M-08 | carried from r1 | implemented, exact repository match unverified |
| M-09 | carried from r1 | implemented; `release.yml:86-89` passes values through `env:` |
| M-10 | carried from r1 | implemented; the first real run must confirm it |
| M-11 | implemented | `publish.mjs:29` passes `--provenance`; `concurrency` with `cancel-in-progress: false` at `release.yml:14-16` |

## Limitations

- No git remote and no commits: repository visibility, rulesets, the `npm-publish` environment, Actions settings, CODEOWNERS team existence and the npm trusted-publisher registration could not be checked; M-02, M-03, M-04 (team part) and M-07 rest on them.
- `diff_base` is `none` and no changed-file list was given, so whole files were re-read where relevant; code outside the files listed under Scope was not read, and `publish.mjs` was checked only for its publish arguments and package directory. Its line numbers differ from round 1, so I did not re-audit the whole script.
- The advisory databases and `npm audit` were not run this round; round 1's results (0 vulnerabilities, offline, local data only) are carried forward.
- The `suite: green` claim was not re-run.
- Changesets action behavior on a first real run (opening the Version PR, pushing tags, and whether it works with the downloaded `dist/`) was not exercised.
- `RELEASING.md` section 1 claims the trusted publisher can only be registered after the package exists; this was not checked.
