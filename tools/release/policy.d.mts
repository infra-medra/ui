export interface Violation {
  rule: string;
  message: string;
}

export interface PolicyFacts {
  rootPkg: { dependencies?: Record<string, string> };
  uiPkg: { version: string; peerDependencies?: Record<string, string> };
  changesets?: { file: string; bump: string }[];
  baseAngularMajor?: number | null;
  existingReleaseBranches?: string[];
  branch?: string;
}

export function majorOf(versionOrRange: string | undefined): number | null;
export function angularMajor(rootPkg: PolicyFacts['rootPkg']): number | null;
export function checkVersionPolicy(facts: PolicyFacts | Record<string, unknown>): Violation[];
export function checkChangesetRequired(facts: {
  changedFiles: string[];
  addedFiles: string[];
  headBranch?: string;
}): Violation[];
