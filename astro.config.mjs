// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { modulePreload } from './integrations/module-preload.ts';

const PRINTABLE_ASCII = Array.from({ length: 0x7f - 0x20 }, (_, index) => String.fromCodePoint(0x20 + index));
const DISPLAY_KANJI = ['警', '告', '撤', '収'];

const SITE_URL = 'https://nemanja-galbinovic.vercel.app';

export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap(), modulePreload()],
  build: {
    inlineStylesheets: 'always',
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Zen Kaku Gothic New',
      cssVariable: '--font-body',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
    },
    {
      provider: fontProviders.google(),
      name: 'Shippori Mincho B1',
      cssVariable: '--font-display',
      weights: [700, 800],
      styles: ['normal'],
      fallbacks: ['serif'],
      options: { experimental: { glyphs: [...PRINTABLE_ASCII, ...DISPLAY_KANJI] } },
    },
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: ['src/styles'],
        },
      },
    },
  },
});
