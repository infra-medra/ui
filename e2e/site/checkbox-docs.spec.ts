import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/checkbox';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-group', label: 'Group' },
  { id: 'example-indeterminate', label: 'Indeterminate' },
  { id: 'example-dynamic', label: 'Dynamic' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

test.describe('Checkbox documentation page (CKB-001.S1)', () => {
  test('CKB-001.S1: renders On this page links, prose, live demos, and code blocks for all 11 examples', async ({ page }) => {
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

      const demo = section.locator('xpath=following-sibling::div[1]//med-checkbox').first();
      await expect(demo).toBeVisible();

      const codeText = section.locator('xpath=following-sibling::div[1]//app-code-block').locator('pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Interactive Basic demo
    const basicDemo = page.locator('app-checkbox-basic-demo');
    await basicDemo.scrollIntoViewIfNeeded();
    await expect(basicDemo).toContainText('Value: false');
    await basicDemo.locator('input[type="checkbox"]').first().check();
    await expect(basicDemo).toContainText('Value: true');

    // Interactive Dynamic demo
    const dynamicDemo = page.locator('app-checkbox-dynamic-demo');
    await dynamicDemo.scrollIntoViewIfNeeded();
    const dynamicSelected = dynamicDemo.locator('p');
    await expect(dynamicSelected).toContainText('Selected:');
    await expect(dynamicSelected).not.toContainText('Marketing');
    await dynamicDemo.getByRole('checkbox', { name: 'Marketing' }).check();
    await expect(dynamicSelected).toContainText('Marketing');

    // Indeterminate state check
    const indeterminateInput = page.locator('app-checkbox-indeterminate-demo input[type="checkbox"]').first();
    await expect(indeterminateInput).toHaveJSProperty('indeterminate', true);

    // Filled variant real-browser check
    const filledDemo = page.locator('app-checkbox-filled-demo');
    await filledDemo.scrollIntoViewIfNeeded();
    const basicBoxBg = await basicDemo
      .locator('med-checkbox span[aria-hidden="true"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const filledBoxBg = await filledDemo
      .locator('med-checkbox span[aria-hidden="true"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(filledBoxBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(filledBoxBg).not.toBe(basicBoxBg);

    // Disabled and Invalid state checks
    await expect(page.locator('app-checkbox-disabled-demo input[type="checkbox"]').first()).toBeDisabled();
    await expect(page.locator('app-checkbox-invalid-demo input[type="checkbox"]').first()).toHaveAttribute('aria-invalid', 'true');

    // Interactive Signal Forms demo
    const signalDemo = page.locator('app-checkbox-signal-forms-demo');
    await signalDemo.scrollIntoViewIfNeeded();
    await expect(signalDemo).toContainText('Value: false');
    await signalDemo.locator('input[type="checkbox"]').first().check();
    await expect(signalDemo).toContainText('Value: true');

    // Interactive Template Driven demo
    const templateDemo = page.locator('app-checkbox-template-driven-demo');
    await templateDemo.scrollIntoViewIfNeeded();
    await expect(templateDemo).toContainText('Value: false');
    await templateDemo.locator('input[type="checkbox"]').first().check();
    await expect(templateDemo).toContainText('Value: true');

    // Interactive Reactive Forms demo
    const reactiveDemo = page.locator('app-checkbox-reactive-forms-demo');
    await reactiveDemo.scrollIntoViewIfNeeded();
    await expect(reactiveDemo).toContainText('Value: false');
    await reactiveDemo.locator('input[type="checkbox"]').first().check();
    await expect(reactiveDemo).toContainText('Value: true');
    await expect(reactiveDemo).toContainText('valid');

    expect(errors).toEqual([]);
  });
});
