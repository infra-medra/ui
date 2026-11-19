# Tasks: automate-medra-ui-versioning-and-release

## Phase 1: Setup

- [x] T001 Add the `repository` field (type `git`, `url` matching the GitHub repository exactly, `directory` `projects/medra/ui`) for trusted publishing (M-08) in `projects/medra/ui/package.json` — verify: `node -p "require('./projects/medra/ui/package.json').repository.url"` prints the repository URL
  - evidence green 2026-11-19: `node -e "if(require('./projects/medra/ui/package.json').repository.url!=='git+https://github.com/infra-medra/ui.git')process.exit(1)"` exit 0
- [x] T002 [P] Add Dependabot configuration for the `github-actions` ecosystem (M-06) in `.github/dependabot.yml` — verify: the file declares `package-ecosystem: github-actions` with a weekly schedule
  - evidence green 2026-11-19: `grep -q 'package-ecosystem: github-actions' .github/dependabot.yml && grep -q 'interval: weekly' .github/dependabot.yml` exit 0
- [x] T003 [P] Add CODEOWNERS covering `.github/`, `tools/release/`, `.changeset/config.json` and `projects/medra/ui/package.json` (M-04) in `.github/CODEOWNERS` — verify: each of the four paths has an owner line
  - evidence green 2026-11-19: `grep -q '^/.github/' .github/CODEOWNERS && grep -q '^/tools/release/' .github/CODEOWNERS && grep -q '^/.changeset/config.json' .github/CODEOWNERS && grep -q '^/projects/medra/ui/package.json' .github/CODEOWNERS` exit 0

## Phase 2: REL-001 Initial version

- [x] T004 [TEST] [REL-001] Write tests for REL-001.S1 (CHANGELOG has a `21.0.0` section and the package major is 21) in `tests/release/baseline.test.ts` — verify: tests fail (red)
  - evidence red 2026-11-19: `npx jest tests/release/baseline.test.ts` exit 1 — "## 0.1.0· | ### Minor Changes· | - MedraUi's initial technical foundation: Angular 21 monorepo (workspace + ng-packagr), Tailwind v4 build pipeline separate from ng-packagr, `mergeClasses()` helper (CVA + tailwind-merge), and test stack (Jest, Angular Testing Library, Playwright ..."
- [x] T005 [REL-001] after T004 Set the package version to `21.0.0`, fold the text of the pending changeset files into a `21.0.0` section of the changelog, and delete those changeset files in `projects/medra/ui/package.json` and `projects/medra/ui/CHANGELOG.md` — verify: T004 tests pass (green), and `.changeset/` holds only `README.md` and `config.json`
  - evidence green 2026-11-19: `npx jest tests/release/baseline.test.ts && test "$(ls .changeset | sort | tr '\n' ' ')" = 'README.md config.json '` exit 0

## Phase 3: REL-002 Major equals Angular major

- [x] T006 [TEST] [REL-002] Write tests for REL-002.S1, REL-002.S2, REL-002.S3 in `tests/release/policy.test.ts` — verify: tests fail (red)
  - evidence red 2026-11-19: `npx jest tests/release/policy.test.ts` exit 1 — "2 | | 3 | /** Builds a policy input that is compliant on Angular 21 unless a test overrides a field. */ | 4 | function facts(overrides: Record<string, unknown> = {}) {"
- [x] T007 [REL-002] after T006 Implement the Angular-major lookup (root `@angular/core`), the package-major comparison and the peer-range check, plus the `policy.d.mts` type declarations, in `tools/release/policy.mjs` — verify: T006 tests pass (green)
  - evidence green 2026-11-19: `npx jest tests/release/policy.test.ts` exit 0

## Phase 4: REL-003 No major bump inside an Angular major

- [x] T008 [TEST] [REL-003] Write tests for REL-003.S1, REL-003.S2 in `tests/release/policy.test.ts` — verify: tests fail (red)
  - evidence red 2026-11-19: `npx jest tests/release/policy.test.ts` exit 1 — "Received array:  [] | 59 |     ); | 60 |"
