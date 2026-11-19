// Pure release-policy rules for @medra/ui. The CLI in `check.mjs` gathers the facts
// (package files, git state) and passes them in, so every rule here is unit-testable.

/** The only accepted release branch shape. */
const RELEASE_BRANCH = /^release\/([0-9]+)$/;

/**
 * Extracts the major number from a version or range such as `21.2.25` or `^21.2.0`.
 * @param {string | undefined} versionOrRange
 * @returns {number | null} The major, or null when none can be read.
 */
export function majorOf(versionOrRange) {
  const match = /(\d+)\.\d+\.\d+|(\d+)(?:\.x)?/.exec(String(versionOrRange ?? ''));
  if (!match) return null;
  return Number(match[1] ?? match[2]);
}

/**
 * The Angular major the repository is built and tested against: the major of
 * `@angular/core` in the root package.json.
 * @param {{ dependencies?: Record<string, string> }} rootPkg
 * @returns {number | null}
 */
export function angularMajor(rootPkg) {
  return majorOf(rootPkg?.dependencies?.['@angular/core']);
}

/**
 * @typedef {{ rule: string, message: string }} Violation
 */

/**
 * Checks that the package major and the Angular peer ranges match the Angular major.
 * @param {{
 *   rootPkg: { dependencies?: Record<string, string> },
 *   uiPkg: { version: string, peerDependencies?: Record<string, string> },
 *   changesets?: { file: string, bump: string }[],
 *   baseAngularMajor?: number | null,
 *   existingReleaseBranches?: string[],
 *   branch?: string,
 * }} facts
 * @returns {Violation[]} One entry per violation; empty when the policy holds.
 */
export function checkVersionPolicy(facts) {
  /** @type {Violation[]} */
  const violations = [];
  const angular = angularMajor(facts.rootPkg);
  if (angular === null) {
    violations.push({
      rule: 'angular-major',
      message: 'Cannot read the Angular major from @angular/core in the root package.json.',
    });
    return violations;
  }

  const packageMajor = majorOf(facts.uiPkg.version);
  if (packageMajor !== angular) {
    violations.push({
      rule: 'package-major',
      message: `Package major ${packageMajor} must equal the Angular major ${angular}.`,
    });
  }

  for (const [name, range] of Object.entries(facts.uiPkg.peerDependencies ?? {})) {
    if (!name.startsWith('@angular/')) continue;
    const peerMajor = majorOf(range);
    if (peerMajor !== angular) {
      violations.push({
        rule: 'peer-range',
        message: `Peer dependency ${name} (${range}) must target Angular ${angular}.`,
      });
    }
  }

  // Branch names are attacker-controlled, so only `release/<digits>` is accepted.
  const branch = facts.branch;
  if (typeof branch === 'string' && branch.startsWith('release/')) {
    const match = RELEASE_BRANCH.exec(branch);
    if (!match) {
      violations.push({
        rule: 'branch-name',
        message: 'Release branches must be named release/<major>, with digits only.',
      });
    } else if (Number(match[1]) !== angular) {
      violations.push({
        rule: 'branch-major',
        message: `Branch ${branch} must carry the Angular major ${angular}.`,
      });
    }
  }

  // A `major` changeset is allowed only on a pull request that moves the Angular baseline,
  // that is, when the base branch has a different Angular major than this one.
  const movesBaseline =
    facts.baseAngularMajor != null && facts.baseAngularMajor !== angular;
  if (movesBaseline) {
    // The previous major must have its release branch before the baseline change merges.
    const previousBranch = `release/${facts.baseAngularMajor}`;
    if (!(facts.existingReleaseBranches ?? []).includes(previousBranch)) {
      violations.push({
        rule: 'release-branch-missing',
        message: `The Angular baseline moves from ${facts.baseAngularMajor} to ${angular}, but ${previousBranch} does not exist. Cut it from main before merging.`,
      });
    }
  } else {
    for (const changeset of facts.changesets ?? []) {
      if (changeset.bump === 'major') {
        violations.push({
          rule: 'major-changeset',
          message: `${changeset.file} requests a major bump, but the Angular major (${angular}) is unchanged.`,
        });
      }
    }
  }
  return violations;
}

/** Root of the published package; changes under it can ship to consumers. */
const PACKAGE_ROOT = 'projects/medra/ui/';

/** A pending changeset is a Markdown file directly in `.changeset/`, excluding the README. */
const CHANGESET_FILE = /^\.changeset\/(?!README\.md$)[^/]+\.md$/;

/**
 * Checks that a pull request touching the published package source adds a changeset.
 * Test files (`*.spec.ts`, `*.test.ts`) and everything outside the package are exempt.
 * @param {{ changedFiles: string[], addedFiles: string[], headBranch?: string }} facts
 * @returns {Violation[]}
 */
export function checkChangesetRequired(facts) {
  // The Version Packages pull request consumes the changesets, so it never adds one.
  if (facts.headBranch && /^changeset-release\/(main|release\/[0-9]+)$/.test(facts.headBranch)) return [];
  const touchesPackage = facts.changedFiles.some(
    (file) =>
      file.startsWith(PACKAGE_ROOT) && !file.endsWith('.spec.ts') && !file.endsWith('.test.ts'),
  );
  if (!touchesPackage) return [];
  if (facts.addedFiles.some((file) => CHANGESET_FILE.test(file))) return [];
  return [
    {
      rule: 'changeset-required',
      message: `This pull request changes ${PACKAGE_ROOT} but adds no changeset. Run "npx changeset" and commit the file.`,
    },
  ];
}
