/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Astro's Vite config, so tests resolve the same @lib/@scripts aliases as the site
export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
