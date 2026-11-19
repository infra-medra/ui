import { existsSync, readFileSync } from 'node:fs';

// The workflow files are read as text; the assertions pin the configuration that produces
// the behavior (triggers, permissions, step order, absence of stored tokens).

const read = (path: string): string => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const ci = read('.github/workflows/ci.yml');
const release = read('.github/workflows/release.yml');

/** Returns the text of a top-level job (two-space indented key) or '' when absent. */
function job(workflow: string, name: string): string {
  const match = new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  [A-Za-z0-9_-]+:\\n|(?![\\s\\S]))`, 'm').exec(workflow);
  return match ? match[0] : '';
}

/** Line numbers are enough to compare step order inside one file. */
const position = (text: string, needle: string): number => text.indexOf(needle);

describe('release workflows exist', () => {
  it('REL-006.S2 ships ci.yml and release.yml', () => {
    expect(ci).not.toBe('');
    expect(release).not.toBe('');
  });
});

describe('ci.yml: untrusted pull request code runs with read-only access (M-01)', () => {
  it('REL-006.S2 triggers only on pull_request and workflow_dispatch', () => {
    const on = /^on:\n([\s\S]*?)(?=^\S)/m.exec(ci)?.[1] ?? '';

    expect(on).toContain('pull_request:');
    expect(on).toContain('workflow_dispatch:');
    expect(on).not.toMatch(/^\s*(push|pull_request_target|workflow_run):/m);
  });

  it('REL-006.S2 has contents: read only, no id-token, no secrets', () => {
    expect(ci).toMatch(/^permissions:\n\s+contents: read\n/m);
    expect(ci).not.toContain('id-token');
    expect(ci).not.toContain('secrets.');
  });

  it('REL-006.S2 runs the changeset check, policy check, tests and build', () => {
    expect(ci).toContain('tools/release/check.mjs changeset');
    expect(ci).toContain('tools/release/check.mjs policy');
    expect(ci).toContain('npm test');
    expect(ci).toContain('npm run build');
  });
});

describe('release.yml: gated publication', () => {
  it('REL-005.S1 triggers on pushes to main and release/** only', () => {
    const on = /^on:\n([\s\S]*?)(?=^\S)/m.exec(release)?.[1] ?? '';

    expect(on).toContain('push:');
    expect(on).toContain('- main');
    expect(on).toContain("- 'release/**'");
    expect(on).not.toContain('pull_request');
  });

  it('REL-006.S2 denies all permissions at workflow level (M-05)', () => {
    expect(release).toMatch(/^permissions: \{\}$/m);
  });

  it('REL-006.S2 has a verify job and a release job that needs it', () => {
    expect(job(release, 'verify')).not.toBe('');
    expect(job(release, 'release')).toMatch(/needs: verify/);
  });

  it('REL-007.S1 grants id-token: write to the release job alone (M-05)', () => {
    expect(job(release, 'release')).toContain('id-token: write');
    expect(job(release, 'verify')).not.toContain('id-token');
    expect(job(release, 'verify')).toMatch(/contents: read/);
  });

  it('REL-006.S2 runs policy check, tests and build in verify, before the Changesets action', () => {
    const verify = job(release, 'verify');
    const policy = position(verify, 'tools/release/check.mjs policy');
    const tests = position(verify, 'npm test');
    const build = position(verify, 'npm run build');

    expect(policy).toBeGreaterThan(-1);
    expect(tests).toBeGreaterThan(-1);
    expect(build).toBeGreaterThan(-1);
    expect(policy).toBeLessThan(tests);
    expect(tests).toBeLessThan(build);
    expect(verify).not.toContain('changesets/action');
    expect(job(release, 'release')).toContain('changesets/action');
  });

  it('REL-007.S1 publishes the artifact built in verify and never builds in the release job (D-13)', () => {
    const releaseJob = job(release, 'release');

    expect(releaseJob).not.toContain('npm run build');
    expect(releaseJob).toMatch(/actions\/download-artifact@[0-9a-f]{40}/);
    expect(releaseJob).toContain('name: medra-ui-dist');
    expect(releaseJob.indexOf('download-artifact')).toBeLessThan(releaseJob.indexOf('changesets/action'));
  });

  it('REL-005.S1 versions with changesets and publishes through publish.mjs', () => {
    const releaseJob = job(release, 'release');

    expect(releaseJob).toMatch(/version-script: npm run version/);
    expect(releaseJob).toMatch(/publish-script: node tools\/release\/publish\.mjs/);
  });

  it('REL-005.S2 relies on the Changesets action, which opens no version PR without changesets', () => {
    expect(job(release, 'release')).toContain('changesets/action@');
  });

  it('REL-007.S1 uses no stored npm token (M-07)', () => {
    for (const text of [ci, release]) {
      expect(text).not.toContain('NPM_TOKEN');
      expect(text).not.toContain('NODE_AUTH_TOKEN');
    }
  });

  it('REL-006.S2 pins every action to a full commit SHA (M-06)', () => {
    for (const text of [ci, release]) {
      const uses = [...text.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)].map((match) => match[1]);

      expect(uses.length).toBeGreaterThan(0);
      for (const reference of uses) expect(reference).toMatch(/@[0-9a-f]{40}$/);
    }
  });

  it('REL-006.S2 never interpolates expressions inside run scripts (M-09)', () => {
    for (const text of [ci, release]) {
      const runs = [...text.matchAll(/^\s*run:\s*(.*(?:\n(?!\s*(?:-|\w[\w-]*:)).*)*)/gm)].map((match) => match[1]);

      for (const script of runs) expect(script).not.toContain('${{');
    }
  });

  it('REL-006.S1 serializes runs per branch without cancelling a publish (M-11)', () => {
    expect(release).toMatch(/^concurrency:/m);
    expect(release).toContain('cancel-in-progress: false');
  });

  it('REL-007.S1 runs the release job in the npm-publish environment (M-02)', () => {
    expect(job(release, 'release')).toMatch(/environment: npm-publish/);
  });

  it('REL-006.S1 dispatches ci.yml for changeset-release/* branches (M-10)', () => {
    expect(job(release, 'release')).toContain('changeset-release/');
    expect(job(release, 'release')).toContain('ci.yml');
  });

  it('REL-007.S1 installs without scripts in the publishing job (M-05)', () => {
    expect(job(release, 'release')).toContain('npm ci --ignore-scripts');
  });

  it('REL-007.S1 uses Node 22.14 or later and npm 11.5.1 or later (M-08)', () => {
    const node = /node-version:\s*['"]?(\d+)\.(\d+)/.exec(release);
    const npm = /npm@(\d+)\.(\d+)\.(\d+)/.exec(release);

    expect(node).not.toBeNull();
    expect(Number(node?.[1]) * 1000 + Number(node?.[2])).toBeGreaterThanOrEqual(22014);
    expect(npm).not.toBeNull();
    expect(
      Number(npm?.[1]) * 1_000_000 + Number(npm?.[2]) * 1000 + Number(npm?.[3]),
    ).toBeGreaterThanOrEqual(11_005_001);
  });
});
