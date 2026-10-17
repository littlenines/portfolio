# Scripts

Browser code lives in `src/scripts/`, one module per feature. Components call these modules from small
`<script>` tags. Animation uses GSAP (npm package, with ScrollTrigger).

```text
scripts/
├── lib/        dom.ts (frame throttle, visibility, colour helpers), media.ts (media queries), boot.ts
├── theme/      state, switch, transition, easter-egg, index (wires them together)
├── motion/     gsap.ts (setup), hero.ts, reveal.ts
├── effects/    footer-wave, night-field, back-to-top, reticle, toast, copy-text, warn-bar
└── loader.ts
```

## Reduced motion

Everything respects `prefers-reduced-motion: reduce`:

- The loader and the theme veil are skipped.
- All GSAP motion runs inside `whenMotionAllowed()`, so it never starts.
- The footer wave draws once and stays still.
- CSS removes transitions and animations globally.

The page is fully readable at rest. Motion only adds to it.

## Loader: `loader.ts`

A terminal-style boot log. Each line settles to "ok" before the next starts. Two steps wait for real
events (fonts loaded, page loaded), capped at 4 seconds so nothing hangs. Repeat visits in the same tab
session run faster. When it finishes, it fades out, signals `app:booted` (the hero intro starts while it is
still fading) and removes itself.

It never plays when the visitor comes back to the page (Back/Forward or reload, `RETURNING_NAVIGATIONS`).
The browser restores the scroll position then, and a loader on top would hide it and lock scrolling. This
matters most in in-app browsers (Messenger, Instagram, LinkedIn), which open "new tab" links in the same
view.

Safety nets, in `Loader.astro` and `_loader.scss`:

- An inline script decides before first paint whether the loader plays, and only then locks scrolling
  (`html.is-loading`). The loader is only shown while that class is set, and the lock lifts after 7.5s even
  if the loader script never runs.
- A CSS animation hides the loader after 7s for the same reason.

## Hero motion: `motion/hero.ts`

- **Intro:** the sun rises, the name, eyebrow and title lines slide in, then the copy. Held until the loader lifts.
- **Scroll depth:** across the hero, the sun sinks, the stars drift up and the copy lifts slightly.
- **The city wakes up:** extra "awake" windows light one by one as you scroll away from the top. Each one
  switches on over a short slice of the scroll (`AWAKE_SWITCH`), so only a few change in any one frame.
- **Ambient loops:** beacons pulse, about 40 random windows breathe, haze drifts, and a shooting star crosses
  every 7–12 seconds. All of these pause while the hero is off screen, while the tab is hidden, and **while the
  page is scrolling** (they resume 200 ms after it settles).

**Performance note:** any change inside the skyline SVG makes the browser redo style and layering for the
whole SVG. On phones, loops running during a scroll caused visible stutter. Keep new skyline animations
infrequent, and pause them during scroll the same way.

Tunable values are named constants at the top of the file (`INTRO`, `SCROLL_DEPTH`, `METEOR`, …).

## Scroll reveals: `motion/reveal.ts`

Any element with `data-reveal` rises in the first time it scrolls into view. Section label rules draw from
the left.

## Effects

| Module           | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `footer-wave.ts` | Three layered sine waves on a canvas, with a soft blip every few seconds. Colours come from `--wave-*-rgb` and ease between themes. Runs only while visible.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `night-field.ts` | Below the hero, the page background sinks from the theme's ground (`--ground-rgb`) to a darker shade (`--ground-sunk-rgb`) and faint stars fade in. Also tints the phone browser bar from the sky colour (`--sky-top-rgb`) into the page colour.                                                                                                                                                                                                                                                                                                                   |
| `back-to-top.ts` | Appears after 80% of the first screen. As the footer scrolls in it lifts itself (`--lift`): on wide desktops with a mouse (≥1280px) it may float over the footer wave and only stays clear of the text row; everywhere else it stops just above the footer's top line, so it never covers the contact buttons. Its scroll to the top is the only smooth scroll on the page: `scroll-behavior: smooth` on `html` would also smooth Chrome's scroll restore on Back, which ScrollTrigger's setup cancels. The footer element is found with `data-back-to-top-limit`. |
| `reticle.ts`     | A ring that trails the mouse and grows over links, buttons and projects. Mouse devices only. In evangelion it becomes a bracket frame with page coordinates.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `copy-text.ts`   | Any button with `data-copy="text"` copies that text. Optional `data-copied-message` sets the toast. Uses the Clipboard API, which needs HTTPS or `localhost`; on a plain-HTTP address (e.g. testing from a phone over a LAN IP) it shows "Could not copy" instead.                                                                                                                                                                                                                                                                                                 |
| `toast.ts`       | `showToast(message)`: a note at the bottom that fades after 2s.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `warn-bar.ts`    | The evangelion caution tape draws itself the first time it scrolls into view; its stripes pause off screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Adding a behaviour

1. Write `src/scripts/<area>/<feature>.ts` exporting `init<Feature>(element)`.
2. Give the element a `data-` hook in its component.
3. Add a `<script>` to the component that finds the element and calls `init<Feature>`.
4. Respect reduced motion (`prefersReducedMotion()` or `whenMotionAllowed()`), and pause anything continuous while it is off screen.
