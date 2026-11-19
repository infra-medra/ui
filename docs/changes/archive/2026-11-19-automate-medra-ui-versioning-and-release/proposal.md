# Proposal: automate-medra-ui-versioning-and-release

## Why

Maintainers of `@medra/ui` have no automated way to version and publish it, and the package sits at `0.1.0` while it targets Angular 21. Consumers choose a library version by their Angular version, so an unmanaged version hides which Angular a release supports. Constitution Article X now requires the major to equal the Angular major, and nothing enforces it yet.

## What Changes

- The first published version of `@medra/ui` is `21.0.0`.
- A pull request that changes the published package source (not tests-only, docs-site or tooling changes) must carry a changeset, or its check fails.
- A merge to `main` or to a `release/<major>` branch opens or updates a "Version Packages" pull request built from the pending changesets.
- Merging the "Version Packages" pull request publishes the new version to npm, only after the tests, the builds and the version-policy check pass.
- A version-policy check fails when the `@medra/ui` major differs from the repository's Angular major, when a `major` changeset exists without an Angular baseline change, or when the peer ranges target another Angular major.
- Each Angular major has a `release/<major>` branch that releases through the same pipeline; `main` carries the current Angular major, and `release/<previous major>` is cut before the baseline moves to a new major.

## Scope

### In scope

- The `release-versioning` living spec describing the version policy, the checks and the release behavior.
- The `21.0.0` baseline version of `@medra/ui`.
- A GitHub Actions pipeline for the changeset check, the version-policy check, the "Version Packages" pull request and the npm publication.
- npm Trusted Publishing (OIDC) as the only publish credential.
- The `release/<major>` branch convention and its use by the pipeline.

### Out of scope

- Publishing the documentation site or a CDN copy of `styles.css` — a separate delivery concern with its own hosting decision.
- Pre-release channels such as `next` or `rc` — not needed until the Angular baseline moves.
- Automated backporting of fixes between release branches — the branches are only defined here; backports stay manual.
- Any change to component behavior or to the existing 12 capabilities.
- Registering the `@medra` npm scope and linking the repository to it — an account action outside the repository.

## Track

**Track:** full
**Rationale:** New capability fired (`release-versioning` has no living spec). Interface fired (the published version scheme is what consumers depend on). Dependency fired in a light form: a CI action is introduced. Breadth, Data and Learnings did not fire.
**Security:** relevant
**Security rationale:** Infrastructure, deployment or CI fired: a new GitHub Actions workflow with write permissions on the repository and the npm registry. Secrets, keys or cryptography fired: npm Trusted Publishing relies on OIDC identity and job permissions (`id-token: write`).

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `release-versioning` | new | — |

## Impact

- **Code:** `projects/medra/ui/package.json` (version, peer ranges), `.changeset/`, a new `.github/workflows/`, root `package.json` scripts.
- **Interfaces:** the published `@medra/ui` version number and the branch naming `release/<major>`.
- **Data:** None.
- **Dependencies:** `@changesets/cli` stays; the Changesets GitHub action is added to CI.

## Open Questions

None.
