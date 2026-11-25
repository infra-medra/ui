import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/tabs';

const EXPECTED_EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-dynamic', label: 'Dynamic' },
  { id: 'example-controlled', label: 'Controlled' },
  { id: 'example-scrollable', label: 'Scrollable' },
  { id: 'example-lazy', label: 'Lazy' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-template', label: 'Template' },
] as const;

test.describe('Tabs documentation page (TBD-001.S1, TBD-002.S1, TBD-003.S1)', () => {
  test('TBD-001.S1, TBD-002.S1, TBD-003.S1: renders On this page links, prose, live demos, code blocks, and interactive tabs for all 7 examples', async ({
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
      await expect(demoWrapper.locator('med-tabs').first()).toBeVisible();

      const codeBlocks = demoWrapper.locator('app-code-block pre code');
      const codeCount = await codeBlocks.count();
      expect(codeCount).toBeGreaterThan(0);
      for (let j = 0; j < codeCount; j++) {
        const codeText = codeBlocks.nth(j);
        await expect(codeText).toBeVisible();
        expect(await codeText.evaluate((el) => (el.textContent ?? '').trim().length)).toBeGreaterThan(0);
      }
    }

    // Basic: clicking second tab updates aria-selected="true" & visible tabpanel
    const basicWrapper = page.locator('#example-basic').locator('xpath=following-sibling::div[1]');
    await basicWrapper.scrollIntoViewIfNeeded();
    const basicTabs = basicWrapper.getByRole('tab');
    const basicPanels = basicWrapper.locator('med-tab[role="tabpanel"]');
    await expect(basicTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(basicTabs.nth(1)).toHaveAttribute('aria-selected', 'false');
    await expect(basicPanels.nth(0)).toBeVisible();
    await expect(basicPanels.nth(1)).toBeHidden();

    await basicTabs.nth(1).click();
    await expect(basicTabs.nth(0)).toHaveAttribute('aria-selected', 'false');
    await expect(basicTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(basicPanels.nth(0)).toBeHidden();
    await expect(basicPanels.nth(1)).toBeVisible();

    // Controlled: clicking external button switches activeIndex and updates visible tabpanel + output
    const controlledWrapper = page.locator('#example-controlled').locator('xpath=following-sibling::div[1]');
    await controlledWrapper.scrollIntoViewIfNeeded();
    const controlledTabs = controlledWrapper.getByRole('tab');
    const controlledPanels = controlledWrapper.locator('med-tab[role="tabpanel"]');
    const controlledStatus = controlledWrapper.locator('app-tabs-controlled-demo > p');
    const externalButtons = controlledWrapper.locator('app-tabs-controlled-demo button:not([role="tab"])');
    await expect(controlledStatus).toContainText('Active index: 0');
    await expect(controlledTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(controlledPanels.nth(0)).toBeVisible();

    await externalButtons.nth(1).click();
    await expect(controlledStatus).toContainText('Active index: 1');
    await expect(controlledTabs.nth(0)).toHaveAttribute('aria-selected', 'false');
    await expect(controlledTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(controlledPanels.nth(0)).toBeHidden();
    await expect(controlledPanels.nth(1)).toBeVisible();

    // Lazy: mounts lazy tab panel only on activation
    const lazyWrapper = page.locator('#example-lazy').locator('xpath=following-sibling::div[1]');
    await lazyWrapper.scrollIntoViewIfNeeded();
    const lazyTabs = lazyWrapper.getByRole('tab');
    const lazyPanels = lazyWrapper.locator('med-tab[role="tabpanel"]');
    await expect(lazyTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(lazyPanels.nth(1)).toBeHidden();
    await expect(lazyPanels.nth(1).locator('p')).toHaveCount(0);

    await lazyTabs.nth(1).click();
    await expect(lazyTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(lazyPanels.nth(1)).toBeVisible();
    await expect(lazyPanels.nth(1).locator('p')).toHaveCount(1);
    await expect(lazyPanels.nth(1).locator('p')).toContainText('Wrapped in <ng-template>');

    // Disabled: disabled tab has aria-disabled="true" and clicking it does not switch active tab
    const disabledWrapper = page.locator('#example-disabled').locator('xpath=following-sibling::div[1]');
    await disabledWrapper.scrollIntoViewIfNeeded();
    const disabledDemoTabs = disabledWrapper.getByRole('tab');
    const disabledDemoPanels = disabledWrapper.locator('med-tab[role="tabpanel"]');
    const disabledTab = disabledWrapper.locator('[role="tab"][aria-disabled="true"]').first();
    await expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
    await expect(disabledTab).toHaveAttribute('aria-selected', 'false');
    await expect(disabledDemoTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(disabledDemoPanels.nth(0)).toBeVisible();

    await disabledTab.click({ force: true });
    await expect(disabledDemoTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(disabledDemoPanels.nth(0)).toBeVisible();
    await expect(disabledTab).toHaveAttribute('aria-selected', 'false');

    // Template (TBD-002.S1, TBD-003.S1): custom #header markup renders inside role="tab" and switching tabs updates visible tabpanel
    const templateWrapper = page.locator('#example-template').locator('xpath=following-sibling::div[1]');
    await templateWrapper.scrollIntoViewIfNeeded();
    const templateTabs = templateWrapper.getByRole('tab');
    const templatePanels = templateWrapper.locator('med-tab[role="tabpanel"]');
    await expect(templateTabs).toHaveCount(3);
    await expect(templateTabs.nth(0)).toContainText('Profile');
    await expect(templateTabs.nth(0).locator('med-icon svg')).toHaveCount(1);
    await expect(templateTabs.nth(1)).toContainText('Messages');
    await expect(templateTabs.nth(1).locator('med-icon svg')).toHaveCount(1);
    await expect(templateTabs.nth(1).locator('med-badge')).toContainText('3');
    await expect(templateTabs.nth(2)).toContainText('Alerts');
    await expect(templateTabs.nth(2).locator('med-icon svg')).toHaveCount(1);

    await expect(templateTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(templatePanels.nth(0)).toBeVisible();
    await expect(templatePanels.nth(1)).toBeHidden();
    await expect(templatePanels.nth(2)).toBeHidden();
    await expect(templatePanels.nth(2).locator('p')).toHaveCount(0);

    await templateTabs.nth(1).click();
    await expect(templateTabs.nth(0)).toHaveAttribute('aria-selected', 'false');
    await expect(templateTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(templatePanels.nth(0)).toBeHidden();
    await expect(templatePanels.nth(1)).toBeVisible();

    await templateTabs.nth(2).click();
    await expect(templateTabs.nth(1)).toHaveAttribute('aria-selected', 'false');
    await expect(templateTabs.nth(2)).toHaveAttribute('aria-selected', 'true');
    await expect(templatePanels.nth(1)).toBeHidden();
    await expect(templatePanels.nth(2)).toBeVisible();
    await expect(templatePanels.nth(2).locator('p')).toHaveCount(1);

    // Keyboard navigation (ArrowLeft / ArrowRight) on custom-header tabs
    await templateTabs.nth(2).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(templateTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(templatePanels.nth(1)).toBeVisible();
    await expect(templatePanels.nth(2)).toBeHidden();

    await page.keyboard.press('ArrowRight');
    await expect(templateTabs.nth(2)).toHaveAttribute('aria-selected', 'true');
    await expect(templatePanels.nth(2)).toBeVisible();
    await expect(templatePanels.nth(1)).toBeHidden();

    expect(errors).toEqual([]);
  });
});
