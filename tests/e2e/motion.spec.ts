import { expect, test, type Page } from '@playwright/test';

const INTERACTIVE = 'a, button, .project';
const WHEEL_STEP_PX = 200;
const MAX_WHEEL_STEPS = 30;

const scrollTo = (page: Page, top: number) =>
  page.evaluate((target) => window.scrollTo({ top: target, behavior: 'instant' }), top);

const readPackets = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-stream-packet]'), (packet) => getComputedStyle(packet).transform).join(
      '|',
    ),
  );

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/is-loading/);
});

test('stream beams resume when the hero returns after its edge stopped exactly at the top of the screen', async ({
  page,
}) => {
  await page.locator('[data-theme-option="netspace"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'netspace');

  const heroBottom = await page.evaluate(
    () => document.querySelector('.hero')!.getBoundingClientRect().bottom + window.scrollY,
  );

  await scrollTo(page, heroBottom + WHEEL_STEP_PX);
  await page.waitForTimeout(500);
  await scrollTo(page, heroBottom);
  await page.waitForTimeout(500);
  await scrollTo(page, 0);

  const before = await readPackets(page);

  await expect.poll(() => readPackets(page)).not.toBe(before);
});

test('the reticle drops its hover ring when the wheel scrolls the link away from under the mouse', async ({ page }) => {
  const project = page.locator('.project').first();

  await project.scrollIntoViewIfNeeded();

  const box = (await project.boundingBox())!;
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await page.mouse.move(point.x, point.y);
  await expect(page.locator('.reticle')).toHaveClass(/is-hot/);

  const isOverInteractive = () =>
    page.evaluate(({ x, y, selector }) => Boolean(document.elementFromPoint(x, y)?.closest(selector)), {
      ...point,
      selector: INTERACTIVE,
    });

  for (let step = 0; step < MAX_WHEEL_STEPS && (await isOverInteractive()); step++) {
    await page.mouse.wheel(0, WHEEL_STEP_PX);
    await page.waitForTimeout(250);
  }

  expect(await isOverInteractive()).toBe(false);
  await expect(page.locator('.reticle')).not.toHaveClass(/is-hot/);
});
