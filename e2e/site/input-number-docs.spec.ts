import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/input-number';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-numerals', label: 'Numerals' },
  { id: 'example-locale', label: 'Locale' },
  { id: 'example-currency', label: 'Currency' },
  { id: 'example-prefix-suffix', label: 'Prefix & Suffix' },
  { id: 'example-buttons', label: 'Buttons' },
  { id: 'example-clear-icon', label: 'Clear Icon' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

test.describe('InputNumber documentation page (INN-001.S1)', () => {
  test('INN-001.S1: renders On this page links, prose, live demos, and code blocks for all 17 examples', async ({ page }) => {
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

      const demo = section.locator('xpath=following-sibling::div[1]//med-input-number').first();
      await expect(demo).toBeVisible();

      const codeText = section.locator('xpath=following-sibling::div[1]//app-code-block').locator('pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Interactive Currency demo
    const currencyDemo = page.locator('app-input-number-currency-demo');
    await currencyDemo.scrollIntoViewIfNeeded();
    const currencyInput = currencyDemo.locator('input').first();
    await currencyInput.fill('1250.5');
    await currencyInput.press('Enter');
    await expect(currencyInput).toHaveValue('$1,250.50');
    await expect(currencyDemo).toContainText('1250.5');

    // Interactive Buttons demo
    const buttonsDemo = page.locator('app-input-number-buttons-demo');
    await buttonsDemo.scrollIntoViewIfNeeded();
    const buttonsInput = buttonsDemo.locator('input').first();
    const initialButtonsVal = await buttonsInput.inputValue();
    await buttonsDemo.locator('button[aria-label="Increment"]').first().click();
    await expect(buttonsInput).not.toHaveValue(initialButtonsVal);
    await expect(buttonsInput).toHaveValue('21');

    // Interactive Clear Icon demo
    const clearDemo = page.locator('app-input-number-clear-icon-demo');
    await clearDemo.scrollIntoViewIfNeeded();
    const clearInput = clearDemo.locator('input').first();
    await expect(clearInput).not.toHaveValue('');
    await clearDemo.locator('button[aria-label="Clear"]').click();
    await expect(clearInput).toHaveValue('');
    await expect(clearDemo).toContainText('none');

    // Interactive Signal Forms demo
    const signalDemo = page.locator('app-input-number-signal-forms-demo');
    await signalDemo.scrollIntoViewIfNeeded();
    const signalInput = signalDemo.locator('input').first();
    await signalInput.fill('42');
    await signalInput.press('Enter');
    await expect(signalDemo).toContainText('42');

    // Interactive Template Driven demo
    const templateDemo = page.locator('app-input-number-template-driven-demo');
    await templateDemo.scrollIntoViewIfNeeded();
    const templateInput = templateDemo.locator('input').first();
    await templateInput.fill('85');
    await templateInput.press('Enter');
    await expect(templateDemo).toContainText('85');

    // Interactive Reactive Forms demo
    const reactiveDemo = page.locator('app-input-number-reactive-forms-demo');
    await reactiveDemo.scrollIntoViewIfNeeded();
    const reactiveInput = reactiveDemo.locator('input').first();
    await reactiveInput.fill('150');
    await reactiveInput.press('Enter');
    await expect(reactiveDemo).toContainText('150');
    await expect(reactiveDemo).toContainText('valid');

    // Fluid layout real-browser check
    const fluidDemo = page.locator('app-input-number-fluid-demo');
    await fluidDemo.scrollIntoViewIfNeeded();
    const fluidMetrics = await fluidDemo.evaluate((el) => {
      const container = el.querySelector('[data-testid="fluid-container"]') as HTMLElement;
      const control = el.querySelector('med-input-number') as HTMLElement;
      const input = control.querySelector('input') as HTMLInputElement;
      return {
        containerWidth: container.getBoundingClientRect().width,
        controlWidth: control.getBoundingClientRect().width,
        inputWidth: input.getBoundingClientRect().width,
      };
    });
    expect(Math.abs(fluidMetrics.controlWidth - fluidMetrics.containerWidth)).toBeLessThanOrEqual(2);
    expect(Math.abs(fluidMetrics.inputWidth - fluidMetrics.containerWidth)).toBeLessThanOrEqual(2);

    // Filled variant real-browser check
    const filledDemo = page.locator('app-input-number-filled-demo');
    await filledDemo.scrollIntoViewIfNeeded();
    const basicBg = await page.locator('app-input-number-basic-demo input').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    const filledBg = await filledDemo.locator('input').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(filledBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(filledBg).not.toBe(basicBg);

    expect(errors).toEqual([]);
  });
});
