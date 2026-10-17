import { throttleToFrame } from '@scripts/lib/dom';
import { MEDIA, matches } from '@scripts/lib/media';
import { STATE_CLASS } from '@scripts/lib/state-classes';

const SHOW_AFTER_VIEWPORTS = 0.8;

const FOOTER_TEXT_CLEARANCE = 42;

export function initBackToTop(button: HTMLElement) {
  const footer = document.querySelector<HTMLElement>('[data-back-to-top-limit]');
  const top = document.querySelector<HTMLElement>('[data-back-to-top-target]');

  const scrollToTop = () => {
    window.scrollTo({ top: 0 });

    // The button hides once the page scrolls up, so focus moves to the top instead of being lost
    top?.focus({ preventScroll: true });
  };

  const update = () => {
    button.classList.toggle(STATE_CLASS.visible, window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORTS);

    if (!footer) return;

    const footerBox = footer.getBoundingClientRect();

    const lift = matches(MEDIA.wideDesktop)
      ? window.innerHeight - footerBox.bottom + FOOTER_TEXT_CLEARANCE
      : window.innerHeight - footerBox.top;

    button.style.setProperty('--lift', `${Math.max(0, lift)}px`);
  };

  const scheduleUpdate = throttleToFrame(update);

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  button.addEventListener('click', scrollToTop);
  update();
}
