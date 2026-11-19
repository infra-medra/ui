import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENTS_DIR = join(__dirname, '../../projects/site/src/app/pages/docs/components');
const pages = readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.page.ts'));

describe('component pages use the shared layout', () => {
  it('SITE-013.S1 finds all 85 component pages', () => {
    expect(pages).toHaveLength(85);
  });

  // SITE-013.S1
  it.each(pages)('SITE-013.S1 %s renders inside app-component-doc', (file) => {
    const source = readFileSync(join(COMPONENTS_DIR, file), 'utf8');
    expect(source).toContain('<app-component-doc');
    expect(source).toMatch(/import\s*\{[^}]*ComponentDocComponent[^}]*\}\s*from\s*'[^']*shared\/component-doc'/);
  });

  // SITE-013.S4
  it.each(pages)('SITE-013.S4 %s leaves the title and status badge to the layout (no own <h1>)', (file) => {
    const source = readFileSync(join(COMPONENTS_DIR, file), 'utf8');
    expect(source).not.toMatch(/<h1[\s>]/);
  });

  // SITE-013.S3
  it.each(pages)('SITE-013.S3 %s keeps its API table fed by content/api JSON', (file) => {
    const source = readFileSync(join(COMPONENTS_DIR, file), 'utf8');
    expect(source).toMatch(/content\/api\/[a-z0-9-]+\.json/);
  });
});
