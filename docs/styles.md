# Styles

SCSS in the 7-1 pattern, mobile first, using the modern Sass module system (`@use`/`@forward`, `sass:map`,
`sass:math`, `sass:color`, `sass:list`). There is no `vendors/` folder because no third-party CSS is used; add
one if that changes. The single entry point is `src/styles/main.scss`, imported once in
`Layout.astro`.

## Table of contents

The same table is at the top of `main.scss`. Folders are listed in cascade order.

| #   | Folder     | Partial          | Owns                                                                                                                                                                     |
| :-- | :--------- | :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | abstracts  | `_colors`        | Palette, `alpha()`, `rgb-triplet()`                                                                                                                                      |
|     |            | `_variables`     | Breakpoints, spacing, z-index, fonts, theme selectors                                                                                                                    |
|     |            | `_functions`     | `space()`, `z()`, `bp()`, `chamfer-shape()`                                                                                                                              |
|     |            | `_mixins`        | `mq()`, `motion-ok`, `reduced-motion`, `touch`, `night`, `evangelion`, `cover`, `gutter-inline`, `mask`, `fade-x`, `chamfer`, `chamfer-plate`, `corner-brackets`, `pill` |
| 1   | base       | `_reset`         | Box-sizing, margins, list reset                                                                                                                                          |
|     |            | `_document`      | `html`, `body`, scrollbar, `::selection`, `--gutter`                                                                                                                     |
|     |            | `_typography`    | `.mono`                                                                                                                                                                  |
|     |            | `_accessibility` | Focus rings, reduced-motion overrides                                                                                                                                    |
| 2   | layout     | `_container`     | `.container`, `.page`                                                                                                                                                    |
|     |            | `_header`        | `.site-header`                                                                                                                                                           |
|     |            | `_hero`          | `.hero`                                                                                                                                                                  |
|     |            | `_section`       | `.section`                                                                                                                                                               |
|     |            | `_footer`        | `.site-footer`                                                                                                                                                           |
| 3   | components | `_scene`         | `.scene` (sky, stars, sun, city light, ground strip)                                                                                                                     |
|     |            | `_skyline`       | `.skyline` (windows, beacons, neon, haze)                                                                                                                                |
|     |            | `_eyebrow`       | `.eyebrow`                                                                                                                                                               |
|     |            | `_section-label` | `.section-label`                                                                                                                                                         |
|     |            | `_button`        | `.btn`, `.btn-group`, `.pill-btn`                                                                                                                                        |
|     |            | `_theme-switch`  | `.theme-switch`                                                                                                                                                          |
|     |            | `_project`       | `.project`                                                                                                                                                               |
|     |            | `_spec-list`     | `.spec-list`                                                                                                                                                             |
|     |            | `_contact`       | `.contact`                                                                                                                                                               |
|     |            | `_themed-text`   | `.themed-text__alt`                                                                                                                                                      |
|     |            | `_back-to-top`   | `.back-to-top`                                                                                                                                                           |
|     |            | `_toast`         | `.toast`                                                                                                                                                                 |
|     |            | `_reticle`       | `.reticle`                                                                                                                                                               |
|     |            | `_loader`        | `.loader`, `html.is-loading`                                                                                                                                             |
|     |            | `_theme-veil`    | `.theme-veil`                                                                                                                                                            |
|     |            | `_warnbar`       | `.warnbar`                                                                                                                                                               |
|     |            | `_night-field`   | `.night-field`                                                                                                                                                           |
|     |            | `_skip-link`     | `.skip-link`                                                                                                                                                             |
| 4   | pages      | `_not-found`     | `.hero--lost`, `.not-found`                                                                                                                                              |
| 5   | themes     | `_surface`       | Default tokens (CSS custom properties)                                                                                                                                   |
|     |            | `_netspace`      | Night tokens and scene overrides                                                                                                                                         |
|     |            | `_evangelion`    | Secret theme tokens and overrides                                                                                                                                        |

**Finding a style:** take the block name from the class (`.project__link` → `project`) and open the partial
with the same name.

