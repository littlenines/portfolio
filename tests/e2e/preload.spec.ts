import { expect, test } from '@playwright/test';

test('the home page preloads GSAP before its scripts ask for it', async ({ page, request }) => {
  await page.goto('/');

  const gsapPreload = page.locator('head link[rel="modulepreload"][href*="/gsap."]');

  await expect(gsapPreload).toHaveCount(1);

  const href = await gsapPreload.getAttribute('href');

  expect((await request.get(href ?? '')).ok()).toBe(true);
});
