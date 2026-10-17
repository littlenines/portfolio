import { gsap, whenMotionAllowed } from './gsap';

const REVEAL = { y: 24, duration: 0.9, start: 'top 90%' };
const RULE = { duration: 1.1, start: 'top 92%' };

export function initReveals() {
  whenMotionAllowed(() => {
    for (const element of gsap.utils.toArray<HTMLElement>('[data-reveal]')) {
      gsap.from(element, {
        y: REVEAL.y,
        opacity: 0,
        duration: REVEAL.duration,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: REVEAL.start, once: true },
      });
    }

    for (const rule of gsap.utils.toArray<HTMLElement>('.section-label__rule')) {
      gsap.from(rule, {
        scaleX: 0,
        duration: RULE.duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: rule, start: RULE.start, once: true },
      });
    }
  });
}
