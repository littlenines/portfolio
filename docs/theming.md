# Theming

There are three themes:

| Theme                 | Look                                                                                                        | How to get it                                              |
| :-------------------- | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| **surface** (default) | Warm dusk, setting sun                                                                                      | Theme switch                                               |
| **netspace**          | Deep night: the sun sets, the city lights up, neon glows                                                    | Theme switch                                               |
| **evangelion**        | Violet and orange, Mincho headings, cut-corner plates, caution tape, scanlines, hexagon sky, alternate copy | Easter egg: tap the name in the header 3 times within 2.5s |

Theme names, the default, the secret theme, the storage key and the event name are defined once in
`src/lib/themes.ts`.

## How a theme is applied

1. Before first paint, an inline script in `Layout.astro` reads `localStorage.theme` and sets
   `<html data-theme="…">`. This prevents a flash of the default theme.
2. CSS reacts to the attribute. Most of a theme is just different values for the custom properties.
3. Scripts change themes through `applyTheme()` (`scripts/theme/state.ts`), which sets the attribute, saves
   it and fires `theme:change`.

## Colour tokens

Components only use CSS custom properties. Each theme file sets them:

| Token                               | Purpose                                                                |
| :---------------------------------- | :--------------------------------------------------------------------- |
| `--ground`, `--raise`, `--line`     | Page background, raised surfaces, hairlines                            |
| `--text`, `--mute`                  | Body text, secondary text                                              |
| `--peach`, `--pink`, `--teal`       | Palette accents                                                        |
| `--accent`, `--on-accent`           | Theme accent (switch pill, back to top, reticle) and text placed on it |
| `--on-peach`                        | Text on a filled peach button                                          |
| `--selection`, `--scrollbar`        | Text selection and scrollbar thumb                                     |
| `--footer-glow`                     | Middle of the footer hairline                                          |
| `--night-sky`                       | Night gradient behind the hero                                         |
| `--ground-rgb`, `--ground-sunk-rgb` | Page background at the top and bottom of the scroll (read by script)   |
| `--sky-top-rgb`                     | Phone browser bar colour at the top of the page (read by script)       |
| `--wave-1-rgb` … `--wave-3-rgb`     | Footer wave colours (read by script)                                   |

The `-rgb` tokens hold an `r, g, b` triplet (built with `rgb-triplet()`) because scripts read and blend them.
That keeps every colour defined once, in SCSS.

## Theme files and order

- `themes/_surface.scss` sets the defaults on `:root`.
- `themes/_netspace.scss` uses the `$theme-night` selector, which matches **both** netspace and evangelion.
  Evangelion is "night plus more".
- `themes/_evangelion.scss` uses `$theme-evangelion` and layers on top.

Both selectors have the same specificity, so **load order decides**. Keep `themes/_index.scss` in the order
surface → netspace → evangelion.

To give a component a themed look, add a rule under the right selector in the theme file. Don't fork the
component partial. For a one-off rule written next to a component, the `night` and `evangelion` mixins do
the same thing:

```scss
.thing {
  color: var(--mute);

  @include evangelion {
    color: var(--teal);
  }
}
```

## Themed copy

`<ThemedText>` renders both versions of a line. CSS hides one depending on the theme:

```astro
<ThemedText>
  Got a gig? Let's talk.
  <Fragment slot="evangelion">Got a mission? Let's talk.</Fragment>
</ThemedText>
```

Swapping needs no script, works before scripts load, and screen readers only read the visible version.

## Theme switch

`ThemeSwitch.astro` is an ARIA radio group with roving tabindex: arrow keys move between options. The
highlight pill is sized from script to the active label's real width. A `ResizeObserver` keeps it right when
the web font swaps in. The evangelion option stays hidden until that theme is active.

## Transition veil

Switching into or out of evangelion changes fonts, shapes, copy and layout all at once, so
`scripts/theme/transition.ts` covers the page with `ThemeVeil.astro` while it swaps:

- **Going in:** a warning screen with a countdown and a sync-rate readout, about 1.5s.
- **Coming out:** a title card ("撤収" with "NETSPACE RESTORED" or "WELCOME BACK"), about 1s.
- A click or any key press skips ahead. The key press that started the sequence is ignored.
- The theme is applied behind the veil, which waits two frames before lifting so the new theme has painted.
- Switching between surface and netspace needs no veil; it fades over 2.4s instead.
- With reduced motion the veil is skipped entirely.

## Easter egg

`scripts/theme/easter-egg.ts`: three taps on the header name within 2.5 seconds switch to evangelion, which
then appears in the switch. The browser console prints a hint: "knock on the name a few times."
