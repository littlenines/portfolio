import { clamp01, mixRgb, readRgbToken, rgbToHex, throttleToFrame, type Rgb } from '@scripts/lib/dom';
import { onThemeChange } from '@scripts/theme/state';

const MAX_STAR_OPACITY = 0.7;
const BAR_BLEND_DISTANCE = 0.5;

const TOKENS = {
  ground: '--ground-rgb',
  sunkGround: '--ground-sunk-rgb',
  skyTop: '--sky-top-rgb',
} as const;

const readColors = () => ({
  ground: readRgbToken(TOKENS.ground),
  sunkGround: readRgbToken(TOKENS.sunkGround),
  skyTop: readRgbToken(TOKENS.skyTop),
});

export function initNightField(field: HTMLElement) {
  const hero = document.querySelector<HTMLElement>('.hero');
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  if (!hero) return;

  let colors = readColors();

  const update = () => {
    const heroHeight = hero.offsetHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    const nightProgress =
      maxScroll > heroHeight ? clamp01((window.scrollY - heroHeight) / (maxScroll - heroHeight)) : 0;

    const ground = mixRgb(colors.ground, colors.sunkGround, nightProgress).map(Math.round) as Rgb;

    document.body.style.backgroundColor = `rgb(${ground.join(',')})`;
    field.style.opacity = (nightProgress * MAX_STAR_OPACITY).toFixed(3);

    if (themeColor) {
      const barBlend = clamp01(window.scrollY / (heroHeight * BAR_BLEND_DISTANCE));

      themeColor.content = rgbToHex(mixRgb(colors.skyTop, ground, barBlend));
    }
  };

  const scheduleUpdate = throttleToFrame(update);

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);

  onThemeChange(() => {
    colors = readColors();
    scheduleUpdate();
  });

  update();
}
