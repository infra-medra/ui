import { expect, test, type Locator } from '@playwright/test';

const PAGE = '/docs/components/slider';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-step', label: 'Step' },
  { id: 'example-range', label: 'Range' },
  { id: 'example-range-constraints', label: 'Range Constraints' },
  { id: 'example-vertical', label: 'Vertical' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-controlled', label: 'Controlled' },
  { id: 'example-custom', label: 'Custom' },
  { id: 'example-filter', label: 'Filter' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

/** Focuses the demo's first slider thumb and presses ArrowRight, then checks the displayed value. */
async function expectArrowRightUpdates(demo: Locator, before: string, after: string): Promise<void> {
  await demo.scrollIntoViewIfNeeded();
  const value = demo.locator('p').first();
  await expect(value).toContainText(before);
  await demo.getByRole('slider').first().focus();
  await demo.getByRole('slider').first().press('ArrowRight');
  await expect(value).toContainText(after);
}

test.describe('Slider documentation page (SLD-001.S1)', () => {
  test('SLD-001.S1: renders On this page links, prose, live demos, and code blocks for all 14 examples', async ({ page }) => {
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

      const demo = section.locator('xpath=following-sibling::div[1]//med-slider').first();
      await expect(demo).toBeVisible();

      const codeText = section.locator('xpath=following-sibling::div[1]//app-code-block').locator('pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Interactive demos: ArrowRight moves the thumb one step and the bound value follows.
    await expectArrowRightUpdates(page.locator('app-slider-basic-demo'), '60%', '61%');
    await expectArrowRightUpdates(page.locator('app-slider-signal-forms-demo'), 'Value: 30', 'Value: 31');
    await expectArrowRightUpdates(page.locator('app-slider-template-driven-demo'), 'Value: 40', 'Value: 41');
    await expectArrowRightUpdates(page.locator('app-slider-reactive-forms-demo'), 'Value: 50', 'Value: 51');

    // Controlled demo: buttons outside the slider move its thumb.
    const controlledDemo = page.locator('app-slider-controlled-demo');
    await controlledDemo.scrollIntoViewIfNeeded();
    const controlledThumb = controlledDemo.getByRole('slider');
    await expect(controlledThumb).toHaveAttribute('aria-valuenow', '50');
    await controlledDemo.getByRole('button', { name: 'Increase' }).click();
    await expect(controlledThumb).toHaveAttribute('aria-valuenow', '60');
    await controlledDemo.getByRole('button', { name: 'Decrease' }).click();
    await controlledDemo.getByRole('button', { name: 'Decrease' }).click();
    await expect(controlledThumb).toHaveAttribute('aria-valuenow', '40');

    expect(errors).toEqual([]);
  });
});
