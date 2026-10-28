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

`label` is one of `demo`, `download`, `github` or `npm`; it controls the screen-reader text ("… on GitHub (opens in new tab)").
That text must contain the visible label, or the accessibility test fails.
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

- Live at https://nemanja-galbinovic.vercel.app. That URL is `SITE_URL` in `astro.config.mjs`, which makes
  the share image (`og:image`) an absolute link. Change it if you add a custom domain. Vercel's
  `VERCEL_PROJECT_PRODUCTION_URL` isn't used because for `.vercel.app` names it gives the auto-generated
  address, not the one you chose.
- pnpm is pinned through `packageManager` in `package.json`. Vercel only honours it with the environment
  variable `ENABLE_EXPERIMENTAL_COREPACK=1`.
- Node: `engines.node` in `package.json` is pinned to `24.x`, so Vercel builds with Node 24 and only moves to
  a new major when you change it (an open range like `>=22` makes Vercel warn and upgrade on its own). CI runs
  on Node 24 to match. Local development on a newer Node is fine; pnpm doesn't enforce `engines`. When
  Vercel offers Node 26 for builds, bump `engines.node` and the CI `node-version` together. The pinned major
  must still meet `astro`'s minimum Node version.
- Speed Insights: `<SpeedInsights />` from `@vercel/speed-insights` sits at the end of `<body>` in
  `Layout.astro`. It reports real visitors' Web Vitals to the Vercel dashboard. Its collector script is served
  by Vercel at `/_vercel/speed-insights/script.js`, so locally it isn't found and nothing is reported.
- `pnpm-workspace.yaml` tells pnpm to skip `@parcel/watcher`'s build script (only needed by the Sass CLI's
  watch mode). Without it, pnpm 12 fails the install.
