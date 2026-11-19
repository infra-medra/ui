import { expect, test, type Locator } from '@playwright/test';

/**
 * UI-043 in a real browser, with the real hydrated site: a Ctrl/Cmd+click on a
 * `routerLink` item reaches the browser uncancelled (so it opens a new tab) and
 * the Router of the current tab does not navigate, while a plain click
 * navigates without a reload. Whether the browser then opens the tab is its
 * own behavior and flaky in headless runs, so the test checks the event.
 */

const PAGE = '/docs/components/tab-menu';

/**
 * Angular removes the `jsaction` attribute from an element once it has
 * hydrated it, so its absence means the directive's click handler is attached.
 * Clicking earlier hits the event-replay window, where the outcome depends on
 * timing and has nothing to do with the menu.
 */
async function hydrated(link: Locator): Promise<void> {
  await expect(link, 'the link did not hydrate').not.toHaveAttribute('jsaction', /.*/, { timeout: 10_000 });
}

test.describe('menu routerLink in the browser', () => {
  test('UI-043.S3: Ctrl+click is left to the browser and does not navigate the current tab', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PAGE);
    const demo = page.locator('app-tab-menu-router-link-demo');
    await expect(demo, 'no "router-link" example on the page').toHaveCount(1, { timeout: 5_000 });

    const link = demo.locator('a[role="tab"]').first();
    await expect(link, 'the item is not a real <a> with an href').toHaveAttribute('href', /^\/docs\//);
    await hydrated(link);

    // Read what the component's handlers did to the event, then cancel it so the run never depends on the headless browser opening a tab.
    await page.evaluate(() => {
      const probe = window as unknown as { __click?: { defaultPrevented: boolean; ctrlOrMeta: boolean } };
      document.addEventListener(
        'click',
        (event) => {
          probe.__click = { defaultPrevented: event.defaultPrevented, ctrlOrMeta: event.ctrlKey || event.metaKey };
          event.preventDefault();
        },
        { once: true },
      );
    });
    await link.click({ modifiers: ['ControlOrMeta'] });

    const seen = await page.evaluate(() => (window as unknown as { __click?: { defaultPrevented: boolean; ctrlOrMeta: boolean } }).__click);
    expect(seen?.ctrlOrMeta, 'the click did not carry the modifier').toBe(true);
    expect(seen?.defaultPrevented, 'the component cancelled the browser default of a Ctrl+click').toBe(false);
    expect(new URL(page.url()).pathname, 'the current tab navigated').toBe(PAGE);
  });

  test('UI-043.S1: a plain click navigates without reloading the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PAGE);
    const demo = page.locator('app-tab-menu-router-link-demo');
    await expect(demo, 'no "router-link" example on the page').toHaveCount(1, { timeout: 5_000 });

    const link = demo.locator('a[role="tab"]').first();
    await hydrated(link);
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
    const href = (await link.getAttribute('href'))!;
    await link.click();

    await expect(page, 'the click did not navigate').toHaveURL(new RegExp(`${href}$`));
    const survived = await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload === true);
    expect(survived, 'the page reloaded').toBe(true);
  });
});