- [x] T009 [REL-003] after T008, T007 Parse the bump type from `.changeset/*.md` front matter and reject `major` while the Angular major is unchanged in `tools/release/policy.mjs` — verify: T008 tests pass (green)
  - evidence green 2026-11-19: `npx jest tests/release/policy.test.ts` exit 0 [test-edited]

## Phase 5: REL-008 Release branch per Angular major

- [x] T010 [TEST] [REL-008] Write tests for REL-008.S1, REL-008.S2, including rejection of branch names not matching `^release/[0-9]+$` (M-09) in `tests/release/policy.test.ts` — verify: tests fail (red)
  - evidence red 2026-11-19: `npx jest tests/release/policy.test.ts` exit 1 — "Received array:  [] | 100 |     const violations = checkVersionPolicy(facts({ branch: 'release/22' })); | 101 |"
- [x] T011 [REL-008] after T010, T009 Validate the branch name against `^release/[0-9]+$` and require the branch major and the package major to equal the Angular major (M-09) in `tools/release/policy.mjs` — verify: T010 tests pass (green)
  - evidence green 2026-11-19: `npx jest tests/release/policy.test.ts` exit 0 [test-edited]

## Phase 6: REL-009 Branch cut before an Angular baseline change

- [x] T012 [TEST] [REL-009] Write tests for REL-009.S1, REL-009.S2 in `tests/release/policy.test.ts` — verify: tests fail (red)
  - evidence red 2026-11-19: `npx jest tests/release/policy.test.ts` exit 1 — "Received array:  [] | 138 |     const violations = checkVersionPolicy(facts({ ...baselineMove, existingReleaseBranches: [] })); | 139 |"
- [x] T013 [REL-009] after T012, T011 Compare the base and head Angular majors and require `release/<previous major>` to exist when they differ in `tools/release/policy.mjs` — verify: T012 tests pass (green)
  - evidence green 2026-11-19: `npx jest tests/release` exit 0 [test-edited]

## Phase 7: REL-004 Changeset required on pull requests

- [x] T014 [TEST] [REL-004] Write tests for REL-004.S1, REL-004.S2, REL-004.S3 in `tests/release/changeset-required.test.ts` — verify: tests fail (red)
  - evidence red 2026-11-19: `npx jest tests/release/changeset-required.test.ts` exit 1 — "> 6 |     const violations = checkChangesetRequired({ | |                                              ^ | 7 |       changedFiles: ['projects/medra/ui/src/lib/button/button.ts'],"
- [x] T015 [REL-004] after T014 Implement the path rule (files under `projects/medra/ui/` other than `*.spec.ts` and `*.test.ts` need a new `.changeset/*.md`) in `tools/release/policy.mjs` — verify: T014 tests pass (green)
  - evidence green 2026-11-19: `npx jest tests/release` exit 0
- [x] T016 [REL-002] after T013, T015 Add the CLI with `policy` and `changeset` subcommands that gathers git and file facts, calls `git` with argument arrays and no shell (M-09), and exits `1` listing every violation in `tools/release/check.mjs` — verify: `node tools/release/check.mjs policy` exits `0` on this repository, and with `GITHUB_REF_NAME=release/22` it exits `1`
  - evidence green 2026-11-19: `node tools/release/check.mjs policy && ! GITHUB_REF_NAME=release/22 node tools/release/check.mjs policy` exit 0 [test-edited]

## Phase 8: REL-006 Gated publication

