import type { APIRoute } from 'astro';

const SITEMAP_PATH = '/sitemap-index.xml';

export const AI_TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Amazonbot',
  'CCBot',
  'Bytespider',
  'cohere-training-data-crawler',
  'Diffbot',
  'AI2Bot',
  'PanguBot',
  'Omgilibot',
  'Timpibot',
];

export const GET: APIRoute = ({ site }) => {
  const everyone = ['User-agent: *', 'Allow: /'];
  const aiTraining = [...AI_TRAINING_CRAWLERS.map((crawler) => `User-agent: ${crawler}`), 'Disallow: /'];
  const groups = [everyone.join('\n'), aiTraining.join('\n')];

  if (site) groups.push(`Sitemap: ${new URL(SITEMAP_PATH, site).href}`);

  return new Response(`${groups.join('\n\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
