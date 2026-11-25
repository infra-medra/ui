import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/dialog';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-template', label: 'Template' },
  { id: 'example-position', label: 'Position' },
  { id: 'example-maximizable', label: 'Maximizable' },
  { id: 'example-draggable', label: 'Draggable' },
  { id: 'example-resizable', label: 'Resizable' },
  { id: 'example-long-content', label: 'Long Content' },
  { id: 'example-headless', label: 'Headless' },
  { id: 'example-responsive-dismissal', label: 'Responsive & Dismissal' },
  { id: 'example-without-modal', label: 'Without Modal' },
] as const;

test.describe('Dialog documentation page (DLD-001.S1, DLD-002.S1, DLD-003.S1)', () => {
  test('DLD-001.S1 / DLD-002.S1 / DLD-003.S1: renders On this page links, prose, live demos, code blocks, and interactive dialogs for all 10 examples including non-modal behavior', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' || /hydration|NG0500|NG0501|NG0502|NG0503|NG0504|NG0505/i.test(text)) {
        errors.push(`[${msg.type()}] ${text}`);
      }
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PAGE);

    const tocLinks = page.getByRole('navigation', { name: 'On this page' }).locator('a[href*="#example-"]');
    await expect(tocLinks).toHaveCount(EXPECTED_EXAMPLES.length);

    const sectionIds = await page
      .locator('article app-prose[id^="example-"]')
      .evaluateAll((els) => els.map((el) => el.id));
    expect(sectionIds).toEqual(EXPECTED_EXAMPLES.map((e) => e.id));

    for (let i = 0; i < EXPECTED_EXAMPLES.length; i++) {
      const { id, label } = EXPECTED_EXAMPLES[i];
      const link = tocLinks.nth(i);
      await expect(link).toHaveAttribute('href', new RegExp(`#${id}$`));
      await expect(link).toContainText(label);

      const section = page.locator(`#${id}`);
      await expect(section).toBeVisible();
      expect(await section.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);

      const demoWrapper = section.locator('xpath=following-sibling::div[1]');
      await expect(demoWrapper.locator('button').first()).toBeVisible();

      const codeText = demoWrapper.locator('app-code-block pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Basic dialog open/close and scoped result output check (L-026)
    const basicDemo = page.locator('app-dialog-basic-demo');
    await basicDemo.scrollIntoViewIfNeeded();
    await expect(basicDemo.locator('p')).toHaveCount(0);
    await basicDemo.getByRole('button').first().click();
    const basicDialog = page.getByRole('dialog');
    await expect(basicDialog).toBeVisible();
    await basicDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(basicDemo.locator('p')).toContainText('Last result: cancelled');

    // Template dialog open/close
    const templateWrapper = page.locator('#example-template').locator('xpath=following-sibling::div[1]');
    await templateWrapper.scrollIntoViewIfNeeded();
    await templateWrapper.getByRole('button').first().click();
    const templateDialog = page.getByRole('dialog');
    await expect(templateDialog).toBeVisible();
    await templateDialog.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Maximizable dialog open, maximize toggle, and close
    const maximizableWrapper = page.locator('#example-maximizable').locator('xpath=following-sibling::div[1]');
    await maximizableWrapper.scrollIntoViewIfNeeded();
    await maximizableWrapper.getByRole('button').first().click();
    const maxDialog = page.getByRole('dialog');
    await expect(maxDialog).toBeVisible();
    await maxDialog.getByRole('button', { name: 'Maximize' }).click();
    await expect(maxDialog).toHaveAttribute('data-maximized', 'true');
    await expect(maxDialog.getByRole('button', { name: 'Restore' })).toBeVisible();
    await maxDialog.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Headless dialog open/close
    const headlessWrapper = page.locator('#example-headless').locator('xpath=following-sibling::div[1]');
    await headlessWrapper.scrollIntoViewIfNeeded();
    await headlessWrapper.getByRole('button').first().click();
    const headlessDialog = page.getByRole('dialog');
    await expect(headlessDialog).toBeVisible();
    await expect(headlessDialog.locator('h2')).toHaveCount(0);
    await headlessDialog.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Without Modal dialog open, no backdrop, no aria-modal, outside control clickable, and close (DLD-002.S1, DLD-003.S1)
    const withoutModalWrapper = page.locator('#example-without-modal').locator('xpath=following-sibling::div[1]');
    await withoutModalWrapper.scrollIntoViewIfNeeded();
    const outsideButton = withoutModalWrapper.getByRole('button', { name: /Outside action/ });
    await expect(outsideButton).toContainText('Outside action (0)');
    await withoutModalWrapper.getByRole('button', { name: 'Show' }).click();

    const nonModalDialog = page.getByRole('dialog');
    await expect(nonModalDialog).toBeVisible();
    await expect(page.locator('.cdk-overlay-backdrop')).toHaveCount(0);
    expect(await nonModalDialog.getAttribute('aria-modal')).toBeNull();

    await outsideButton.click();
    await expect(outsideButton).toContainText('Outside action (1)');
    await expect(nonModalDialog).toBeVisible();

    await nonModalDialog.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});
