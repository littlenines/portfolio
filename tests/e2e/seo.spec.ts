import { expect, test } from '@playwright/test';

const SITE_URL = 'https://nemanja-galbinovic.vercel.app/';

test.use({ reducedMotion: 'reduce' });

test('the home page has its title, canonical URL and person details', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Nemanja Galbinovic • Portfolio');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);

  const person = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}') as {
    name?: string;
  };

  expect(person.name).toBe('Nemanja Galbinovic');
});

test('the 404 page is kept out of search results', async ({ page }) => {
  await page.goto('/404');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
});

test('robots.txt points crawlers to the sitemap and turns away AI training crawlers', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();

  expect(robots).toContain(`Sitemap: ${SITE_URL}sitemap-index.xml`);
  expect(robots).toMatch(/User-agent: GPTBot\n(?:User-agent: .+\n)*Disallow: \//);
  expect(robots).not.toContain('OAI-SearchBot');
});
