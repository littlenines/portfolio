# Scripts

Browser code lives in `src/scripts/`, one module per feature. Components call these modules from small
`<script>` tags. Animation uses GSAP (npm package, with ScrollTrigger).

```text
scripts/
├── lib/        dom.ts (frame throttle, visibility), color.ts (RGB tokens and mixing), activity.ts (on screen,
│               tab visible, not scrolling), media.ts (media queries), state-classes.ts, boot.ts
├── theme/      state, switch, transition, easter-egg, index (wires them together)
├── motion/     gsap.ts (setup, selectAll), ambient-clock.ts, reveal.ts
│   └── hero/   index (wires them together), intro, scroll-effects, ambient-loops, stream-beams, meteor
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

## Hero motion: `motion/hero/`

One module per job; `index.ts` wires them together and decides when they run.

- **Intro:** the sun rises, the name, eyebrow and title lines slide in, then the copy. Held until the loader lifts.
- **Scroll depth:** across the hero, the sun sinks, the stars drift up and the copy lifts slightly.
- **The city wakes up:** extra "awake" windows light one by one as you scroll away from the top. Each one
  switches on over a short slice of the scroll (`AWAKE_SWITCH`), so only a few change in any one frame. CSS
  keeps them off from the first paint when motion is allowed (`_skyline.scss`); otherwise they would show lit
  until the script starts, which flashed on every reload.
- **Ambient loops** (`ambient-loops.ts`): beacons pulse, about 40 random windows breathe and the haze drifts.
- **Stream beams** (`stream-beams.ts`, netspace only): packets of light climb each beam. Their climb, speed and
  starting point come from data attributes written at build time.
- **Meteor** (`meteor.ts`): a shooting star crosses every 7–12 seconds.

When they run (`watchActivity()` in `lib/activity.ts` reports whether the hero is shown and whether the page
is scrolling):

- Everything pauses while the hero is off screen or the tab is hidden.
- The ambient loops and the meteor also pause **while the page is scrolling** and resume 200 ms after it
  settles. They change the large skyline drawing, which made scrolling stutter on phones.
- The beam packets keep climbing while scrolling: they sit on their own layer, so they cost only 10–20% more
  scroll work on a throttled phone, and freezing them mid-scroll looked broken. They only run in netspace.

**Performance.** Any change inside the skyline SVG makes the browser restyle the whole drawing. Measured on a
phone emulated with a 4× slower CPU:

- The ambient loops and the beam packets run on an **ambient clock** (`motion/ambient-clock.ts`) instead of
  GSAP's 60 fps ticker: 15 fps for the slow loops (`AMBIENT_FPS`) and 30 fps for the packets
  (`STREAM_BEAM_FPS`). They look the same and cut idle main-thread time by about two thirds.
- Both skyline SVGs have `will-change: transform` (`_skyline.scss`), so the city is rasterised once instead of
  when it scrolls back into view, which caused a 40 ms frame, and the packets never repaint the city.
- The meteor moves fast, so it stays on the normal frame rate.

Keep new skyline animations on the ambient clock, and give anything that moves continuously its own small SVG.

Tunable values are named constants at the top of each module (`INTRO`, `SCROLL_DEPTH`, `METEOR`, …).

## Scroll reveals: `motion/reveal.ts`

Any element with `data-reveal` rises in the first time it scrolls into view. Section label rules draw from
the left.

## Effects

| Module           | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `footer-wave.ts` | Three layered sine waves on a canvas, with a soft blip every few seconds. Colours come from `--wave-*-rgb` and ease between themes. Draws at 30 fps and only while visible.                                                                                                                                                                                                                                                                                                                                                                                        |
| `night-field.ts` | Below the hero, the page background sinks from the theme's ground (`--ground-rgb`) to a darker shade (`--ground-sunk-rgb`) and faint stars fade in. Also tints the phone browser bar from the sky colour (`--sky-top-rgb`) into the page colour. Sizes are measured on resize, not on scroll, and styles are written only when they change.                                                                                                                                                                                                                        |
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
