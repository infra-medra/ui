import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/date-picker';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-format', label: 'Format' },
  { id: 'example-locale', label: 'Locale' },
  { id: 'example-min-max', label: 'Min / Max & Disabled Dates' },
  { id: 'example-multiple', label: 'Multiple' },
  { id: 'example-range', label: 'Range' },
  { id: 'example-time', label: 'Time' },
  { id: 'example-time-only', label: 'Time Only' },
  { id: 'example-month-picker', label: 'Month Picker' },
  { id: 'example-year-picker', label: 'Year Picker' },
  { id: 'example-multiple-months', label: 'Multiple Months' },
  { id: 'example-drilldown', label: 'Drilldown Navigation' },
  { id: 'example-inline', label: 'Inline' },
  { id: 'example-button-bar', label: 'Button Bar' },
  { id: 'example-date-template', label: 'Date Template' },
  { id: 'example-clear-icon', label: 'Clear Icon' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

test.describe('DatePicker documentation page (DTP-016.S1, DTP-022.S1, DTP-023.S1)', () => {
  test('DTP-016.S1, DTP-022.S1, DTP-023.S1: renders On this page links, prose, live demos, and code blocks for all 26 examples', async ({ page }) => {
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

      const demo = section.locator('xpath=following-sibling::div[1]//med-date-picker').first();
      await expect(demo).toBeVisible();

      const codeText = section.locator('xpath=following-sibling::div[1]//app-code-block').locator('pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Multiple Months demo renders 2 month grids when opened
    const multiMonthsDemo = page.locator('app-date-picker-multiple-months-demo');
    await multiMonthsDemo.scrollIntoViewIfNeeded();
    await multiMonthsDemo.locator('button[aria-label="Toggle calendar"]').click();
    await expect(page.locator('.cdk-overlay-pane [role="grid"]')).toHaveCount(2);
    await page.keyboard.press('Escape');

    // Interactive Range demo
    const rangeDemo = page.locator('app-date-picker-range-demo');
    await rangeDemo.scrollIntoViewIfNeeded();
    await rangeDemo.locator('button[aria-label="Toggle calendar"]').click();
    const dayCells = page.locator('.cdk-overlay-pane [role="gridcell"]:not([aria-disabled="true"])');
    await dayCells.nth(5).click();
    await dayCells.nth(10).click();
    await expect(rangeDemo).not.toContainText('Range: none');

    // Interactive Clear Icon demo
    const clearDemo = page.locator('app-date-picker-clear-icon-demo');
    await clearDemo.scrollIntoViewIfNeeded();
    const clearInput = clearDemo.locator('input').first();
    await expect(clearInput).not.toHaveValue('');
    await clearDemo.locator('button[aria-label="Clear"]').click();
    await expect(clearInput).toHaveValue('');

    // Interactive Signal Forms demo
    const signalDemo = page.locator('app-date-picker-signal-forms-demo');
    await signalDemo.scrollIntoViewIfNeeded();
    const signalInput = signalDemo.locator('input').first();
    await signalInput.fill('06/10/2026');
    await signalInput.press('Enter');
    await expect(signalDemo).toContainText('2026');

    // Interactive Template Driven demo
    const templateDemo = page.locator('app-date-picker-template-driven-demo');
    await templateDemo.scrollIntoViewIfNeeded();
    const templateInput = templateDemo.locator('input').first();
    await templateInput.fill('07/20/2026');
    await templateInput.press('Enter');
    await expect(templateDemo).toContainText('2026');

    // Interactive Reactive Forms demo
    const reactiveDemo = page.locator('app-date-picker-reactive-forms-demo');
    await reactiveDemo.scrollIntoViewIfNeeded();
    const reactiveInput = reactiveDemo.locator('input').first();
    await reactiveInput.fill('05/15/2026');
    await reactiveInput.press('Enter');
    await expect(reactiveDemo).toContainText('2026');

    // Interactive Inline demo (DTP-023.S1)
    const inlineDemo = page.locator('app-date-picker-inline-demo');
    await inlineDemo.scrollIntoViewIfNeeded();
    await expect(inlineDemo.locator('input[role="combobox"]')).toHaveCount(0);
    await expect(inlineDemo.locator('[role="grid"]')).toBeVisible();
    await inlineDemo.locator('[role="gridcell"]:not([aria-disabled="true"])').nth(10).click();
    await expect(inlineDemo).not.toContainText('Selected: none');

    // Interactive Button Bar demo (DTP-023.S1)
    const buttonBarDemo = page.locator('app-date-picker-button-bar-demo');
    await buttonBarDemo.scrollIntoViewIfNeeded();
    await buttonBarDemo.locator('button[aria-label="Toggle calendar"]').click();
    await page.locator('.cdk-overlay-pane button', { hasText: 'Today' }).click();
    const buttonBarInput = buttonBarDemo.locator('input').first();
    await expect(buttonBarInput).not.toHaveValue('');
    await buttonBarDemo.locator('button[aria-label="Toggle calendar"]').click();
    await page.locator('.cdk-overlay-pane button', { hasText: 'Clear' }).click();
    await expect(buttonBarInput).toHaveValue('');

    // Interactive Year Picker demo (DTP-023.S1)
    const yearDemo = page.locator('app-date-picker-year-picker-demo');
    await yearDemo.scrollIntoViewIfNeeded();
    await yearDemo.locator('button[aria-label="Toggle calendar"]').click();
    await expect(page.locator('.cdk-overlay-pane [role="gridcell"]')).toHaveCount(12);
    await page.locator('.cdk-overlay-pane button[aria-label="Next decade"]').click();
    const firstYearCell = page.locator('.cdk-overlay-pane [role="gridcell"]:not([aria-disabled="true"])').first();
    const chosenYear = (await firstYearCell.innerText()).trim();
    await firstYearCell.click();
    await expect(yearDemo.locator('input').first()).toHaveValue(chosenYear);

    // Interactive Time Only demo (DTP-023.S1)
    const timeOnlyDemo = page.locator('app-date-picker-time-only-demo');
    await timeOnlyDemo.scrollIntoViewIfNeeded();
    await timeOnlyDemo.locator('button[aria-label="Toggle calendar"]').click();
    await expect(page.locator('.cdk-overlay-pane [role="grid"]')).toHaveCount(0);
    await expect(page.locator('.cdk-overlay-pane [role="listbox"]')).toHaveCount(0);
    await page.locator('.cdk-overlay-pane input[aria-label="Hour"]').fill('9');
    await page.locator('.cdk-overlay-pane input[aria-label="Minute"]').fill('30');
    await page.locator('.cdk-overlay-pane button', { hasText: 'Done' }).click();
    await expect(timeOnlyDemo.locator('input').first()).toHaveValue(/^9:30 (AM|PM)$/);

    // Interactive Date Template demo (DTP-023.S1)
    const templateCellDemo = page.locator('app-date-picker-date-template-demo');
    await templateCellDemo.scrollIntoViewIfNeeded();
    await templateCellDemo.locator('button[aria-label="Toggle calendar"]').click();
    const customCells = page.locator('.cdk-overlay-pane [role="gridcell"] [data-testid="date-template-cell"]');
    expect(await customCells.count()).toBeGreaterThan(20);
    await customCells.nth(14).click();
    await expect(templateCellDemo.locator('input').first()).not.toHaveValue('');

    // Fluid layout real-browser check (DTP-022.S1, DTP-023.S1)
    const fluidDemo = page.locator('app-date-picker-fluid-demo');
    await fluidDemo.scrollIntoViewIfNeeded();
    const fluidPicker = fluidDemo.locator('med-date-picker').first();
    await expect(fluidPicker).toHaveClass(/med-date-picker-fluid/);
    const fluidMetrics = await fluidDemo.evaluate((el) => {
      const container = el.querySelector('[data-testid="fluid-container"]') as HTMLElement;
      const picker = el.querySelector('med-date-picker') as HTMLElement;
      const input = picker.querySelector('input') as HTMLInputElement;
      return {
        containerWidth: container.getBoundingClientRect().width,
        pickerWidth: picker.getBoundingClientRect().width,
        inputWidth: input.getBoundingClientRect().width,
      };
    });
    expect(Math.abs(fluidMetrics.pickerWidth - fluidMetrics.containerWidth)).toBeLessThanOrEqual(2);
    expect(Math.abs(fluidMetrics.inputWidth - fluidMetrics.containerWidth)).toBeLessThanOrEqual(2);

    // Filled variant real-browser check (DTP-022.S1, DTP-023.S1)
    const filledDemo = page.locator('app-date-picker-filled-demo');
    await filledDemo.scrollIntoViewIfNeeded();
    const basicBg = await page.locator('app-date-picker-basic-demo input').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    const filledBg = await filledDemo.locator('input').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(filledBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(filledBg).not.toBe(basicBg);

    expect(errors).toEqual([]);
  });
});
