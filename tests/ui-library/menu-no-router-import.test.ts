import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * UI-043.S7 — the primary `@medra/ui` entry point must not depend on
 * `@angular/router`. Only the secondary `@medra/ui/router` entry may import it,
 * and `@angular/router` stays an optional peer with a patched floor (M-04).
 */

const REPO_ROOT = path.resolve(__dirname, '../..');
const UI_ROOT = path.join(REPO_ROOT, 'projects/medra/ui');
const LIB_DIR = path.join(UI_ROOT, 'src/lib');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(full);
    }
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [full] : [];
  });
}

describe('menu router integration boundary', () => {
  it('no non-spec file of the primary entry point imports @angular/router', () => {
    const offenders = sourceFiles(LIB_DIR).filter((file) => /from\s+['"]@angular\/router(\/[^'"]*)?['"]/.test(fs.readFileSync(file, 'utf8')));
    expect(offenders.map((file) => path.relative(REPO_ROOT, file))).toEqual([]);
  });

  it('exports the link strategy token and contract types from the primary public API', () => {
    const publicApi = fs.readFileSync(path.join(UI_ROOT, 'src/public-api.ts'), 'utf8');
    expect(publicApi).toContain("export * from './lib/menu/menu-link'");
    const menuLink = fs.readFileSync(path.join(LIB_DIR, 'menu/menu-link.ts'), 'utf8');
    expect(menuLink).toMatch(/export const MED_MENU_LINK_STRATEGY/);
    expect(menuLink).toMatch(/export interface MenuLinkStrategy/);
  });

  it('keeps the link directive internal (not exported from the public API)', () => {
    const publicApi = fs.readFileSync(path.join(UI_ROOT, 'src/public-api.ts'), 'utf8');
    expect(publicApi).not.toContain('menu-router-link.directive');
  });

  it('the router entry point exports provideMedraMenuRouterLinks', () => {
    const entry = fs.readFileSync(path.join(UI_ROOT, 'router/src/public-api.ts'), 'utf8');
    expect(entry).toMatch(/provideMedraMenuRouterLinks/);
    const impl = fs.readFileSync(path.join(UI_ROOT, 'router/src/menu-router-links.ts'), 'utf8');
    expect(impl).toMatch(/export function provideMedraMenuRouterLinks/);
    expect(impl).toMatch(/from\s+['"]@angular\/router['"]/);
  });

  it('declares @angular/router as an optional peer with the patched floor', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(UI_ROOT, 'package.json'), 'utf8')) as {
      peerDependencies: Record<string, string>;
      peerDependenciesMeta: Record<string, { optional?: boolean }>;
    };
    expect(pkg.peerDependencies['@angular/router']).toBe('^21.2.25');
    expect(pkg.peerDependenciesMeta['@angular/router']?.optional).toBe(true);
  });
});