## Conventions

- **BEM:** `.block`, `.block__element`, `.block--modifier`.
- **State classes** set from scripts use `is-`: `is-on`, `is-out`, `is-hot`, `is-in`, `is-paused`, `is-ok`, `is-loading`.
- **Script hooks** use `data-` attributes (`data-toast`, `data-back-to-top`), never classes. Restyling can't break behaviour.
- **No raw colours in partials.** Themeable colours come from CSS custom properties (`var(--peach)`). Fixed
  art colours come from the palette in `abstracts/_colors.scss`. Use `alpha($color, 0.3)` for transparency.
- **Every partial starts with** `@use 'abstracts' as *;` (built-in modules like `sass:math` go first). This
  works from any folder because `astro.config.mjs` adds `src/styles` to Sass's load paths.

## Mobile first

Styles outside a media query are the phone styles. Wider screens layer on top with `mq()`:

```scss
.project {
  grid-template-columns: minmax(0, 1fr); // phones: one column

  @include mq(md) {
    grid-template-columns: 190px minmax(0, 1fr) auto; // 701px and up
  }
}
```

| Name      | Min width | Typical use                                     |
| :-------- | :-------- | :---------------------------------------------- |
| `xs`      | 381px     | Larger phones                                   |
| `sm`      | 481px     | Phablets                                        |
| `phablet` | 486px     | Footer switches from the centered stack to rows |
| `md`      | 701px     | Tablets and up: the main layout switch          |
| `lg`      | 1280px    | Wide desktop (currently unused)                 |
| `xl`      | 1800px    | Wider container                                 |
| `xxl`     | 2400px    | Very large screens                              |

Other media mixins: `motion-ok`, `reduced-motion`, `touch` (`hover: none`).

## Tokens and helpers

- **Fonts:** `$font-body`, `$font-mono` and `$font-display` point at the CSS variables Astro's Fonts API
  generates (`--font-body`, …), including tuned fallback fonts. Families and weights are configured in
  `astro.config.mjs` (see [Architecture](architecture.md#build-time-vs-browser)).

- **Spacing:** `space(1)` to `space(6)` → 8, 16, 24, 32, 48, 80px.
- **z-index:** `z(header)`, `z(back-to-top)`, `z(reticle)`, `z(toast)`, `z(veil)`, `z(skip-link)`, `z(loader)`, `z(behind)`. Add new layers to `$z-layers`, never raw numbers.
- **Gutter:** `--gutter` (a CSS custom property, `clamp(20px, 5vw, 72px)`), applied with `@include gutter-inline` so it respects phone notches.
- **Shapes:** `chamfer($cut)` cuts two corners; `chamfer-plate($cut, $edge, $face)` makes a cut-corner plate with a 1px lit edge (the element paints the edge, `::before` paints the face); `corner-brackets($color)` draws four L-shaped corners.

## Adding a component

1. Create `src/styles/components/_my-thing.scss`, starting with `@use 'abstracts' as *;`.
2. Add `@use 'my-thing';` to `components/_index.scss`.
3. Add a row to the table of contents in `main.scss` (and in this doc).
4. If it looks different per theme, put those rules in the theme files. See [Theming](theming.md).

## Gotchas

- `.page` uses `overflow-x: clip`, not `hidden`. The section glows are `100vw` wide and need clipping, and
  `hidden` would make `.page` a scroll container, which breaks `position: sticky` inside it.
- Footer layout: below 486px it is a centered stack (© line, wave, night note). From 486px the wave sits on
  top with both notes on one row, using a 16px gap because 20px would wrap them at 486px. From 701px it is
  one row: © | wave | note.
- On phones the back-to-top button is an icon-only square (`$back-to-top-size`) so it fits beside the
  contact buttons; from 701px it shows its label.
- The header name has `user-select: none`, because three quick taps unlock the easter egg and would
  otherwise select the text.
- The theme partials must stay in order (surface → netspace → evangelion). See [Theming](theming.md).
