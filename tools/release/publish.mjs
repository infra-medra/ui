#!/usr/bin/env node
// Publishes the built @medra/ui package from `dist/medra/ui` and then tags the release.
// Authentication is npm Trusted Publishing (OIDC); no token is read or written here.
// Usage: `node tools/release/publish.mjs [--dry-run]`.
// Commands are run with argument arrays and no shell (M-09).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PACKAGE_DIR = 'dist/medra/ui';
const dryRun = process.argv.includes('--dry-run');

const { name, version } = JSON.parse(readFileSync(`${PACKAGE_DIR}/package.json`, 'utf8'));

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Refusing to publish unexpected version "${version}".`);
  process.exit(1);
}

/** True when this exact version is already on the registry (re-runs must not fail). */
function alreadyPublished() {
  try {
    execFileSync('npm', ['view', `${name}@${version}`, 'version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const publishArgs = ['publish', PACKAGE_DIR, '--access', 'public', '--provenance'];
console.log(`Package: ${name}@${version}`);

if (dryRun) {
  console.log(`Dry run: would run "npm ${publishArgs.join(' ')}" and then "npx changeset tag".`);
  process.exit(0);
}

if (alreadyPublished()) {
  console.log(`${name}@${version} is already published; skipping.`);
} else {
  execFileSync('npm', publishArgs, { stdio: 'inherit' });
}
execFileSync('npx', ['changeset', 'tag'], { stdio: 'inherit' });
