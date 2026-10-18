# Styles

SCSS in the 7-1 pattern, mobile first, using the modern Sass module system (`@use`/`@forward`, `sass:map`,
`sass:math`, `sass:color`, `sass:list`). There is no `vendors/` folder because no third-party CSS is used; add
one if that changes. The single entry point is `src/styles/main.scss`, imported once in
`Layout.astro`.

## Table of contents

The same table is at the top of `main.scss`. Folders are listed in cascade order.

| #   | Folder     | Partial          | Owns                                                                                                                                                                                                    |
| :-- | :--------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0   | abstracts  | `_colors`        | Palette, `alpha()`, `rgb-triplet()`                                                                                                                                                                     |
|     |            | `_variables`     | Breakpoints, spacing, z-index, fonts, root font size, font-size scale, theme selectors                                                                                                                  |
|     |            | `_functions`     | `space()`, `z-index()`, `font-size()`, `breakpoint()`, `chamfer-shape()`                                                                                                                                |
|     |            | `_mixins`        | `breakpoint-up()`, `motion-ok`, `reduced-motion`, `touch`, `fine-pointer`, `night`, `evangelion`, `cover`, `gutter-inline`, `mask`, `fade-sides`, `chamfer`, `chamfer-plate`, `corner-brackets`, `pill` |
| 1   | base       | `_reset`         | Box-sizing, margins, list reset                                                                                                                                                                         |
|     |            | `_document`      | `html`, `body`, scrollbar, `::selection`, `--gutter`                                                                                                                                                    |
|     |            | `_typography`    | `.mono`                                                                                                                                                                                                 |
|     |            | `_accessibility` | Focus rings, reduced-motion overrides                                                                                                                                                                   |
| 2   | layout     | `_container`     | `.container`, `.page`                                                                                                                                                                                   |
|     |            | `_header`        | `.site-header`                                                                                                                                                                                          |
|     |            | `_hero`          | `.hero`                                                                                                                                                                                                 |
|     |            | `_section`       | `.section`                                                                                                                                                                                              |
|     |            | `_footer`        | `.site-footer`                                                                                                                                                                                          |
| 3   | components | `_scene`         | `.scene` (sky, stars, sun, city light, ground strip)                                                                                                                                                    |
|     |            | `_skyline`       | `.skyline` (windows, beacons, neon, haze)                                                                                                                                                               |
|     |            | `_stream-beams`  | `.stream-beams` (netspace light beams over the skyline)                                                                                                                                                 |
|     |            | `_eyebrow`       | `.eyebrow`                                                                                                                                                                                              |
|     |            | `_section-label` | `.section-label`                                                                                                                                                                                        |
|     |            | `_button`        | `.button`, `.button-group`, `.pill-button`                                                                                                                                                              |
|     |            | `_theme-switch`  | `.theme-switch`                                                                                                                                                                                         |
|     |            | `_theme-icon`    | `.theme-icon` (sun, chip, Unit-01 hexagon)                                                                                                                                                              |
|     |            | `_project`       | `.project`                                                                                                                                                                                              |
|     |            | `_spec-list`     | `.spec-list`                                                                                                                                                                                            |
|     |            | `_contact`       | `.contact`                                                                                                                                                                                              |
|     |            | `_themed-text`   | `.themed-text__alt`                                                                                                                                                                                     |
|     |            | `_back-to-top`   | `.back-to-top`                                                                                                                                                                                          |
|     |            | `_toast`         | `.toast`                                                                                                                                                                                                |
|     |            | `_reticle`       | `.reticle`                                                                                                                                                                                              |
|     |            | `_loader`        | `.loader`, `html.is-loading`                                                                                                                                                                            |
|     |            | `_theme-veil`    | `.theme-veil`                                                                                                                                                                                           |
|     |            | `_warn-bar`      | `.warn-bar`                                                                                                                                                                                             |
|     |            | `_night-field`   | `.night-field`                                                                                                                                                                                          |
|     |            | `_skip-link`     | `.skip-link`                                                                                                                                                                                            |
| 4   | pages      | `_not-found`     | `.hero--lost`, `.not-found`                                                                                                                                                                             |
| 5   | themes     | `_surface`       | Default tokens (CSS custom properties)                                                                                                                                                                  |
|     |            | `_netspace`      | Night tokens and scene overrides                                                                                                                                                                        |
|     |            | `_evangelion`    | Secret theme tokens and overrides                                                                                                                                                                       |

