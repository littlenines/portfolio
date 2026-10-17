// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

const PRINTABLE_ASCII = Array.from({ length: 0x7f - 0x20 }, (_, index) => String.fromCodePoint(0x20 + index));
// Kanji shown in the display font by the evangelion transition veil
const DISPLAY_KANJI = ['警', '告', '撤', '収'];

// Production URL, used for absolute links such as og:image. Update it if a custom domain is added.
const SITE_URL = 'https://nemanja-galbinovic.vercel.app';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
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
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
    },
    {
      // Only used for evangelion headings and the veil kanji, so it ships just those glyphs
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
          // Lets partials write `@use 'abstracts'` instead of `@use '../abstracts'`
          loadPaths: ['src/styles'],
        },
      },
    },
  },
});
