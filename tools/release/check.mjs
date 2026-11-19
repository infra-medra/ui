#!/usr/bin/env node
// Release checks for @medra.dev/ui. Gathers file and git facts, then delegates every rule to
// `policy.mjs`. Usage: `node tools/release/check.mjs policy|changeset`.
// Git is always called with an argument array and no shell, because branch names are
// attacker-controlled input.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { angularMajor, checkChangesetRequired, checkVersionPolicy } from './policy.mjs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Runs git without a shell; returns trimmed stdout, or null when git fails. */
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/** Only `main` and `release/<digits>` are accepted as a pull request base. */
function safeBase() {
  const base = process.env.GITHUB_BASE_REF;
  return base && /^(main|release\/[0-9]+)$/.test(base) ? base : null;
}

/** Reads the bump type of every pending changeset from its front matter. */
function readChangesets() {
  let names = [];
  try {
    names = readdirSync('.changeset').filter((name) => name.endsWith('.md') && name !== 'README.md');
  } catch {
    return [];
  }
  return names.map((name) => {
    const text = readFileSync(`.changeset/${name}`, 'utf8');
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
    // Fail closed: any `major` entry wins, and front matter with no bump entry is reported.
    const bumps = [...front.matchAll(/:\s*['"]?(major|minor|patch)['"]?\s*$/gm)].map((m) => m[1]);
    if (front.trim() && bumps.length === 0) {
      console.error(`Cannot read a bump type from .changeset/${name}.`);
      process.exit(2);
    }
    const bump = bumps.includes('major') ? 'major' : (bumps[0] ?? 'patch');
    return { file: `.changeset/${name}`, bump };
  });
}

function policy() {
  const isPullRequest = process.env.GITHUB_EVENT_NAME === 'pull_request';
  const facts = {
    rootPkg: readJson('package.json'),
    uiPkg: readJson('projects/medra/ui/package.json'),
    changesets: readChangesets(),
    // On pull requests the head branch name is not the release branch being built.
    branch: isPullRequest ? undefined : process.env.GITHUB_REF_NAME,
  };
  const base = safeBase();
  if (base) {
    const basePkg = git(['show', `origin/${base}:package.json`]);
    if (!basePkg) {
      console.error(`Cannot read package.json from origin/${base}; fetch the base branch first.`);
      process.exit(2);
    }
    facts.baseAngularMajor = angularMajor(JSON.parse(basePkg));
    const remote = git(['branch', '-r', '--list', 'origin/release/*']) ?? '';
    facts.existingReleaseBranches = remote
      .split('\n')
      .map((line) => line.trim().replace(/^origin\//, ''))
      .filter(Boolean);
  }
  return checkVersionPolicy(facts);
}

function changeset() {
  const base = safeBase();
  if (!base) return [];
  const range = `origin/${base}...HEAD`;
  const list = (filter) =>
    (git(['diff', '--name-only', `--diff-filter=${filter}`, range]) ?? '').split('\n').filter(Boolean);
  return checkChangesetRequired({ changedFiles: list('ACDMRT'), addedFiles: list('A'), headBranch: process.env.GITHUB_HEAD_REF });
}

const commands = { policy, changeset };
const run = commands[process.argv[2]];
if (!run) {
  console.error('Usage: node tools/release/check.mjs <policy|changeset>');
  process.exit(2);
}
const violations = run();
for (const violation of violations) console.error(`[${violation.rule}] ${violation.message}`);
if (violations.length > 0) process.exit(1);
console.log(`${process.argv[2]} check passed.`);
