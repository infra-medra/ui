# Releasing `@medra/ui`

This document is the maintainer runbook for publishing `@medra/ui`. It covers the
one-time setup that cannot live in the repository (npm and GitHub settings) and the
rules the pipeline enforces from then on.

How the pipeline works, in short:

- `ci.yml` runs on pull requests with read-only permissions: changeset check,
  version policy check, tests, build.
- `release.yml` runs on pushes to `main` and `release/**`. Job `verify` runs the
  policy check, tests and build. Job `release` (environment `npm-publish`) runs the
  Changesets action, which opens the "Version Packages" PR or publishes through
  `tools/release/publish.mjs` using npm Trusted Publishing. No npm token is stored
  anywhere.
- The `@medra/ui` major always equals the repository's Angular major (the major of
  `@angular/core` in the root `package.json`). The policy check enforces this.

## 1. First publish of `21.0.0` (manual, once)

The trusted publisher can only be registered after the package exists on npm, so the
first version is published by hand. This is the only publish without provenance, so
it is done carefully.

Prerequisites: an npm account that is a member of the `@medra` scope, with two-factor
authentication (2FA) enabled for authorization and publishing.

1. Start from a clean checkout of the reviewed commit that sets the version to
   `21.0.0`. Do not reuse a working directory with local changes.

   ```bash
   git clone https://github.com/infra-medra/ui.git medra-ui-release
   cd medra-ui-release
   git checkout <reviewed-commit-sha>
   git status --porcelain   # must print nothing
   ```

2. Install and build from the lockfile:

   ```bash
   npm ci
   npm test
   npm run build
   ```

3. Inspect what will be published. Never publish a tarball you have not read.

   ```bash
   cd dist/medra/ui
   npm pack --dry-run          # lists the files
   npm pack                    # creates medra-ui-21.0.0.tgz
   tar -tzf medra-ui-21.0.0.tgz
   ```

   Check that: `package.json` has `"version": "21.0.0"` and the exact `repository.url`
   from section 5; the entry points and `styles.css` are present; no `.env`, tokens,
   source maps of private code, or unrelated files are included. Delete the tarball
   when done.

4. Log in and publish with 2FA. Run this from `dist/medra/ui`:

   ```bash
   npm login
   npm publish --access public
   ```

   Enter the one-time password when asked. Confirm the result with
   `npm view @medra/ui@21.0.0`.

5. Tag the release commit and push the tag:

   ```bash
   git tag @medra/ui@21.0.0
   git push origin @medra/ui@21.0.0
   ```

6. Continue with section 2 immediately, so no long-lived credential stays around.

## 2. Register the trusted publisher and close the token path

Do this right after the first publish.

1. On npmjs.com, open the package `@medra/ui` → **Settings** → **Trusted Publisher**
   and register GitHub Actions with:

   | Field | Value |
   |---|---|
   | Organization or user | `infra-medra` |
   | Repository | `ui` |
   | Workflow filename | `release.yml` |
   | Environment | `npm-publish` |

   The environment name must match the GitHub environment in section 3 exactly. It
   is what limits publishing to approved branches and reviewers, because the
   trusted publisher itself only binds to the workflow filename.

2. In the package's **Publishing access** settings, select **Require two-factor
   authentication and disallow tokens**. After this, only 2FA-authenticated users
   and trusted publishers can publish.

3. Revoke every npm token that could publish `@medra/ui`: list them under
   npm → **Access Tokens** and delete each one, including any created for the first
   publish. Run `npm logout` on the machine used in section 1.

4. Verify: the next publish must come from `release.yml` and show a provenance
   badge on the package page. The repository must hold no `NPM_TOKEN` or
   `NODE_AUTH_TOKEN` secret (a test also keeps these names out of the workflows).

## 3. Settings that live outside the repository

These are not versioned with the code, so they are recorded here. Re-check them
after any change of ownership or organization settings.

### Environment `npm-publish`

Repository **Settings** → **Environments** → **New environment** `npm-publish`:

