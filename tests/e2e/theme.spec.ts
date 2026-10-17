import { expect, test } from '@playwright/test';

const KNOCKS_TO_UNLOCK = 3;

// Reduced motion skips the loader and the veil sequence, so theme changes apply at once
test.use({ reducedMotion: 'reduce' });

test.describe('themes', () => {
  test('the switch changes the theme and remembers it', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-theme-option="netspace"]').click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'netspace');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'netspace');
  });

  test('the secret theme stays hidden until it is unlocked', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-theme-option="evangelion"]')).toBeHidden();
  });

  test('three knocks on the name unlock evangelion', async ({ page }) => {
    await page.goto('/');

    const name = page.locator('[data-easter-egg]');

    for (let knock = 1; knock < KNOCKS_TO_UNLOCK; knock++) await name.click();

    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'evangelion');

    await name.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'evangelion');
    await expect(page.locator('[data-theme-option="evangelion"]')).toBeVisible();
  });
});
