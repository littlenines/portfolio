import { SECRET_THEME, type Theme } from '@lib/themes';
import { prefersReducedMotion } from '@scripts/lib/media';
import { STATE_CLASS } from '@scripts/lib/state-classes';
import { applyTheme, currentTheme } from './state';

export type ChooseTheme = (theme: Theme) => void;

const PHASE = { none: '', alert: 'alert', title: 'title' } as const;

const TIMING = {
  revealContent: 260,
  countdownStep: 300,
  enterDuration: 1450,
  exitDuration: 1050,
} as const;

const COUNTDOWN_FROM = 3;
const SYNC_STEPS = 20;
const SYNC_STEP_MS = 45;
const FULL_SYNC = 100;
const SYNC_DIGITS = 5;

const EXIT_TITLE = '撤収';
const EXIT_CAPTIONS: Partial<Record<Theme, string>> = { netspace: 'NETSPACE RESTORED' };
const DEFAULT_EXIT_CAPTION = 'WELCOME BACK';

const formatCountdown = (seconds: number) => `T-00:${String(seconds).padStart(2, '0')}`;
const formatSyncRate = (percent: number) => `${percent.toFixed(1).padStart(SYNC_DIGITS, '0')}%`;
const easeOutQuad = (progress: number) => 1 - (1 - progress) ** 2;

const setText = (element: HTMLElement | null, text: string) => {
  if (element) element.textContent = text;
};

const changeDirectly: ChooseTheme = (theme) => {
  if (theme !== currentTheme()) applyTheme(theme);
};

class ThemeTransition {
  readonly #veil: HTMLElement;
  readonly #countdown: HTMLElement | null;
  readonly #syncRate: HTMLElement | null;
  readonly #title: HTMLElement | null;
  readonly #caption: HTMLElement | null;
  #timers: number[] = [];
  #isPlaying = false;
  #startedAt = 0;
  #targetTheme = currentTheme();

  constructor(veil: HTMLElement) {
    this.#veil = veil;
    this.#countdown = veil.querySelector('[data-veil-count]');
    this.#syncRate = veil.querySelector('[data-veil-rate]');
    this.#title = veil.querySelector('[data-veil-title]');
    this.#caption = veil.querySelector('[data-veil-caption]');

    veil.addEventListener('click', () => this.#finish());

    document.addEventListener('keydown', (event) => {
      if (this.#isPlaying && event.timeStamp > this.#startedAt) this.#finish();
    });
  }

  choose: ChooseTheme = (theme) => {
    if (this.#isPlaying) {
      this.#finish();

      return;
    }

    const fromTheme = currentTheme();

    if (theme === fromTheme) return;

    const isEntering = theme === SECRET_THEME;
    const crossesSecretTheme = isEntering !== (fromTheme === SECRET_THEME);

    if (!crossesSecretTheme) {
      applyTheme(theme);

      return;
    }

    this.#isPlaying = true;
    this.#startedAt = performance.now();
    this.#targetTheme = theme;

    this.#veil.dataset.to = theme;
    this.#veil.dataset.phase = PHASE.none;
    setText(this.#syncRate, formatSyncRate(0));
    setText(this.#countdown, formatCountdown(COUNTDOWN_FROM));
    this.#veil.classList.add(STATE_CLASS.visible);

    if (isEntering) this.#playEnter();
    else this.#playExit(theme);
  };

  #schedule(delay: number, step: () => void) {
    this.#timers.push(window.setTimeout(step, delay));
  }

  #finish() {
    this.#timers.forEach(clearTimeout);
    this.#timers = [];

    if (!this.#isPlaying) return;

    this.#isPlaying = false;
    applyTheme(this.#targetTheme);

    // Wait two frames so the new theme has painted before the veil lifts, unless a new sequence started since
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!this.#isPlaying) this.#veil.classList.remove(STATE_CLASS.visible);
      }),
    );
  }

  #playEnter() {
    this.#schedule(TIMING.revealContent, () => (this.#veil.dataset.phase = PHASE.alert));

    for (let second = COUNTDOWN_FROM; second >= 0; second--) {
      const tick = COUNTDOWN_FROM - second;

      this.#schedule(TIMING.revealContent + tick * TIMING.countdownStep, () =>
        setText(this.#countdown, formatCountdown(second)),
      );
    }

    for (let step = 1; step <= SYNC_STEPS; step++) {
      const percent = Math.min(FULL_SYNC, easeOutQuad(step / SYNC_STEPS) * FULL_SYNC);

      this.#schedule(TIMING.revealContent + step * SYNC_STEP_MS, () =>
        setText(this.#syncRate, formatSyncRate(percent)),
      );
    }

    this.#schedule(TIMING.enterDuration, () => this.#finish());
  }

  #playExit(theme: Theme) {
    setText(this.#title, EXIT_TITLE);
    setText(this.#caption, EXIT_CAPTIONS[theme] ?? DEFAULT_EXIT_CAPTION);
    this.#schedule(TIMING.revealContent, () => (this.#veil.dataset.phase = PHASE.title));
    this.#schedule(TIMING.exitDuration, () => this.#finish());
  }
}

export function createThemeTransition(veil: HTMLElement | null): ChooseTheme {
  if (!veil || prefersReducedMotion()) return changeDirectly;

  return new ThemeTransition(veil).choose;
}