**Finding a style:** take the block name from the class (`.project__link` → `project`) and open the partial
with the same name.

## Conventions

- **BEM:** `.block`, `.block__element`, `.block--modifier`.
- **State classes** set from scripts use `is-`: `is-on`, `is-out`, `is-hot`, `is-in`, `is-paused`, `is-ok`, `is-loading`.
  Scripts take them from `STATE_CLASS` (`scripts/lib/state-classes.ts`), never as string literals.
- **Script hooks** use `data-` attributes (`data-toast`, `data-back-to-top`), never classes. Restyling can't break behaviour.
- **No raw colours in partials.** Themeable colours come from CSS custom properties (`var(--peach)`). Fixed
  art colours come from the palette in `abstracts/_colors.scss`. Use `alpha($color, 0.3)` for transparency.
- **Every partial starts with** `@use 'abstracts' as *;` (built-in modules like `sass:math` go first). This
  works from any folder because `astro.config.mjs` adds `src/styles` to Sass's load paths.

## Mobile first

Styles outside a media query are the phone styles. Wider screens layer on top with `breakpoint-up()`:

```scss
.project {
  grid-template-columns: minmax(0, 1fr); // phones: one column

  @include breakpoint-up(md) {
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

- **Font sizes:** `font-size(sm)` reads from the `$font-sizes` scale in `_variables.scss`:

  | Step | Size         | Step | Size         |
  | :--- | :----------- | :--- | :----------- |
  | xxxs | 0.9rem, 9px  | xl   | 1.5rem, 15px |
  | xxs  | 1rem, 10px   | xxl  | 1.6rem, 16px |
  | xs   | 1.1rem, 11px | body | 1.7rem, 17px |
  | sm   | 1.2rem, 12px | xxxl | 1.8rem, 18px |
  | md   | 1.3rem, 13px |      |              |
  | lg   | 1.4rem, 14px |      |              |

  Fluid sizes (`clamp()`) and one-offs are named variables at the top of their partial, such as
  `$title-size` in `layout/_hero.scss`, and use scale steps for their bounds where they fit. Inside a
  `font:` shorthand with a line-height, write `list.slash(font-size(md), 1)`: a bare `/` after a function
  call is read as division.

  `html` is set to `$root-font-size` (62.5%), so `1rem` = 10px at the browser default. It is a percentage,
  not 10px, so text still grows when a visitor raises their browser's font size. Breakpoints stay in px:
  rem in media queries ignores the root size and always means 16px.

- **Spacing:** `space(1)` to `space(6)` → 8, 16, 24, 32, 48, 80px, for layout spacing. Small optical
  adjustments may stay in `px` (see [Conventions](conventions.md#styles)).
- **z-index:** `z-index(header)`, `z-index(back-to-top)`, `z-index(reticle)`, `z-index(toast)`, `z-index(veil)`, `z-index(skip-link)`, `z-index(loader)`, `z-index(behind)`, `z-index(raised)` (above siblings inside a component). Add new layers to `$z-layers`, never raw numbers.
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
  otherwise select the text. On desktop (fine pointer with hover) it gets a pointer cursor and a soft glitch
  on hover in the theme's first two wave colours as a hint; the hint is off in evangelion, where knocking
  does nothing.
- Project rows share the list's columns through `subgrid`, so the tech and links column lines up in every
  row. From 701px that column is right-aligned, so every tech line and link row ends flush with the row
  edge; on phones it stays left-aligned under the description. A row's side padding comes from `--project-inset` (12px, 20px in evangelion), and the name column is
  widened by the same amount. Change the padding through that variable, not `padding-inline`, or long
  names wrap.
- The theme partials must stay in order (surface → netspace → evangelion). See [Theming](theming.md).
- The header is absolutely positioned, so `.page`'s `overflow-x: clip` does not apply to it. Anything in the
  header that can stick out must clip itself. The theme switch uses `overflow: clip`, otherwise its pill
  sliding back after the evangelion option hides widens the page on phones. Its focus ring is drawn inside
  (`outline-offset: -2px`) for the same reason.
- On phones the hero copy's bottom padding is `sun lift + sun height + 24px`, so the text always ends above
  the sun whatever the screen height.
