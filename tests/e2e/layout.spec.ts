import { expect, test } from '@playwright/test';

const VIEWPORT_WIDTHS = [360, 390, 486, 768, 1280, 1440];
const VIEWPORT_HEIGHT = 900;

test.describe('layout', () => {
  for (const width of VIEWPORT_WIDTHS) {
    test(`has no sideways scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/');

      // clientWidth can exceed scrollWidth here because the stylesheet reserves a scrollbar gutter
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('loads without script errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('serves the 404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toBeVisible();
  });
});
