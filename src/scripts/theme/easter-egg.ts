import { PALETTE } from '@lib/palette';
import { SECRET_THEME } from '@lib/themes';
import { currentTheme, onThemeChange } from './state';
import type { ChooseTheme } from './transition';

const TAPS_NEEDED = 3;
const TAP_WINDOW_MS = 2500;
const PROGRESS_PROPERTY = '--knock-progress';

const CONSOLE_HINT = 'something here wakes up after dark. knock on the name a few times.';
const CONSOLE_STYLES = [`color:${PALETTE.evaOrange};font-weight:700`, `color:${PALETTE.mute}`];

export function initEasterEgg(tapTarget: HTMLElement | null, chooseTheme: ChooseTheme) {
  if (!tapTarget) return;

  let taps = 0;
  let resetTimer = 0;

  const showProgress = (count: number) => {
    taps = count;
    tapTarget.style.setProperty(PROGRESS_PROPERTY, String(count / TAPS_NEEDED));
  };

  tapTarget.addEventListener('click', () => {
    if (currentTheme() === SECRET_THEME) return;

    window.clearTimeout(resetTimer);
    showProgress(taps + 1);

    if (taps < TAPS_NEEDED) {
      resetTimer = window.setTimeout(() => showProgress(0), TAP_WINDOW_MS);

      return;
    }

    chooseTheme(SECRET_THEME);
  });

  onThemeChange(() => showProgress(0));

  console.info(`%c警告%c  ${CONSOLE_HINT}`, ...CONSOLE_STYLES);
}
