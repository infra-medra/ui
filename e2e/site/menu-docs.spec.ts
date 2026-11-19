import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

/**
 * SITE-027: the six menu pages show a working example of a hidden item
 * (`visible`), of a `routerLink` item and of an active item, list each in
 * "On this page", and document the new `MenuItem` fields in the API table.
 */

interface MenuPage {
  readonly slug: string;
  readonly label: string;
  /** The tag the page's demos render. */
  readonly tag: string;
  /** Role of the element that represents one item in the rendered component. */
  readonly itemRole: string;
}

const PAGES: readonly MenuPage[] = [
  { slug: 'menu', label: 'Menu', tag: 'med-menu', itemRole: 'menuitem' },
  { slug: 'menubar', label: 'Menubar', tag: 'med-menubar', itemRole: 'button, a' },
  { slug: 'mega-menu', label: 'Mega menu', tag: 'med-mega-menu', itemRole: 'button, a' },
  { slug: 'panel-menu', label: 'Panel menu', tag: 'med-panel-menu', itemRole: 'button, a' },
  { slug: 'tiered-menu', label: 'Tiered menu', tag: 'med-tiered-menu', itemRole: 'menuitem' },
  { slug: 'tab-menu', label: 'Tab menu', tag: 'med-tab-menu', itemRole: 'tab' },
];

const KINDS = ['visible', 'router-link', 'active'] as const;

const MENU_TYPES_SOURCE = 'projects/medra/ui/src/lib/menu/menu.types.ts';
const NEW_FIELDS = ['visible', 'routerLink', 'routerLinkActiveOptions'] as const;

/** The declared type of a `MenuItem` field, read from the source (L-016: compare types, not only defaults). */
function declaredFieldType(name: string): string {
  const source = readFileSync(MENU_TYPES_SOURCE, 'utf8');
  const match = new RegExp(`readonly ${name}\\?:\\s*([^;]+);`).exec(source);
  expect(match, `${name} is not declared in MenuItem`).not.toBeNull();
  return match![1].replace(/\s+/g, ' ').trim();
}

