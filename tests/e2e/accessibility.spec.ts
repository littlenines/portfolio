import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const BLOCKING_IMPACTS = new Set(['serious', 'critical']);
const PAGES = ['/', '/does-not-exist'];

test.use({ reducedMotion: 'reduce' });

for (const path of PAGES) {
  test(`${path} has no serious accessibility problems`, async ({ page }) => {
    await page.goto(path);

    const { violations } = await new AxeBuilder({ page }).analyze();

    const blocking = violations
      .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''))
      .map(({ id, help, nodes }) => `${id}: ${help} (${nodes.map((node) => node.target.join(' ')).join(', ')})`);

    expect(blocking).toEqual([]);
  });
}
