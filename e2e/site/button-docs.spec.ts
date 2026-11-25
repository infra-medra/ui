import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/button';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-icons', label: 'Icons' },
  { id: 'example-loading', label: 'Loading' },
  { id: 'example-link', label: 'Link' },
  { id: 'example-severity', label: 'Severity' },
  { id: 'example-rounded', label: 'Rounded' },
  { id: 'example-text', label: 'Text' },
  { id: 'example-raised-text', label: 'Raised Text' },
  { id: 'example-outlined', label: 'Outlined' },
  { id: 'example-icon-only', label: 'Icon Only' },
  { id: 'example-badge', label: 'Badge' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-template', label: 'Template' },
  { id: 'example-button-group', label: 'Button Group' },
] as const;

test.describe('Button documentation page (BTD-001.S1, BTD-002.S1, BTD-003.S1)', () => {
  test('BTD-001.S1 / BTD-002.S1 / BTD-003.S1: renders On this page links, prose, live demos, and code blocks for all 16 examples', async ({ page }) => {
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

      const container = section.locator('xpath=following-sibling::div[1]');
      const demoControl = container.locator('[medButton]').first();
      await expect(demoControl).toBeVisible();

      const codeText = container.locator('app-code-block pre code').first();
      await expect(codeText).toBeVisible();
      expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
    }

    // Interactive Loading demo: clicking toggles loading and sets aria-busy="true"
    const loadingDemo = page.locator('app-button-loading-demo');
    await loadingDemo.scrollIntoViewIfNeeded();
    const loadingBtn = loadingDemo.locator('button[medButton]').first();
    await loadingBtn.click();
    await expect(loadingBtn).toHaveAttribute('aria-busy', 'true');

    // Link demo: renders native a[medButton]
    const linkDemo = page.locator('app-button-link-demo');
    await linkDemo.scrollIntoViewIfNeeded();
    await expect(linkDemo.locator('a[medButton]').first()).toBeVisible();

    // Disabled demo: button has native disabled attribute
    const disabledDemo = page.locator('app-button-disabled-demo');
    await disabledDemo.scrollIntoViewIfNeeded();
    await expect(disabledDemo.locator('button[medButton]').first()).toHaveAttribute('disabled', '');

    // BTD-002.S1 / BTD-003.S1: Button Group demo renders role="group" and connects adjacent button radii
    const buttonGroupDemo = page.locator('app-button-group-demo');
    await buttonGroupDemo.scrollIntoViewIfNeeded();
    const buttonGroup = buttonGroupDemo.locator('med-button-group');
    await expect(buttonGroup).toBeVisible();
    await expect(buttonGroup).toHaveAttribute('role', 'group');

    const groupDisplay = await buttonGroup.evaluate((el) => getComputedStyle(el).display);
    expect(groupDisplay).toBe('inline-flex');

    const groupButtons = buttonGroup.locator('[medButton]');
    await expect(groupButtons).toHaveCount(3);
    const metrics = await groupButtons.evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          topLeft: style.borderTopLeftRadius,
          topRight: style.borderTopRightRadius,
          bottomLeft: style.borderBottomLeftRadius,
          bottomRight: style.borderBottomRightRadius,
          marginLeft: style.marginLeft,
          top: Math.round(rect.top),
        };
      }),
    );
    expect(metrics[0].topLeft).not.toBe('0px');
    expect(metrics[0].bottomLeft).not.toBe('0px');
    expect(metrics[0].topRight).toBe('0px');
    expect(metrics[0].bottomRight).toBe('0px');
    expect(metrics[0].marginLeft).toBe('0px');

    expect(metrics[1].topLeft).toBe('0px');
    expect(metrics[1].topRight).toBe('0px');
    expect(metrics[1].bottomLeft).toBe('0px');
    expect(metrics[1].bottomRight).toBe('0px');
    expect(metrics[1].marginLeft).toBe('-1px');

    expect(metrics[2].topLeft).toBe('0px');
    expect(metrics[2].bottomLeft).toBe('0px');
    expect(metrics[2].topRight).not.toBe('0px');
    expect(metrics[2].bottomRight).not.toBe('0px');
    expect(metrics[2].marginLeft).toBe('-1px');

    expect(metrics[1].top).toBe(metrics[0].top);
    expect(metrics[2].top).toBe(metrics[0].top);

    // Keyboard Tab activates :focus-visible and elevates z-index to 10 with visible focus ring
    await groupButtons.nth(0).focus();
    await page.keyboard.press('Tab');
    const focusedStyles = await groupButtons.nth(1).evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        zIndex: style.zIndex,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    expect(focusedStyles.zIndex).toBe('10');
    expect(focusedStyles.outlineWidth !== '0px' || focusedStyles.boxShadow !== 'none').toBe(true);

    // Hovering a grouped button also elevates z-index to 10
    await groupButtons.nth(2).hover();
    const hoveredZIndex = await groupButtons.nth(2).evaluate((el) => getComputedStyle(el).zIndex);
    expect(hoveredZIndex).toBe('10');

    expect(errors).toEqual([]);
  });
});
