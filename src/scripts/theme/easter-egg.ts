import { SECRET_THEME } from '@lib/themes';
import { currentTheme } from './state';
import type { ChooseTheme } from './transition';

const TAPS_NEEDED = 3;
const TAP_WINDOW_MS = 2500;

const CONSOLE_HINT = 'something here wakes up after dark. knock on the name a few times.';
const CONSOLE_STYLES = ['color:#FF8A3D;font-weight:700', 'color:#A99CB8'];

export function initEasterEgg(tapTarget: HTMLElement | null, chooseTheme: ChooseTheme) {
  if (!tapTarget) return;

  let taps: number[] = [];

  tapTarget.addEventListener('click', () => {
    const now = Date.now();

    taps = [...taps.filter((time) => now - time < TAP_WINDOW_MS), now];

    if (taps.length < TAPS_NEEDED) return;

    taps = [];

    if (currentTheme() !== SECRET_THEME) chooseTheme(SECRET_THEME);
  });

  console.log(`%c警告%c  ${CONSOLE_HINT}`, ...CONSOLE_STYLES);
}
