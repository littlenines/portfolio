import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, ViteUserConfig } from 'astro';

type ImportGraph = ReadonlyMap<string, readonly string[]>;
type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number];

const MODULE_SCRIPT = /<script type="module" src="(\/(?!\/)[^"]+)"/g;
const HEAD_END = '</head>';
const ANY_MODULE_SCRIPT = 'type="module"';

export const findModuleScripts = (html: string): string[] =>
  Array.from(html.matchAll(MODULE_SCRIPT), ([, source]) => source);

export function collectModulePreloads(entries: string[], importGraph: ImportGraph): string[] {
  const reached = new Set(entries);

  for (const file of reached) {
    for (const dependency of importGraph.get(file) ?? []) reached.add(dependency);
  }

  return [...reached].filter((file) => !entries.includes(file));
}

export const addModulePreloads = (html: string, urls: string[]): string =>
  html.replace(HEAD_END, () => `${urls.map((url) => `<link rel="modulepreload" href="${url}">`).join('')}${HEAD_END}`);

export function modulePreload(): AstroIntegration {
  const importGraph = new Map<string, string[]>();
  let base = '/';

  const recordImportGraph: VitePlugin = {
    name: 'module-preload-graph',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === 'chunk') importGraph.set(output.fileName, output.imports);
      }
    },
  };

  return {
    name: 'module-preload',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({ vite: { plugins: [recordImportGraph] } });
      },
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = (await readdir(root, { recursive: true })).filter((file) => file.endsWith('.html'));

        for (const page of pages) {
          const file = path.join(root, page);
          const html = await readFile(file, 'utf8');

          const entries = findModuleScripts(html)
            .filter((source) => source.startsWith(base))
            .map((source) => source.slice(base.length));

          if (html.includes(ANY_MODULE_SCRIPT) && !entries.some((entry) => importGraph.has(entry))) {
            logger.warn(`${page}: none of its module scripts were found in the build, so nothing is preloaded`);
          }

          const preloads = collectModulePreloads(entries, importGraph);

          if (preloads.length === 0) continue;

          await writeFile(
            file,
            addModulePreloads(
              html,
              preloads.map((fileName) => `${base}${fileName}`),
            ),
          );

          logger.info(`${page}: preloading ${preloads.length} modules`);
        }
      },
    },
  };
}
