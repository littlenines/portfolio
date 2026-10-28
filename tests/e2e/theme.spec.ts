import { expect, test, type Page } from '@playwright/test';

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

  test.describe('stream beams', () => {
    // The beams need motion, so this group opts back into it
    test.use({ reducedMotion: 'no-preference' });

    const packetPositions = (page: Page) =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-stream-packet]')]
          .map((packet) => packet.getAttribute('transform'))
          .join('|'),
      );

    test('the packets climb in netspace', async ({ page }) => {
      await page.goto('/');
      await page.evaluate((theme) => localStorage.setItem('theme', theme), 'netspace');
      await page.goto('/');
      await page.waitForFunction(() => document.documentElement.hasAttribute('data-booted'));

      const before = await packetPositions(page);

      await expect.poll(() => packetPositions(page)).not.toBe(before);
    });

    test('the packets are only set up once netspace is chosen, and reduced motion undoes them', async ({ page }) => {
      const styledPackets = () =>
        page
          .locator('[data-stream-packet]')
          .evaluateAll((packets) => packets.filter((packet) => packet.getAttribute('style')).length);

      await page.goto('/', { waitUntil: 'load' });

      await page.evaluate(async () => {
        const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

        await nextTask();
        await nextTask();
      });

      expect(await styledPackets()).toBe(0);

      await page.locator('[data-theme-option="netspace"]').click();

      await expect.poll(styledPackets).toBeGreaterThan(0);

      await page.emulateMedia({ reducedMotion: 'reduce' });

      await expect.poll(styledPackets).toBe(0);
    });
  });
});
