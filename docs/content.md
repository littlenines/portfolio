# Content

All editable content lives in `src/data/`. Components read from it, so you rarely need to touch markup.

## Site details: `src/data/site.ts`

| Field                             | Used for                                                        |
| :-------------------------------- | :-------------------------------------------------------------- |
| `name`                            | Header, footer, page titles                                     |
| `title`, `description`, `ogTitle` | `<title>`, meta description, social share cards                 |
| `themeColor`                      | Initial phone browser bar colour (scripts take over after load) |
| `email`                           | Contact link, `mailto:` and the copy button                     |
| `cv`                              | Path of the CV download (see below)                             |
| `socials`                         | Buttons under the email. Each opens in a new tab                |

## Projects: `src/data/projects.ts`

Each project is one object:

```ts
{
  name: 'quill-tablekit',
  description: 'Full table support for Quill 2: …',
  tech: ['TypeScript', 'React'],
  links: [{ label: 'demo', href: '…' }, { label: 'github', href: '…' }],
  status: 'in progress', // shown instead of links when `links` is empty
}
```

`label` is one of `demo`, `github` or `npm`; it controls the screen-reader text ("… on GitHub (opens in new tab)").
The `quillPlugin(name, demoUrl)` helper builds the usual demo, GitHub and npm links for a package.

In the evangelion theme projects are numbered automatically as "EPISODE 01", "EPISODE 02", and so on.

## Stack: `src/data/stack.ts`

A list of `{ area, tools }` rows, rendered as a two-column list.

## Copy that lives in components

Some copy has inline markup (Japanese spans, `<em>`) and stays in the component:

- Hero eyebrow, title, intro and location: `src/components/hero/Hero.astro`
- Contact heading: `src/components/sections/Contact.astro`
- Footer note and back-to-top label: `Footer.astro`, `BackToTop.astro`
- 404 page: `src/pages/404.astro`

Lines that change in the evangelion theme are wrapped in `<ThemedText>`, with the alternate version in a
`slot="evangelion"` fragment. See [Theming](theming.md#themed-copy).

## CV download

The download link is commented out in `Contact.astro` until a CV exists. To turn it on:

1. Put the PDF in `public/` as `cv.pdf` (or change `cv` in `site.ts`).
2. Uncomment the `contact__cv` link in `Contact.astro`. Its styles are already in place.

## Deployment (Vercel)

- `site` in `astro.config.mjs` comes from Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, so the share image
  (`og:image`) is an absolute URL on every Vercel build: your custom domain once you add one, otherwise
  `*.vercel.app`. Local builds fall back to a relative path.
- pnpm is pinned through `packageManager` in `package.json`. Vercel only honours it with the environment
  variable `ENABLE_EXPERIMENTAL_COREPACK=1`.
- `pnpm-workspace.yaml` tells pnpm to skip `@parcel/watcher`'s build script (only needed by the Sass CLI's
  watch mode). Without it, pnpm 12 fails the install.
