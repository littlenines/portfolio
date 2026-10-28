import { describe, expect, it } from 'vitest';
import { addModulePreloads, collectModulePreloads, findModuleScripts } from '../../integrations/module-preload';

const IMPORT_GRAPH = new Map([
  ['_astro/Hero.js', ['_astro/dom.js', '_astro/gsap.js']],
  ['_astro/Section.js', ['_astro/gsap.js']],
  ['_astro/gsap.js', ['_astro/media.js']],
  ['_astro/dom.js', []],
  ['_astro/media.js', []],
]);

describe('findModuleScripts', () => {
  it('finds the site’s own module scripts and skips external ones', () => {
    const html = [
      '<script type="module" src="/_astro/Hero.js"></script>',
      '<script type="module" src="//cdn.example.com/x.js"></script>',
      '<script type="module" src="https://cdn.example.com/y.js"></script>',
      '<script src="/legacy.js"></script>',
    ].join('');

    expect(findModuleScripts(html)).toEqual(['/_astro/Hero.js']);
  });
});

describe('collectModulePreloads', () => {
  it('follows imports through every level, each module once, without the entries themselves', () => {
    expect(collectModulePreloads(['_astro/Hero.js', '_astro/Section.js'], IMPORT_GRAPH)).toEqual([
      '_astro/dom.js',
      '_astro/gsap.js',
      '_astro/media.js',
    ]);
  });

  it('ignores scripts the build did not produce', () => {
    expect(collectModulePreloads(['_astro/unknown.js'], IMPORT_GRAPH)).toEqual([]);
  });
});

describe('addModulePreloads', () => {
  it('adds the links at the end of the head', () => {
    expect(addModulePreloads('<head><title>x</title></head><body></body>', ['/_astro/gsap.js'])).toBe(
      '<head><title>x</title><link rel="modulepreload" href="/_astro/gsap.js"></head><body></body>',
    );
  });

  it('writes URLs with a dollar sign as they are', () => {
    expect(addModulePreloads('<head></head>', ["/_astro/a$&b$'.js"])).toBe(
      `<head><link rel="modulepreload" href="/_astro/a$&b$'.js"></head>`,
    );
  });
});
