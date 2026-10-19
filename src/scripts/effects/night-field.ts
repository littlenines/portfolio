import { clamp01 } from '@lib/math';
import { mixRgb, readRgbToken, rgbToHex, type Rgb } from '@scripts/lib/color';
import { throttleToFrame } from '@scripts/lib/dom';
import { onThemeChange } from '@scripts/theme/state';

const MAX_STAR_OPACITY = 0.7;
const BAR_BLEND_DISTANCE = 0.5;

const TOKENS = {
  ground: '--ground-rgb',
  sunkGround: '--ground-sunk-rgb',
  skyTop: '--sky-top-rgb',
} as const;

const writeWhenChanged = (write: (value: string) => void) => {
  let lastValue: string | undefined;

  return (value: string) => {
    if (value === lastValue) return;

    lastValue = value;
    write(value);
  };
};

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
  let heroHeight = 0;
  let maxScroll = 0;

  const setBackground = writeWhenChanged((value) => (document.body.style.backgroundColor = value));
  const setStarOpacity = writeWhenChanged((value) => (field.style.opacity = value));

  const setBarColor = writeWhenChanged((value) => {
    if (themeColor) themeColor.content = value;
  });

  const measure = () => {
    heroHeight = hero.offsetHeight;
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  };

  const update = () => {
    const nightProgress =
      maxScroll > heroHeight ? clamp01((window.scrollY - heroHeight) / (maxScroll - heroHeight)) : 0;

    const ground = mixRgb(colors.ground, colors.sunkGround, nightProgress).map(Math.round) as Rgb;
    const barBlend = clamp01(window.scrollY / (heroHeight * BAR_BLEND_DISTANCE));

    setBackground(`rgb(${ground.join(',')})`);
    setStarOpacity((nightProgress * MAX_STAR_OPACITY).toFixed(3));
    setBarColor(rgbToHex(mixRgb(colors.skyTop, ground, barBlend)));
  };

  const scheduleUpdate = throttleToFrame(update);

  const remeasure = () => {
    measure();
    scheduleUpdate();
  };

  const resizeObserver = new ResizeObserver(remeasure);

  resizeObserver.observe(document.documentElement);
  resizeObserver.observe(hero);
  window.addEventListener('resize', remeasure);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });

  onThemeChange(() => {
    colors = readColors();
    scheduleUpdate();
  });

  measure();
  update();
}
