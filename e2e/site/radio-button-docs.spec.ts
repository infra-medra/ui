import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/radio-button';

const EXPECTED_EXAMPLES = [
  { id: 'example-group', label: 'Group' },
  { id: 'example-dynamic', label: 'Dynamic' },
  { id: 'example-card', label: 'Card' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

test.describe('RadioButton documentation page (RDB-001.S1)', () => {
  test('RDB-001.S1: renders On this page links, prose, live demos, and code blocks for all 10 examples', async ({ page }) => {
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

      const demo = section.locator('xpath=following-sibling::div[1]//med-radio-button').first();
      await expect(demo).toBeVisible();

      const codeText = section.locator('xpath=following-sibling::div[1]//app-code-block').locator('pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Interactive Group demo (reusing RadioButtonBasicDemo)
    const groupDemo = page.locator('app-radio-button-basic-demo');
    await groupDemo.scrollIntoViewIfNeeded();
    const groupValue = groupDemo.locator('p');
    await expect(groupValue).toContainText('Value: pro');
    await expect(groupValue).not.toContainText('enterprise');
    await groupDemo.getByRole('radio', { name: 'Enterprise' }).check();
    await expect(groupValue).toContainText('Value: enterprise');

    // Interactive Dynamic demo
    const dynamicDemo = page.locator('app-radio-button-dynamic-demo');
    await dynamicDemo.scrollIntoViewIfNeeded();
    const dynamicSelected = dynamicDemo.locator('p');
    await expect(dynamicSelected).toContainText('Selected: Accounting');
    await expect(dynamicSelected).not.toContainText('Marketing');
    await dynamicDemo.getByRole('radio', { name: 'Marketing' }).check();
    await expect(dynamicSelected).toContainText('Selected: Marketing');

    // Interactive Card demo
    const cardDemo = page.locator('app-radio-button-card-demo');
    await cardDemo.scrollIntoViewIfNeeded();
    const cardSelected = cardDemo.locator('p');
    await expect(cardSelected).toContainText('Selected: Starter');
    await expect(cardSelected).not.toContainText('Growth');
    await cardDemo.getByRole('radio', { name: /Growth/ }).check();
    await expect(cardSelected).toContainText('Selected: Growth');

    // Filled variant real-browser check
    const filledDemo = page.locator('app-radio-button-filled-demo');
    await filledDemo.scrollIntoViewIfNeeded();
    const basicRingBg = await groupDemo
      .locator('med-radio-button span[aria-hidden="true"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const filledRingBg = await filledDemo
      .locator('med-radio-button span[aria-hidden="true"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(filledRingBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(filledRingBg).not.toBe(basicRingBg);

    // Disabled and Invalid state checks
    await expect(page.locator('app-radio-button-disabled-demo input[type="radio"]').first()).toBeDisabled();
    await expect(page.locator('app-radio-button-invalid-demo input[type="radio"]').first()).toHaveAttribute('aria-invalid', 'true');

    // Interactive Signal Forms demo
    const signalDemo = page.locator('app-radio-button-signal-forms-demo');
    await signalDemo.scrollIntoViewIfNeeded();
    const signalValue = signalDemo.locator('p');
    await expect(signalValue).toContainText('Value: free');
    await expect(signalValue).not.toContainText('pro');
    await signalDemo.getByRole('radio', { name: 'Pro' }).check();
    await expect(signalValue).toContainText('Value: pro');

    // Interactive Template Driven demo
    const templateDemo = page.locator('app-radio-button-template-driven-demo');
    await templateDemo.scrollIntoViewIfNeeded();
    const templateValue = templateDemo.locator('p');
    await expect(templateValue).toContainText('Value: free');
    await expect(templateValue).not.toContainText('pro');
    await templateDemo.getByRole('radio', { name: 'Pro' }).check();
    await expect(templateValue).toContainText('Value: pro');

    // Interactive Reactive Forms demo
    const reactiveDemo = page.locator('app-radio-button-reactive-forms-demo');
    await reactiveDemo.scrollIntoViewIfNeeded();
    const reactiveValue = reactiveDemo.locator('p');
    await expect(reactiveValue).toContainText('Value: none');
    await expect(reactiveValue).toContainText('required');
    await expect(reactiveValue).not.toContainText('pro');
    await reactiveDemo.getByRole('radio', { name: 'Pro' }).check();
    await expect(reactiveValue).toContainText('Value: pro');
    await expect(reactiveValue).toContainText('valid');

    expect(errors).toEqual([]);
  });
});
