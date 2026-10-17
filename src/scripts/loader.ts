import { markBooted } from '@scripts/lib/boot';
import { wait } from '@scripts/lib/dom';
import { prefersReducedMotion } from '@scripts/lib/media';

const LOADING_CLASS = 'is-loading';
const SESSION_KEY = 'booted';

const STEP_MS = { firstVisit: 190, repeatVisit: 70 };
const MAX_WAIT_MS = 4000;
const FINAL_LINE_PAUSE_MS = 650;
const INTRO_OVERLAP_MS = 450;
const REMOVE_AFTER_MS = 1100;
const LABEL_WIDTH = 22;

const HEADING = 'Nemanja Galbinovic // boot sequence';
const FINAL_LINE = 'system online. come on in.';
const PENDING = '...';
const DONE = 'ok';

const fontsReady = () => document.fonts?.ready ?? Promise.resolve();

const pageReady = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', () => resolve(), { once: true });
  });

interface BootStep {
  label: string;
  waitFor?: () => Promise<unknown>;
}

const BOOT_STEPS: BootStep[] = [
  { label: 'neural link' },
  { label: 'ice breaker', waitFor: fontsReady },
  { label: 'firewall bypass' },
  { label: 'scanning ports' },
  { label: 'spoofing ident' },
  { label: 'decrypting portfolio' },
  { label: 'loading chrome' },
  { label: 'syncing windows' },
  { label: 'city grid uplink' },
  { label: 'ghost protocol' },
  { label: 'handshake', waitFor: pageReady },
];

function isRepeatVisit() {
  try {
    const seen = sessionStorage.getItem(SESSION_KEY) === '1';

    sessionStorage.setItem(SESSION_KEY, '1');

    return seen;
  } catch {
    return false;
  }
}

function finishLoading(loader?: HTMLElement) {
  loader?.remove();
  document.documentElement.classList.remove(LOADING_CLASS);
}

export async function initLoader() {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  const log = loader?.querySelector<HTMLElement>('[data-loader-log]');
  const progress = loader?.querySelector<HTMLElement>('[data-loader-progress]');

  if (!loader || !log || !progress || prefersReducedMotion()) {
    finishLoading(loader ?? undefined);
    markBooted();

    return;
  }

  const stepMs = isRepeatVisit() ? STEP_MS.repeatVisit : STEP_MS.firstVisit;
  const giveUp = wait(MAX_WAIT_MS);

  const addLine = (text: string, modifier?: string) => {
    const line = document.createElement('div');

    line.className = modifier ? `loader__line loader__${modifier}` : 'loader__line';
    line.textContent = text;
    log.append(line);

    return line;
  };

  addLine(HEADING, 'head');

  for (const [index, step] of BOOT_STEPS.entries()) {
    const line = addLine(`${step.label} `.padEnd(LABEL_WIDTH, '.') + ' ');
    const status = document.createElement('span');

    status.className = 'loader__status';
    status.textContent = PENDING;
    line.append(status);

    await Promise.allSettled([wait(stepMs), step.waitFor && Promise.race([step.waitFor(), giveUp])]);

    status.textContent = DONE;
    status.classList.add('is-ok');
    progress.style.transform = `scaleX(${(index + 1) / BOOT_STEPS.length})`;
  }

  const cursor = document.createElement('span');

  cursor.className = 'loader__cursor';
  addLine(FINAL_LINE, 'final').append(cursor);

  await wait(FINAL_LINE_PAUSE_MS);
  loader.classList.add('is-out');
  setTimeout(markBooted, INTRO_OVERLAP_MS);
  setTimeout(() => finishLoading(loader), REMOVE_AFTER_MS);
}