for (const { slug, label, tag } of PAGES) {
  test.describe(`${label} docs page — menu item fields`, () => {
    // SITE-027.S1
    for (const kind of KINDS) {
      test(`SITE-027.S1: the page shows the "${kind}" example and lists it in "On this page"`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/docs/components/${slug}`);
        await expect(page.locator(`app-${slug}-${kind}-demo`), `no "${kind}" example on the ${slug} page`).toHaveCount(1, { timeout: 5_000 });
        await expect(page.locator(`#example-${kind}`), `no anchor "example-${kind}"`).toHaveCount(1);
        await expect(
          page.getByRole('navigation', { name: 'On this page' }).locator(`a[href$="#example-${kind}"]`),
          `no "On this page" item for "${kind}"`,
        ).toHaveCount(1);
      });
    }

    // SITE-027.S1 (M-03): the examples say that `visible` is not authorization
    test('SITE-027.S1: the visible example says that hiding an item is not authorization', async ({ page }) => {
      await page.goto(`/docs/components/${slug}`);
      const section = page.locator('#example-visible');
      await expect(section, 'no "visible" example on the page').toHaveCount(1, { timeout: 5_000 });
      const text = (await section.innerText()).replace(/\s+/g, ' ');
      expect(/not (an )?authorization|not access control/i.test(text), 'the text does not say that visible is not authorization').toBe(true);
      expect(/guard/i.test(text), 'the text does not say that the route needs a guard').toBe(true);
    });

    // SITE-027.S2
    test('SITE-027.S2: toggling the visibility makes the item appear and disappear', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/docs/components/${slug}`);
      const demo = page.locator(`app-${slug}-visible-demo`);
      await expect(demo, 'no "visible" example on the page').toHaveCount(1, { timeout: 5_000 });
      const hidden = demo.getByText('Reports', { exact: true });
      const toggle = demo.getByRole('button', { name: /Reports/ }).filter({ hasText: /^(Show|Hide) Reports$/ });

      await expect(hidden, 'the item starts visible').toHaveCount(0);
      await toggle.click();
      await expect(hidden, 'the item did not appear').toHaveCount(1);
      await toggle.click();
      await expect(hidden, 'the item did not disappear again').toHaveCount(0);
    });

    // SITE-027.S3
    test('SITE-027.S3: the active mark moves to the item of the page the user navigates to', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/docs/components/${slug}`);
      const demo = page.locator(`app-${slug}-active-demo`);
      await expect(demo, 'no "active" example on the page').toHaveCount(1, { timeout: 5_000 });

      const current = demo.locator('[aria-current="page"]');
      await expect(current, 'the item of the current page is not marked').toHaveCount(1);
      await expect(current, 'the marked item is not the current page').toContainText(label);

      const target = PAGES[(PAGES.findIndex((entry) => entry.slug === slug) + 1) % PAGES.length];
      // Wait for hydration (Angular drops `jsaction` once the handlers are attached) so the click goes through the Router.
      await expect(demo.locator('a').first(), 'the example did not hydrate').not.toHaveAttribute('jsaction', /.*/, { timeout: 10_000 });
      await demo.getByText(target.label, { exact: true }).click();
      await expect(page, 'the click did not navigate').toHaveURL(new RegExp(`/docs/components/${target.slug}$`));

      const next = page.locator(`app-${target.slug}-active-demo [aria-current="page"]`);
      await expect(next, 'the new page has no marked item').toHaveCount(1);
      await expect(next, 'the mark did not move to the clicked item').toContainText(target.label);
    });

    // SITE-027.S3 (UI-044.S1): the mark has to be visible, not only an attribute
    test('SITE-027.S3: the active item is drawn in a different color than an inactive one', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/docs/components/${slug}`);
      const demo = page.locator(`app-${slug}-active-demo`);
      await expect(demo.locator('[aria-current="page"]'), 'no marked item').toHaveCount(1, { timeout: 5_000 });
      const colorOf = (selector: string) => demo.locator(selector).first().evaluate((el) => getComputedStyle(el).color);
      const active = await colorOf('[aria-current="page"]');
      const inactive = await colorOf('a:not([aria-current])');
      expect(active, 'the active item has the same color as an inactive one').not.toBe(inactive);
    });

    // SITE-027.S3 (UI-044.S3): `exact` keeps an item of an ancestor route inactive
    test('SITE-027.S3: an item with exact: true is not marked on a deeper route', async ({ page }) => {
      await page.goto(`/docs/components/${slug}`);
      const demo = page.locator(`app-${slug}-active-demo`);
      await expect(demo, 'no "active" example on the page').toHaveCount(1, { timeout: 5_000 });
      const docsHome = demo.getByText('Docs home', { exact: true });
      await expect(docsHome, 'the exact item is missing from the example').toHaveCount(1);
      await expect(demo.locator('[aria-current="page"]').filter({ hasText: 'Docs home' }), 'an exact item is marked on a deeper route').toHaveCount(0);
    });

    // SITE-027.S4 (L-016)
    test('SITE-027.S4: the API table lists visible, routerLink and routerLinkActiveOptions with the declared types', async ({ page }) => {
      await page.goto(`/docs/components/${slug}`);
      const rows = await page.locator('app-api-table tbody tr').evaluateAll((trs) =>
        trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').replace(/\s+/g, ' ').trim())),
      );
      const byName = new Map(rows.map(([name, type]) => [name, type]));
      for (const field of NEW_FIELDS) {
        expect(byName.has(field), `the API table has no row for "${field}"`).toBe(true);
        expect(byName.get(field), `type of "${field}"`).toBe(declaredFieldType(field));
      }
    });

    test(`${label} page has the tag the examples render`, async ({ page }) => {
      await page.goto(`/docs/components/${slug}`);
      await expect(page.locator(`app-${slug}-visible-demo ${tag}`), `no <${tag}> in the visible example`).toHaveCount(1, { timeout: 5_000 });
    });
  });
}
