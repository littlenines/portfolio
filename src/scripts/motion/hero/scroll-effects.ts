import { gsap, selectAll } from '../gsap';

const SCROLL_DEPTH = { sun: 150, stars: -60, copy: -40 };
const AWAKE_OPACITY = { min: 0.5, max: 0.95 };
const AWAKE_SWITCH = { duration: 0.08, spread: 1, end: 'bottom 45%' };

export function addScrollEffects(hero: HTMLElement) {
  const acrossHero = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };

  gsap.to(hero.querySelector('.scene__sun'), { y: SCROLL_DEPTH.sun, ease: 'none', scrollTrigger: acrossHero });
  gsap.to(selectAll('.scene__stars', hero), { y: SCROLL_DEPTH.stars, ease: 'none', scrollTrigger: acrossHero });
  gsap.to(selectAll('.hero__copy', hero), { y: SCROLL_DEPTH.copy, ease: 'none', scrollTrigger: acrossHero });

  const awakeWindows = selectAll<SVGRectElement>('.skyline__awake .skyline__window', hero);

  gsap.to(awakeWindows, {
    opacity: () => gsap.utils.random(AWAKE_OPACITY.min, AWAKE_OPACITY.max),
    duration: AWAKE_SWITCH.duration,
    ease: 'none',
    stagger: { amount: AWAKE_SWITCH.spread, from: 'random' },
    scrollTrigger: { trigger: hero, start: 'top top', end: AWAKE_SWITCH.end, scrub: true },
  });
}
