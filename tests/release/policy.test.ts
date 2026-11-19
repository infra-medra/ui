import { checkVersionPolicy } from '../../tools/release/policy.mjs';

/** Builds a policy input that is compliant on Angular 21 unless a test overrides a field. */
function facts(overrides: Record<string, unknown> = {}) {
  return {
    rootPkg: { dependencies: { '@angular/core': '21.2.25' } },
    uiPkg: {
      version: '21.2.0',
      peerDependencies: {
        '@angular/core': '^21.2.0',
        '@angular/cdk': '^21.2.0',
        'chart.js': '^4.0.0',
      },
    },
    ...overrides,
  };
}

describe('version policy: major equals Angular major', () => {
  // REL-002.S1: Aligned versions
  it('REL-002.S1 passes when the package major and the peer ranges match the Angular major', () => {
    expect(checkVersionPolicy(facts())).toEqual([]);
  });

  // REL-002.S2: Mismatched major
  it('REL-002.S2 fails and names both majors when the package major differs', () => {
    const violations = checkVersionPolicy(
      facts({ uiPkg: { version: '22.0.0', peerDependencies: { '@angular/core': '^21.2.0' } } }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe('package-major');
    expect(violations[0].message).toContain('22');
    expect(violations[0].message).toContain('21');
  });

  // REL-002.S3: Mismatched peer range
  it('REL-002.S3 fails and names the peer dependency whose range targets another major', () => {
    const violations = checkVersionPolicy(
      facts({
        uiPkg: {
          version: '21.2.0',
          peerDependencies: { '@angular/core': '^21.2.0', '@angular/cdk': '^20.0.0' },
        },
      }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe('peer-range');
    expect(violations[0].message).toContain('@angular/cdk');
  });
});

describe('version policy: no major bump inside an Angular major', () => {
  // REL-003.S1: Major changeset without baseline change
  it('REL-003.S1 fails and names a major changeset when the Angular major is unchanged', () => {
    const violations = checkVersionPolicy(
      facts({ changesets: [{ file: '.changeset/big-change.md', bump: 'major' }] }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe('major-changeset');
    expect(violations[0].message).toContain('.changeset/big-change.md');
  });

  // REL-003.S2: Minor and patch changesets
  it('REL-003.S2 passes when pending changesets request only minor and patch bumps', () => {
    const violations = checkVersionPolicy(
      facts({
        changesets: [
          { file: '.changeset/feature.md', bump: 'minor' },
          { file: '.changeset/fix.md', bump: 'patch' },
        ],
      }),
    );

    expect(violations).toEqual([]);
  });
});

describe('version policy: release branch per Angular major', () => {
  // REL-008.S1: Release from a release branch
  it('REL-008.S1 passes on release/21 when the Angular major and the package major are 21', () => {
    expect(checkVersionPolicy(facts({ branch: 'release/21' }))).toEqual([]);
  });

  // REL-008.S2: Wrong major on a release branch
  it('REL-008.S2 fails on release/21 when the package version carries major 22', () => {
    const violations = checkVersionPolicy(
      facts({
        branch: 'release/21',
        uiPkg: { version: '22.0.0', peerDependencies: { '@angular/core': '^21.2.0' } },
      }),
    );

    expect(violations.map((violation) => violation.rule)).toContain('package-major');
  });

  it('REL-008.S2 fails when the branch major differs from the Angular major', () => {
    const violations = checkVersionPolicy(facts({ branch: 'release/22' }));

    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe('branch-major');
    expect(violations[0].message).toContain('release/22');
  });

  // M-09: branch names are attacker-controlled input
  it('REL-008.S2 rejects a release branch name that is not release/<digits>', () => {
    for (const branch of ['release/x', 'release/21; rm -rf', 'release/21/extra', 'release/']) {
      const violations = checkVersionPolicy(facts({ branch }));

      expect(violations.map((violation) => violation.rule)).toContain('branch-name');
    }
  });

  it('REL-008.S1 does not apply branch rules on other branches such as main', () => {
    expect(checkVersionPolicy(facts({ branch: 'main' }))).toEqual([]);
  });
});

describe('version policy: branch cut before an Angular baseline change', () => {
  // The pull request moves the baseline from Angular 21 (base) to 22 (head).
  const baselineMove = {
    rootPkg: { dependencies: { '@angular/core': '22.0.0' } },
    uiPkg: { version: '22.0.0', peerDependencies: { '@angular/core': '^22.0.0' } },
    baseAngularMajor: 21,
  };

  // REL-009.S1: Moving from 21 to 22
  it('REL-009.S1 passes when release/21 exists before the baseline moves from 21 to 22', () => {
    expect(
      checkVersionPolicy(facts({ ...baselineMove, existingReleaseBranches: ['release/21'] })),
    ).toEqual([]);
  });

  // REL-009.S2: Missing previous release branch
  it('REL-009.S2 fails and names release/21 when it does not exist', () => {
    const violations = checkVersionPolicy(facts({ ...baselineMove, existingReleaseBranches: [] }));

    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe('release-branch-missing');
    expect(violations[0].message).toContain('release/21');
  });

  it('REL-009.S2 fails when only an unrelated release branch exists', () => {
    const violations = checkVersionPolicy(
      facts({ ...baselineMove, existingReleaseBranches: ['release/20'] }),
    );

    expect(violations.map((violation) => violation.rule)).toContain('release-branch-missing');
  });

  it('REL-009.S1 does not require a release branch when the Angular major is unchanged', () => {
    expect(
      checkVersionPolicy(facts({ baseAngularMajor: 21, existingReleaseBranches: [] })),
    ).toEqual([]);
  });
});
