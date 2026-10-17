import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('back to top appears after scrolling and returns to the top', async ({ page }) => {
  await page.goto('/');

  const button = page.locator('[data-back-to-top]');

  await expect(button).not.toHaveClass(/is-on/);

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));

  await expect(button).toHaveClass(/is-on/);

  await button.click();

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
