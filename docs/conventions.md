# Conventions

The rules this codebase follows. Most of them are checked by `pnpm lint`; the rest are listed so people and
AI agents don't have to guess. When a rule and the code disagree, fix the code or update the rule here.

## Before committing

| Command         | What it checks                                                      |
| :-------------- | :------------------------------------------------------------------ |
| `pnpm format`   | Fixes formatting (Prettier), blank lines (ESLint) and SCSS issues   |
| `pnpm lint`     | Prettier, ESLint and Stylelint, without changing files              |
| `pnpm test`     | Unit tests for the pure modules (`tests/unit`)                      |
| `pnpm build`    | Type check (`astro check`), then the production build               |
| `pnpm test:e2e` | Builds, then runs the browser and accessibility tests (`tests/e2e`) |

CI (`.github/workflows/ci.yml`) runs all of them on every push to `master` and on every pull request.

## Naming

- **Full words, no abbreviations.** `breakpoint()`, not `bp()`; `button`, not `btn` in new code. Names are
  at least three characters. The only exceptions are coordinates and SVG attributes (`x`, `y`, `cx`, `cy`),
  `id`, and `_` for an unused parameter. ESLint (`id-length`) and Stylelint (function, mixin and variable
  patterns) enforce this.
- **One feature, one name.** A component, its script and its partial share the name: `WarnBar.astro`,
  `scripts/effects/warn-bar.ts`, `styles/components/_warn-bar.scss`, class `.warn-bar`, hook `data-warn-bar`.
- **Components** are PascalCase (`BackToTop.astro`); scripts, partials and other files are kebab-case.
- **Constants** are `SCREAMING_SNAKE_CASE`. Related values are grouped in one `as const` object
  (`TIMING.enterDuration`, `METEOR.flight`).
- **Booleans** read as a question: `isVisible`, `hasBooted`, `crossesSecretTheme`.

## No magic numbers or strings

- Every number with a meaning gets a named constant at the top of its module; units go in the name
  (`TAP_WINDOW_MS`, `FOOTER_TEXT_CLEARANCE`).
- **Shared values live in one place:**

  | Value                       | Source                                                         |
  | :-------------------------- | :------------------------------------------------------------- |
  | Colours in scripts and SVG  | `src/lib/palette.ts` (mirrors `styles/abstracts/_colors.scss`) |
  | Colours in styles           | Theme tokens (`var(--peach)`) or the palette in `_colors.scss` |
  | State classes (`is-*`)      | `STATE_CLASS` in `src/scripts/lib/state-classes.ts`            |
  | Media queries in scripts    | `MEDIA` in `src/scripts/lib/media.ts`                          |
  | Themes, storage key, events | `src/lib/themes.ts`                                            |
  | Site name, email, links     | `src/data/site.ts`                                             |
  | Boot timeout, loader hook   | `src/scripts/lib/boot.ts`                                      |

- Inline scripts in `.astro` files (`is:inline`) cannot import, so they receive constants through
  `define:vars` instead of repeating them (see `Loader.astro`).

## TypeScript

- Modern syntax: `const`/`let`, arrow functions for small helpers and callbacks, `function` declarations
  for exported top-level functions, classes with `#private` fields for stateful effects.
- `import type` for type-only imports (ESLint enforces it).
- **Validate instead of casting.** Use a type guard (`isTheme(value)`) rather than `value as Theme`, and
  avoid `!` non-null assertions; handle the missing case.
- A function that adds listeners or observers returns a function that removes them (`onThemeChange`,
  `onVisibilityChange`).
- A promise that is intentionally not awaited is marked with `void` (`void initLoader();`).
- `console.info` only, and only on purpose (the easter-egg hint).

## Styles

See [Styles](styles.md) for the folder map. The rules:

- **BEM classes** (`.block__element--modifier`), `is-*` for states, `data-*` attributes for script hooks.
  Stylelint checks the class pattern.
- **Mobile first:** phone styles first, wider screens through `@include breakpoint-up(md)`.
- **Font sizes** come from `font-size(step)`, or a named variable for fluid and one-off sizes. Never `px`
  (Stylelint checks it).
- **Spacing:** layout spacing (section padding, gaps between blocks) uses `space(step)`. Small optical
  adjustments and component geometry (a 6px nudge, an icon's size) may stay in `px`; give them a name when
  they repeat.
- **z-index** always through `z-index(layer)`, never a raw number (Stylelint checks it).
- **No raw colours** outside `abstracts/_colors.scss` and the theme files.

## Comments

Only comments that explain _why_ (a browser quirk, a non-obvious constraint). Don't describe what the code
already says.

## Content

Text, links and project data live in `src/data`, not in components or scripts.

## Tests

- Pure modules in `src/lib` and the helpers in `src/scripts/lib` get unit tests in `tests/unit`.
- User-facing behaviour (layout at phone widths, the theme switch, the easter egg, back-to-top) and an axe
  accessibility scan run in `tests/e2e` against the built site.
- When you fix a bug that a test could have caught, add that test.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) with a short, lowercase, imperative summary:

```text
feat: add a project filter
fix: keep the sun clear of the hero copy on short phones
refactor: move skyline colours into the palette
docs | test | chore | ci | deps: …
```
