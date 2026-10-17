# Architecture

## Folders

```text
src/
├── data/            Content only (site details, projects, stack)
├── lib/             Pure, DOM-free logic used at build time and in the browser
├── layouts/         Layout.astro: <head>, fonts, meta tags, theme boot script
├── components/
│   ├── layout/      Header, Footer, Section
│   ├── hero/        Hero, Scene, Skyline
│   ├── sections/    Projects, ProjectItem, Stack, Contact
│   ├── ui/          Button, Eyebrow, SectionLabel, ThemeSwitch, ThemedText, SkipLink
│   └── effects/     Loader, ThemeVeil, WarnBar, BackToTop, Toast, Reticle, NightField
├── scripts/         Browser behaviour, one module per feature
├── styles/          SCSS in the 7-1 pattern
└── pages/           index.astro, 404.astro, hex-field.svg.ts
```

## Code style

Run `pnpm format` before committing; `pnpm lint` checks without changing anything.

- **Prettier** (`.prettierrc.json`) handles layout for TypeScript, Astro, SCSS and Markdown: 120-character
  lines, single quotes, trailing commas.
- **ESLint** (`eslint.config.js`) only adds the blank lines Prettier never inserts:
  - around functions, classes and blocks (`if`, `for`, `while`, `switch`, `try`);
  - around multi-line expressions, such as a `gsap.to({ … })` call spread over several lines;
  - before and after each group of `const`/`let` (consecutive declarations stay together);
  - before `return`;
  - between class members.
- `src/components/ui/ThemedText.astro` is excluded from Prettier. Its two spans must touch, and Prettier
  would put whitespace between them.

## Import aliases

Imports never climb with `../`. `tsconfig.json` defines one alias per top-level folder, and Astro passes
them to Vite, so they work in frontmatter, `<script>` tags and `.ts` files alike:

| Alias           | Folder             |
| :-------------- | :----------------- |
| `@components/*` | `src/components/*` |
| `@data/*`       | `src/data/*`       |
| `@layouts/*`    | `src/layouts/*`    |
| `@lib/*`        | `src/lib/*`        |
| `@scripts/*`    | `src/scripts/*`    |
| `@styles/*`     | `src/styles/*`     |

```ts
import { site } from '@data/site';
import { initBackToTop } from '@scripts/effects/back-to-top';
```

Files in the same folder still import each other directly (`./state`, `./Scene.astro`). SCSS partials use
`@use 'abstracts'`, resolved through the Sass load path set in `astro.config.mjs`.

## Separation of concerns

Each feature is split by responsibility:

| Concern    | Lives in          | Example                    |
| :--------- | :---------------- | :------------------------- |
| Content    | `src/data/`       | `projects.ts`              |
| Markup     | `src/components/` | `ProjectItem.astro`        |
| Styles     | `src/styles/`     | `components/_project.scss` |
| Behaviour  | `src/scripts/`    | `effects/back-to-top.ts`   |
| Pure logic | `src/lib/`        | `skyline.ts`               |

A component that needs behaviour ends with a short `<script>` that finds its element and calls an `init…`
function from `src/scripts/`. Astro bundles each of these once per page, even if the component is used twice.

Components do not carry their own `<style>` blocks. All styles are global SCSS with BEM class names, so
everything can be found from the table of contents in `src/styles/main.scss`.

## Reused pieces

The home page and the 404 page share `Layout`, `Header` (the 404 uses `minimal`), `Scene`/`Skyline`
(the 404 uses `variant="lost"`), `Eyebrow` and `Button`.

`Section` wraps every home page section with its numbered label (`01 // 作品 · projects`) and the scroll
reveal script.

## Build time vs. browser

**Built once, shipped as static files:**

- **Skyline.** `lib/skyline.ts` is a seeded generator, so the city is the same on every build. `Skyline.astro`
  renders it straight into the HTML as SVG, which means no script and nothing pops in on load.
  Which windows only light up after dark is picked with `Math.random`, not the seeded generator.
  Switching that to the seeded generator would shift every value after it and reshape the city.
- **Hex field.** `pages/hex-field.svg.ts` is a static endpoint that writes `/hex-field.svg` from
  `lib/hex-field.ts`. The fade is baked into each hexagon's stroke opacity instead of using a CSS mask, which
  would force an offscreen repaint every frame. The browser only downloads it once the evangelion theme is on.

- **Fonts.** Astro's Fonts API (`fonts` in `astro.config.mjs`) downloads the fonts at build time and serves
  them from the site itself; `<Font>` in `Layout.astro` inlines the `@font-face` rules and preloads the
  first-screen weights. Nothing is requested from Google at runtime.
  - Zen Kaku Gothic New (`--font-body`) and JetBrains Mono (`--font-mono`) come from Fontsource with the
    `latin` subset only. Google serves these Japanese families as about 120 unnamed slices per weight,
    which Astro can't filter.
  - Shippori Mincho B1 (`--font-display`) is only used for evangelion headings and the veil, so it ships
    just printable ASCII plus 警告撤収 (`glyphs` option). If you add other characters to those headings,
    add them to that list or they will fall back to the system serif.
  - Japanese text in mono contexts (section labels, eyebrow, footer) uses the system's Japanese font, as before.
- **CSS** is inlined into each page (`build.inlineStylesheets: 'always'`), so no stylesheet blocks rendering.

**In the browser:** themes, the loader, GSAP motion, the footer wave, the night sky, the reticle,
back to top and copy-to-clipboard. See [Scripts](scripts.md).

## How scripts talk to each other

Component scripts are separate bundles, so they share state through the DOM, not module variables:

- **Theme:** `<html data-theme="…">` is the single source of truth, and a `theme:change` event fires on
  `document` after every change. CSS reads the attribute; scripts call `currentTheme()` / `onThemeChange()`.
- **Boot:** the loader sets `<html data-booted>` and fires `app:booted` when it lifts. The hero intro waits
  for it via `whenBooted()`. If the page has no loader, the callback runs straight away.

## Page order and overlays

`index.astro` renders the loader first, then `.page` (header, hero, sections, footer), then the fixed overlays:
back to top, toast, theme veil, reticle and night field. Keep the overlays as direct children of `<body>`.
Inside the header (which has a `z-index`) or anything with a transform, their own `z-index` would only
count within that element, and the veil or toast could end up under other layers.