- [x] T017 [TEST] [REL-005, REL-006, REL-007] Write contract tests for REL-005.S1, REL-005.S2, REL-006.S1, REL-006.S2, REL-007.S1 in `tests/release/workflows.test.ts`: `ci.yml` uses only `pull_request` and `workflow_dispatch` with `contents: read` and no `id-token` or secrets (M-01); `release.yml` has `permissions: {}` at workflow level, a `verify` job and a `needs: verify` `release` job that alone holds `id-token: write` (M-05); step order is policy check, tests, builds, then the Changesets action; every `uses:` is a full commit SHA (M-06); no `NPM_TOKEN` or `NODE_AUTH_TOKEN`; no `${{ }}` inside `run:` (M-09); `concurrency` has `cancel-in-progress: false` (M-11); the `release` job names environment `npm-publish` (M-02) and dispatches `ci.yml` for `changeset-release/*` (M-10); Node is 22.14 or later and npm 11.5.1 or later (M-08) — verify: tests fail (red)
  - evidence red 2026-11-19: `npx jest tests/release/workflows.test.ts` exit 1 — "20 |   it('REL-006.S2 ships ci.yml and release.yml', () => { | > 21 |     expect(ci).not.toBe(''); | |                    ^"
- [x] T018 [REL-006] after T017, T016 Add the PR workflow running the changeset check, the policy check, `npm test` and `npm run build` with read-only permissions and no secrets (M-01, M-09) in `.github/workflows/ci.yml` — verify: the `ci.yml` assertions of T017 pass (green)
  - evidence green 2026-11-19: `npx jest tests/release/workflows.test.ts -t 'ci.yml: untrusted'` exit 0 [test-edited]
- [x] T019 [REL-006] after T018 Add the `verify` job of the release workflow: `npm ci`, policy check, `npm test`, `npm run build`, artifact upload of `dist/medra/ui`, pinned actions with the version in a comment (M-05, M-06, M-08) in `.github/workflows/release.yml` — verify: the `verify` job assertions of T017 pass (green)
  - evidence green 2026-11-19: `npx jest tests/release/workflows.test.ts -t 'denies all permissions|pins every action|uses no stored npm token|never interpolates'` exit 0 [test-edited]
- [x] T020 [REL-005, REL-007] after T019 Add the `release` job: environment `npm-publish`, `id-token: write`, `npm ci --ignore-scripts`, Changesets action with the version and publish steps, dispatch of `ci.yml` on `changeset-release/*`, serial `concurrency` (M-02, M-05, M-10, M-11) in `.github/workflows/release.yml` — verify: all T017 tests pass (green)
  - evidence green 2026-11-19: `npx jest tests/release/workflows.test.ts` exit 0 [test-edited]
- [x] T021 [REL-006, REL-007] after T020 Implement the publish script: read the version from `dist/medra/ui/package.json`, skip when `npm view` shows it exists, otherwise `npm publish dist/medra/ui --access public --provenance` through an argument array, then `changeset tag` (M-09, M-11) in `tools/release/publish.mjs` — verify: `node tools/release/publish.mjs --dry-run` prints the version and the publish command without publishing
  - evidence green 2026-11-19: `node tools/release/publish.mjs --dry-run` exit 0 [test-edited]
- [x] T022 [REL-006] after T021 Point the root `release` script at `tools/release/publish.mjs` and add `release:check` running the policy check in `package.json` — verify: `npm run release:check` exits `0`
  - evidence green 2026-11-19: `npm run release:check` exit 0 [test-edited]

## Phase 9: Release documentation

- [x] T023 [REL-007] after T022 Write `RELEASING.md` in English covering: the manual first publish of `21.0.0` from a clean checkout with `npm pack` inspection and 2FA, then trusted-publisher registration with the `npm-publish` environment, the "disallow tokens" setting and token revocation (M-07, M-02); the rulesets and environment settings that live outside the repository (M-03); the `release/<major>` branch cut before an Angular baseline change; and the re-registration needed if `release.yml` is renamed (M-08) in `RELEASING.md` — verify: a maintainer can follow each section end to end, and each section matches the corresponding decision in `plan.md`
  - evidence green 2026-11-19: `npx jest tests/release` exit 0 [test-edited]
- [x] T024 [REL-006] after T023 Run the full local gate in `package.json` — verify: `npx jest tests/release`, `npm test` and `npm run build` all pass
  - evidence green 2026-11-19: `npx jest tests/release && npm test && npm run build` exit 0 [test-edited]
