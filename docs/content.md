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

## Before going live

Set `site` in `astro.config.mjs` (for example `site: 'https://example.com'`). Without it the share image
(`og:image`) is a relative path, which most social networks ignore.
