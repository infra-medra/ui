# Release versioning

**Capability:** `release-versioning`
**ID prefix:** `REL`

## Purpose

Lets maintainers publish `@medra/ui` with a version that tells consumers which Angular major it supports. It covers the version policy, the checks on pull requests and the automated release.

## Requirements

### REQ REL-001: Initial version

The first published version of `@medra/ui` SHALL be `21.0.0`.

#### Scenario REL-001.S1: Baseline version

- **Given** the package has never been published at an Angular-aligned version
- **When** the first release is prepared
- **Then** the version to publish is `21.0.0`

### REQ REL-002: Major equals Angular major

The `@medra/ui` major version SHALL equal the Angular major version the repository is built and tested against, and the peer dependency ranges on Angular packages SHALL target that same major.

#### Scenario REL-002.S1: Aligned versions

- **Given** the repository depends on Angular 21 and the package version is `21.2.0`
- **When** the version-policy check runs
- **Then** the check passes

#### Scenario REL-002.S2: Mismatched major

- **Given** the repository depends on Angular 21 and the package version is `22.0.0`
- **When** the version-policy check runs
- **Then** the check fails and names both majors

#### Scenario REL-002.S3: Mismatched peer range

- **Given** the repository depends on Angular 21 and a peer range targets Angular 20
- **When** the version-policy check runs
- **Then** the check fails and names the offending peer dependency

### REQ REL-003: No major bump inside an Angular major

While the Angular major stays the same, pending changesets SHALL NOT request a `major` bump.

#### Scenario REL-003.S1: Major changeset without baseline change

- **Given** a pending changeset requests a `major` bump for `@medra/ui`
- **And** the repository's Angular major is unchanged
- **When** the version-policy check runs
- **Then** the check fails and names the changeset

#### Scenario REL-003.S2: Minor and patch changesets

- **Given** pending changesets request only `minor` and `patch` bumps
- **When** the version-policy check runs
- **Then** the check passes

### REQ REL-004: Changeset required on pull requests

A pull request that changes the published package source (anything under `projects/medra/ui/` such as `src`, `router`, styles or `package.json`, except changes that touch only tests) SHALL fail its changeset check unless it adds a changeset. Pull requests that touch only tests, the documentation site, end-to-end tests or tooling outside the package SHALL NOT require one.

#### Scenario REL-004.S1: Package change without changeset

- **Given** a pull request changes a source file of the published package
- **And** it adds no changeset
- **When** the changeset check runs
- **Then** the check fails

#### Scenario REL-004.S2: Package change with changeset

- **Given** a pull request changes a source file of the published package
- **And** it adds a changeset
- **When** the changeset check runs
- **Then** the check passes

#### Scenario REL-004.S3: Tests-only change

- **Given** a pull request changes only test files of the package
- **When** the changeset check runs
- **Then** the check passes without a changeset

### REQ REL-005: Version pull request

When a branch that releases (`main` or `release/<major>`) receives a commit with pending changesets, the pipeline SHALL open or update a "Version Packages" pull request that applies the version bump and the changelog entries.

#### Scenario REL-005.S1: Pending changesets on main

- **Given** `main` has pending changesets
- **When** a commit is pushed to `main`
- **Then** a "Version Packages" pull request exists with the bumped version and the changelog

#### Scenario REL-005.S2: No pending changesets

- **Given** a releasing branch has no pending changesets
- **When** a commit is pushed to it
- **Then** no version pull request is opened

### REQ REL-006: Gated publication

Merging the "Version Packages" pull request SHALL publish `@medra/ui` to npm only after the tests, the builds and the version-policy check pass; if any of them fails, nothing SHALL be published.

#### Scenario REL-006.S1: All checks pass

- **Given** the "Version Packages" pull request was merged
- **When** the pipeline runs the tests, builds and version-policy check and all pass
- **Then** the new version is published to npm

#### Scenario REL-006.S2: A check fails

- **Given** the "Version Packages" pull request was merged
- **When** the tests, a build or the version-policy check fails
- **Then** nothing is published and the pipeline run fails

### REQ REL-007: Credential-free publication

The pipeline SHALL authenticate to npm through Trusted Publishing and SHALL NOT use a stored long-lived npm token.

#### Scenario REL-007.S1: Publish authentication

- **Given** the pipeline publishes a version
- **When** it authenticates to npm
- **Then** it uses the workflow's OIDC identity and no stored npm token

### REQ REL-008: Release branch per Angular major

Each Angular major SHALL have a `release/<major>` branch that releases versions of that major through the same pipeline, and a release from `release/<major>` SHALL carry that major.

#### Scenario REL-008.S1: Release from a release branch

- **Given** `release/21` exists and the Angular major of that branch is 21
- **When** the pipeline publishes from `release/21`
- **Then** the published version has major `21`

#### Scenario REL-008.S2: Wrong major on a release branch

- **Given** `release/21` carries a package version with major `22`
- **When** the version-policy check runs on that branch
- **Then** the check fails

### REQ REL-009: Branch cut before an Angular baseline change

When the repository's Angular baseline moves to a new major, the `release/<previous major>` branch SHALL be cut from `main` at its last commit of the previous major before the baseline change merges to `main`.

#### Scenario REL-009.S1: Moving from 21 to 22

- **Given** `main` is on Angular 21 and the baseline is about to move to 22
- **When** the maintainers prepare the move
- **Then** `release/21` exists at the last Angular 21 commit of `main` before the baseline change merges

#### Scenario REL-009.S2: Missing previous release branch

- **Given** a pull request moves the Angular baseline from 21 to 22
- **And** `release/21` does not exist
- **When** the version-policy check runs
- **Then** the check fails and names the missing branch