- **Deployment branches and tags**: selected branches only, `main` and `release/*`.
- **Required reviewers**: at least one maintainer. With a single admin, that admin
  can approve their own deployment; this residual risk is accepted for now and
  should be revisited when the team grows or the package has real consumers.
- No environment secrets. Publishing uses the workflow's OIDC identity only.

### Rulesets for `main` and `release/**`

Repository **Settings** → **Rules** → **Rulesets**, targeting `main` and
`release/**`:

- Require a pull request with at least one approval, and review from code owners.
- Require the `ci.yml` status checks to pass before merging.
- Block force pushes and branch deletion.
- Restrict creation of `release/*` branches to maintainers.
- No bypass actors.

### Code owners

`.github/CODEOWNERS` assigns `.github/`, `tools/release/`, `.changeset/config.json`
and `projects/medra/ui/package.json` to `@infra-medra`, a user account (there is no GitHub organization yet). The owner must
have write access, or the rule protects nothing. When an organization and a
maintainers team exist, replace the handle with the team.

### Actions policy

- Every `uses:` in the workflows is pinned to a full commit SHA, with the version in a
  comment. Dependabot watches `github-actions` to propose updates.
- Under **Settings** → **Actions** → **General**, set the default workflow token
  permission to read-only. The Changesets action opens the "Version Packages" PR with
  the workflow token, so enable "Allow GitHub Actions to create and approve pull
  requests" for this repository, and rely on the ruleset's required human approval to
  keep that PR from merging itself. Do not add a stored token to work around a PR that
  fails to open.

## 4. Cutting a `release/<major>` branch before an Angular baseline change

When the repository moves to a new Angular major, the `@medra/ui` major moves with
it. Before the pull request that changes it merges, the previous major must keep a
maintenance line.

1. Find the current major `N` (the major of `@angular/core` in the root
   `package.json`).
2. From the last commit of `main` that still targets `N`, create and push the branch:

   ```bash
   git fetch origin
   git branch release/N origin/main
   git push origin release/N
   ```

   The branch name must match `release/<number>` exactly, and the number must equal
   the Angular major on that branch. The policy check rejects anything else.
3. Confirm the rulesets in section 3 cover the new branch.
4. Open the pull request that moves the Angular baseline on `main`. The policy check
   fails it if `origin/release/N` does not exist.
5. The only changeset allowed to carry a `major` bump is the one that moves the
   Angular baseline; any other `major` changeset is rejected.

Fixes for the old line go to `release/N` through normal pull requests. Pushes to that
branch run `release.yml` like `main` does.

## 5. Keeping trusted publishing working

Trusted Publishing fails closed. A mismatch makes the publish fail, and the tempting
fix (a stored token) must be avoided.

- **`repository.url`** in `projects/medra/ui/package.json` must match the GitHub
  repository exactly: `git+https://github.com/infra-medra/ui.git`. A mismatch breaks
  provenance and the publish.
- **Versions**: `release.yml` uses Node 22.14 or later and installs npm 11.5.1 or
  later, the minimum for Trusted Publishing. Do not lower them.
- **Renaming `release.yml`**: the trusted publisher binds to the workflow filename.
  If the file is renamed or moved, the next publish fails with an authentication
  error until you re-register the publisher on npm (section 2, step 1) with the new
  filename. Do the registration before merging the rename, and remove the old entry
  afterwards.
- **Renaming the environment or moving the repository** needs the same
  re-registration.

## 6. Day-to-day flow (for reference)

1. A pull request that changes package source (anything under `projects/medra/ui/`
   except tests) includes a changeset (`npx changeset`). `ci.yml` checks this.
2. After merge, `release.yml` verifies, then the Changesets action opens or updates
   the "Version Packages" PR. The workflow dispatches `ci.yml` on that branch so its
   required checks report.
3. Merging the "Version Packages" PR triggers `release.yml` again. The `release` job
   waits for a reviewer to approve the `npm-publish` environment, then publishes
   `dist/medra/ui` with provenance and tags the version. A version already on npm is
   skipped, so a re-run is safe.
