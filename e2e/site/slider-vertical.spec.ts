import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/slider';

test.describe('Slider vertical orientation (SLD-005.S3)', () => {
  test('SLD-005.S3: the Vertical example renders a tall track and dragging its thumb upward increases the value', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PAGE);

    const demo = page.locator('app-slider-vertical-demo');
    await demo.scrollIntoViewIfNeeded();
    const thumb = demo.getByRole('slider').first();
    await expect(thumb).toHaveAttribute('aria-orientation', 'vertical');

    const trackBox = await thumb.evaluate((el) => {
      const rect = (el.parentElement as HTMLElement).getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(trackBox.height).toBeGreaterThan(trackBox.width);

    const before = Number(await thumb.getAttribute('aria-valuenow'));
    const box = (await thumb.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y - 60, { steps: 6 });
    await page.mouse.up();

    await expect.poll(async () => Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(before);
  });
});
