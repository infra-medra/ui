import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/textarea';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-auto-resize', label: 'Auto Resize' },
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

test.describe('Textarea documentation page (TXA-001.S1)', () => {
  test('TXA-001.S1: renders On this page links, prose, live demos, and code blocks for all 12 examples', async ({ page }) => {
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

      const demo = section.locator('xpath=following-sibling::div[1]//textarea').first();
      await expect(demo).toBeVisible();

      const codeText = section.locator('xpath=following-sibling::div[1]//app-code-block').locator('pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Interactive Signal Forms demo
    const signalDemo = page.locator('app-textarea-signal-forms-demo');
    await signalDemo.scrollIntoViewIfNeeded();
    const signalTextarea = signalDemo.locator('textarea').first();
    await signalTextarea.fill('Great release notes');
    await expect(signalDemo).toContainText('Great release notes');

    // Interactive Template Driven demo
    const templateDemo = page.locator('app-textarea-template-driven-demo');
    await templateDemo.scrollIntoViewIfNeeded();
    const templateTextarea = templateDemo.locator('textarea').first();
    await templateTextarea.fill('Ship on Friday');
    await expect(templateDemo).toContainText('Ship on Friday');

    // Interactive Reactive Forms demo
    const reactiveDemo = page.locator('app-textarea-reactive-forms-demo');
    await reactiveDemo.scrollIntoViewIfNeeded();
    const reactiveTextarea = reactiveDemo.locator('textarea').first();
    await reactiveTextarea.fill('All checks green');
    await expect(reactiveDemo).toContainText('All checks green');
    await expect(reactiveDemo).toContainText('valid');

    // Fluid layout real-browser check
    const fluidDemo = page.locator('app-textarea-fluid-demo');
    await fluidDemo.scrollIntoViewIfNeeded();
    const fluidMetrics = await fluidDemo.evaluate((el) => {
      const container = el.querySelector('[data-testid="fluid-container"]') as HTMLElement;
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      return {
        containerWidth: container.getBoundingClientRect().width,
        textareaWidth: textarea.getBoundingClientRect().width,
      };
    });
    expect(Math.abs(fluidMetrics.textareaWidth - fluidMetrics.containerWidth)).toBeLessThanOrEqual(2);

    // Filled variant real-browser check
    const filledDemo = page.locator('app-textarea-filled-demo');
    await filledDemo.scrollIntoViewIfNeeded();
    const basicBg = await page.locator('app-textarea-basic-demo textarea').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    const filledBg = await filledDemo.locator('textarea').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(filledBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(filledBg).not.toBe(basicBg);

    // Disabled and Invalid state checks
    await expect(page.locator('app-textarea-disabled-demo textarea').first()).toBeDisabled();
    await expect(page.locator('app-textarea-invalid-demo textarea').first()).toHaveAttribute('aria-invalid', 'true');

    expect(errors).toEqual([]);
  });
});
