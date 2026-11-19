import { checkChangesetRequired } from '../../tools/release/policy.mjs';

describe('changeset requirement: package source changes need a changeset', () => {
  // REL-004.S1: Package change without changeset
  it('REL-004.S1 fails when a package source file changes and no changeset is added', () => {
    const violations = checkChangesetRequired({
      changedFiles: ['projects/medra/ui/src/lib/button/button.ts'],
      addedFiles: [],
    });

    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe('changeset-required');
  });

  it('REL-004.S1 fails for package.json, router and styles changes without a changeset', () => {
    for (const file of [
      'projects/medra/ui/package.json',
      'projects/medra/ui/router/src/index.ts',
      'projects/medra/ui/styles/tokens.css',
    ]) {
      const violations = checkChangesetRequired({ changedFiles: [file], addedFiles: [] });

      expect(violations.map((violation) => violation.rule)).toContain('changeset-required');
    }
  });

  // REL-004.S2: Package change with changeset
  it('REL-004.S2 passes when a package source file changes and a changeset is added', () => {
    expect(
      checkChangesetRequired({
        changedFiles: ['projects/medra/ui/src/lib/button/button.ts', '.changeset/quick-fox.md'],
        addedFiles: ['.changeset/quick-fox.md'],
      }),
    ).toEqual([]);
  });

  it('REL-004.S2 does not accept the changeset README or config as a changeset', () => {
    const violations = checkChangesetRequired({
      changedFiles: ['projects/medra/ui/src/lib/button/button.ts', '.changeset/README.md'],
      addedFiles: ['.changeset/README.md'],
    });

    expect(violations.map((violation) => violation.rule)).toContain('changeset-required');
  });

  // REL-004.S3: Tests-only change
  it('REL-004.S3 passes without a changeset when only test files of the package change', () => {
    expect(
      checkChangesetRequired({
        changedFiles: [
          'projects/medra/ui/src/lib/button/button.spec.ts',
          'projects/medra/ui/src/lib/card/card.test.ts',
        ],
        addedFiles: [],
      }),
    ).toEqual([]);
  });

  it('REL-004.S3 passes without a changeset for docs site, e2e and tooling changes', () => {
    expect(
      checkChangesetRequired({
        changedFiles: [
          'projects/docs/src/app/app.ts',
          'e2e/button.spec.ts',
          'tools/release/policy.mjs',
          '.github/workflows/ci.yml',
        ],
        addedFiles: [],
      }),
    ).toEqual([]);
  });

  // Review finding F-04: the Version Packages pull request consumes the changesets.
  it('REL-004.S3 exempts the Version Packages branch, which adds no changeset by design', () => {
    for (const headBranch of ['changeset-release/main', 'changeset-release/release/21']) {
      expect(
        checkChangesetRequired({
          changedFiles: ['projects/medra/ui/package.json'],
          addedFiles: [],
          headBranch,
        }),
      ).toEqual([]);
    }
  });

  it('REL-004.S1 does not exempt a look-alike head branch', () => {
    const violations = checkChangesetRequired({
      changedFiles: ['projects/medra/ui/src/lib/button/button.ts'],
      addedFiles: [],
      headBranch: 'changeset-release/main-evil',
    });

    expect(violations).toHaveLength(1);
  });
});
