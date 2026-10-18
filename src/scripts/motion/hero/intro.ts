import { whenBooted } from '@scripts/lib/boot';
import { gsap, selectAll } from '../gsap';

const INTRO = {
  sunRise: { yPercent: 60, duration: 2.2 },
  brand: { y: -8, duration: 0.6, at: 0.2 },
  eyebrow: { y: 12, duration: 0.8, at: 0.3 },
  title: { yPercent: 110, duration: 1, stagger: 0.12, at: 0.4 },
  copy: { y: 12, duration: 0.8, stagger: 0.1, at: 1 },
};

export function playIntro(hero: HTMLElement) {
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  intro
    .from(
      hero.querySelector('.scene__sun'),
      { yPercent: INTRO.sunRise.yPercent, opacity: 0, duration: INTRO.sunRise.duration },
      0,
    )
    .fromTo(
      '.site-header__brand',
      { y: INTRO.brand.y, opacity: 0 },
      { y: 0, opacity: 1, duration: INTRO.brand.duration, clearProps: 'opacity,transform' },
      INTRO.brand.at,
    )
    .from(
      selectAll('.eyebrow', hero),
      { y: INTRO.eyebrow.y, opacity: 0, duration: INTRO.eyebrow.duration },
      INTRO.eyebrow.at,
    )
    .from(
      selectAll('.hero__line-inner', hero),
      { yPercent: INTRO.title.yPercent, duration: INTRO.title.duration, stagger: INTRO.title.stagger },
      INTRO.title.at,
    )
    .from(
      selectAll('.hero__lede, .hero__meta', hero),
      { y: INTRO.copy.y, opacity: 0, duration: INTRO.copy.duration, stagger: INTRO.copy.stagger },
      INTRO.copy.at,
    );

  whenBooted(() => {
    intro.play();
  });
}
