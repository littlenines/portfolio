import { devices, expect, test } from '@playwright/test';

// Real Chrome: only it smooths the scroll restore on Back, which is the bug this guards against
test.use({ ...devices['Pixel 7'], channel: 'chrome' });

// Allowed drift after the browser restores the scroll position
const RESTORE_TOLERANCE_PX = 2;

// Stay on the page a moment before scrolling, like a visitor; leaving straight after boot hides the bug
const READING_PAUSE_MS = 1500;

const isLoading = () => document.documentElement.classList.contains('is-loading');

test.describe('navigation', () => {
  test('a first visit plays the boot loader', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(await page.evaluate(isLoading)).toBe(true);
  });

  test('coming back from a link skips the loader and returns to the same spot', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-booted'));
    await page.waitForTimeout(READING_PAUSE_MS);
    await page.locator('.project-list').evaluate((list) => list.scrollIntoView({ behavior: 'instant' }));

    const scrolledTo = await page.evaluate(() => window.scrollY);

    // Same-tab navigation, like an in-app browser that ignores target="_blank"
    await page.evaluate(() => (window.location.href = '/does-not-exist'));
    await page.waitForURL('**/does-not-exist');
    await page.goBack();
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-booted'));

    expect(await page.evaluate(isLoading)).toBe(false);
    await expect(page.locator('[data-loader]')).toHaveCount(0);

    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThanOrEqual(scrolledTo - RESTORE_TOLERANCE_PX);
  });

  test('the 404 button goes back to the surface theme', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('theme', 'netspace'));
    await page.goto('/does-not-exist');
    await page.getByRole('link', { name: 'Back to the surface' }).click();
    await page.waitForURL((url) => url.pathname === '/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'surface');
  });
});
