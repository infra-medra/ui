import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const uiDir = resolve(__dirname, '../../projects/medra/ui');

describe('release baseline', () => {
  // REL-001.S1: Baseline version
  it('REL-001.S1 starts the Angular-aligned versions at 21.0.0', () => {
    const pkg = JSON.parse(readFileSync(resolve(uiDir, 'package.json'), 'utf8')) as {
      version: string;
    };
    const changelog = readFileSync(resolve(uiDir, 'CHANGELOG.md'), 'utf8');

    expect(changelog).toMatch(/^## 21\.0\.0$/m);
    expect(pkg.version.split('.')[0]).toBe('21');
  });
});
