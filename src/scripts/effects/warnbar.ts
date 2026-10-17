const MOSTLY_VISIBLE = 0.6;

export function initWarnbar(bar: HTMLElement) {
  if (!('IntersectionObserver' in window)) {
    bar.classList.add('is-in');

    return;
  }

  new IntersectionObserver(
    ([entry]) => {
      bar.classList.toggle('is-paused', !entry.isIntersecting);

      if (entry.isIntersecting) bar.classList.add('is-in');
    },
    { threshold: MOSTLY_VISIBLE },
  ).observe(bar);
}
