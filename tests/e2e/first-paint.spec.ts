import { expect, test } from '@playwright/test';
import { DEFAULT_THEME } from '@lib/themes';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

test.use({ javaScriptEnabled: false });

test.describe('first paint, before any script runs', () => {
  test('the scroll-lit windows start switched off', async ({ page }) => {
    await page.goto('/');

    const litBeforeScroll = await page.evaluate(
      () =>
        [...document.querySelectorAll('.skyline__awake .skyline__window')].filter(
          (window) => getComputedStyle(window).opacity !== '0',
        ).length,
    );

    expect(litBeforeScroll).toBe(0);
  });

  test('the theme switch already highlights the active theme', async ({ page }) => {
    await page.goto('/');

    const highlighted = await page.evaluate(
      (transparent) =>
        [...document.querySelectorAll<HTMLElement>('[data-theme-option]')]
          .filter((option) => getComputedStyle(option).backgroundColor !== transparent)
          .map((option) => option.dataset.themeOption),
      TRANSPARENT,
    );

    expect(highlighted).toEqual([DEFAULT_THEME]);
  });
});
