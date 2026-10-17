import { STATE_CLASS } from '@scripts/lib/state-classes';

const MOSTLY_VISIBLE = 0.6;

export function initWarnBar(bar: HTMLElement) {
  if (!('IntersectionObserver' in window)) {
    bar.classList.add(STATE_CLASS.entered);

    return;
  }

  new IntersectionObserver(
    ([entry]) => {
      bar.classList.toggle(STATE_CLASS.paused, !entry.isIntersecting);

      if (entry.isIntersecting) bar.classList.add(STATE_CLASS.entered);
    },
    { threshold: MOSTLY_VISIBLE },
  ).observe(bar);
}
