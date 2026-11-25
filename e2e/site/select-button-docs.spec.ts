import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/select-button';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-multiple', label: 'Multiple' },
  { id: 'example-template', label: 'Template' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-allow-empty', label: 'Allow Empty' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

test.describe('SelectButton documentation page (SLB-001.S1, SLB-003.S1, SLB-004.S1)', () => {
  test('SLB-001.S1 / SLB-004.S1: renders On this page links, prose, live demos, and code blocks for all 11 examples', async ({ page }) => {
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

      const demo = section.locator('xpath=following-sibling::div[1]//med-select-button').first();
      await expect(demo).toBeVisible();

      const codeText = section.locator('xpath=following-sibling::div[1]//app-code-block').locator('pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Interactive Basic demo (reusing SelectButtonBasicDemo)
    const basicDemo = page.locator('app-select-button-basic-demo');
    await basicDemo.scrollIntoViewIfNeeded();
    const basicValue = basicDemo.locator('p');
    await expect(basicValue).toContainText('Value: list');
    await expect(basicValue).not.toContainText('grid');
    await basicDemo.getByRole('radio', { name: 'Grid' }).click();
    await expect(basicValue).toContainText('Value: grid');

    // Interactive Multiple demo
    const multipleDemo = page.locator('app-select-button-multiple-demo');
    await multipleDemo.scrollIntoViewIfNeeded();
    const multipleValue = multipleDemo.locator('p');
    await expect(multipleValue).toContainText('Value: bold');
    await expect(multipleValue).not.toContainText('italic');
    await multipleDemo.getByRole('button', { name: 'Italic' }).click();
    await expect(multipleValue).toContainText('bold, italic');

    // Interactive Template demo (SLB-004.S1)
    const itemTemplateDemo = page.locator('app-select-button-template-demo');
    await itemTemplateDemo.scrollIntoViewIfNeeded();
    await expect(itemTemplateDemo.locator('med-select-button button med-icon')).toHaveCount(3);
    const itemTemplateValue = itemTemplateDemo.locator('p');
    await expect(itemTemplateValue).toContainText('Value: list');
    await itemTemplateDemo.getByRole('radio', { name: 'Media' }).click();
    await expect(itemTemplateValue).toContainText('Value: media');

    // Sizes demo renders all three size variants
    const sizesDemo = page.locator('app-select-button-sizes-demo');
    await sizesDemo.scrollIntoViewIfNeeded();
    await expect(sizesDemo.locator('med-select-button')).toHaveCount(3);

    // Fluid layout real-browser check (SLB-003.S1)
    const fluidDemo = page.locator('app-select-button-fluid-demo');
    await fluidDemo.scrollIntoViewIfNeeded();
    const fluidMetrics = await fluidDemo.evaluate((el) => {
      const container = el.querySelector('[data-testid="fluid-container"]') as HTMLElement;
      const controls = el.querySelectorAll('med-select-button');
      const fluidControl = controls[0] as HTMLElement;
      const defaultControl = controls[1] as HTMLElement;
      const optionWidths = Array.from(fluidControl.querySelectorAll('button')).map(
        (btn) => btn.getBoundingClientRect().width,
      );
      return {
        containerWidth: container.getBoundingClientRect().width,
        fluidWidth: fluidControl.getBoundingClientRect().width,
        defaultWidth: defaultControl.getBoundingClientRect().width,
        optionWidths,
      };
    });
    expect(Math.abs(fluidMetrics.fluidWidth - fluidMetrics.containerWidth)).toBeLessThanOrEqual(2);
    expect(fluidMetrics.defaultWidth).toBeLessThan(fluidMetrics.containerWidth - 20);
    expect(fluidMetrics.optionWidths).toHaveLength(3);
    expect(Math.max(...fluidMetrics.optionWidths) - Math.min(...fluidMetrics.optionWidths)).toBeLessThanOrEqual(2);

    // Disabled demo renders disabled buttons (whole control and per-option)
    const disabledDemo = page.locator('app-select-button-disabled-demo');
    await disabledDemo.scrollIntoViewIfNeeded();
    await expect(disabledDemo.locator('med-select-button button[aria-disabled="true"]').first()).toBeVisible();

    // Invalid demo renders invalid ring styling
    const invalidDemo = page.locator('app-select-button-invalid-demo');
    await invalidDemo.scrollIntoViewIfNeeded();
    await expect(invalidDemo.locator('med-select-button button').first()).toHaveClass(/ring-danger-500/);

    // Interactive Allow Empty demo (reusing SelectButtonAllowEmptyDemo)
    const allowEmptyDemo = page.locator('app-select-button-allow-empty-demo');
    await allowEmptyDemo.scrollIntoViewIfNeeded();
    const allowEmptyValue = allowEmptyDemo.locator('p');
    await expect(allowEmptyValue).toContainText('Value: left');
    await expect(allowEmptyValue).not.toContainText('center');
    await allowEmptyDemo.getByRole('radio', { name: 'Left' }).click();
    await expect(allowEmptyValue).toContainText('Value: left');
    await allowEmptyDemo.getByRole('radio', { name: 'Center' }).click();
    await expect(allowEmptyValue).toContainText('Value: center');

    // Interactive Signal Forms demo
    const signalDemo = page.locator('app-select-button-signal-forms-demo');
    await signalDemo.scrollIntoViewIfNeeded();
    const signalValue = signalDemo.locator('p');
    await expect(signalValue).toContainText('Value: free');
    await expect(signalValue).not.toContainText('pro');
    await signalDemo.getByRole('radio', { name: 'Pro' }).click();
    await expect(signalValue).toContainText('Value: pro');

    // Interactive Template Driven demo
    const templateDemo = page.locator('app-select-button-template-driven-demo');
    await templateDemo.scrollIntoViewIfNeeded();
    const templateValue = templateDemo.locator('p');
    await expect(templateValue).toContainText('Value: free');
    await expect(templateValue).not.toContainText('pro');
    await templateDemo.getByRole('radio', { name: 'Pro' }).click();
    await expect(templateValue).toContainText('Value: pro');

    // Interactive Reactive Forms demo
    const reactiveDemo = page.locator('app-select-button-reactive-forms-demo');
    await reactiveDemo.scrollIntoViewIfNeeded();
    const reactiveValue = reactiveDemo.locator('p');
    await expect(reactiveValue).toContainText('Value: none');
    await expect(reactiveValue).toContainText('required');
    await expect(reactiveValue).not.toContainText('pro');
    await reactiveDemo.getByRole('radio', { name: 'Pro' }).click();
    await expect(reactiveValue).toContainText('Value: pro');
    await expect(reactiveValue).toContainText('valid');

    expect(errors).toEqual([]);
  });
});
