import { expect, test, type Locator, type Page } from '@playwright/test';

const AUTOCOMPLETE_URL = '/docs/components/autocomplete';
const BUTTON_URL = '/docs/components/button';

/** The API reference section of a component page. */
function apiSection(page: Page): Locator {
  return page.locator('#api-reference');
}

/** The table that follows the subtitle of one API entry type. */
function tableUnder(page: Page, subtitle: string): Locator {
  return apiSection(page)
    .getByRole('heading', { name: subtitle, exact: true })
    .locator('xpath=following::table[1]');
}

test.describe('Component page — API reference grouped by type', () => {
  // SITE-022.S1
  test('SITE-022.S1: shows Inputs, Outputs and Templates tables, each entry only in its own type', async ({ page }) => {
    await page.goto(AUTOCOMPLETE_URL);

    for (const subtitle of ['Inputs', 'Outputs', 'Templates']) {
      await expect(
        apiSection(page).getByRole('heading', { name: subtitle, exact: true }),
        `the "${subtitle}" subtitle is missing`,
      ).toHaveCount(1);
    }
    await expect(apiSection(page).locator('table'), 'expected exactly three API tables').toHaveCount(3);

    const inputs = tableUnder(page, 'Inputs');
    const outputs = tableUnder(page, 'Outputs');
    const templates = tableUnder(page, 'Templates');

    await expect(inputs.getByRole('cell', { name: 'suggestions', exact: true })).toHaveCount(1);
    await expect(outputs.getByRole('cell', { name: 'optionSelected', exact: true })).toHaveCount(1);
    await expect(templates.getByRole('cell', { name: '#item', exact: true })).toHaveCount(1);

    await expect(inputs.getByRole('cell', { name: 'optionSelected', exact: true })).toHaveCount(0);
    await expect(inputs.getByRole('cell', { name: '#item', exact: true })).toHaveCount(0);
    await expect(outputs.getByRole('cell', { name: 'suggestions', exact: true })).toHaveCount(0);
    await expect(outputs.getByRole('cell', { name: '#item', exact: true })).toHaveCount(0);
    await expect(templates.getByRole('cell', { name: 'suggestions', exact: true })).toHaveCount(0);
    await expect(templates.getByRole('cell', { name: 'optionSelected', exact: true })).toHaveCount(0);
  });

  // SITE-022.S2
  test('SITE-022.S2: omits the subtitle and table of a type the component does not have', async ({ page }) => {
    await page.goto(BUTTON_URL);

    await expect(apiSection(page).getByRole('heading', { name: 'Inputs', exact: true })).toHaveCount(1);
    await expect(
      apiSection(page).getByRole('heading', { name: 'Templates', exact: true }),
      'a Templates subtitle is shown for a component without templates',
    ).toHaveCount(0);
    await expect(
      apiSection(page).getByRole('heading', { name: 'Outputs', exact: true }),
      'an Outputs subtitle is shown for a component without outputs',
    ).toHaveCount(0);
    await expect(apiSection(page).locator('table'), 'expected a single API table').toHaveCount(1);
  });
});
