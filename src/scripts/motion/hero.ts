import { whenBooted } from '@scripts/lib/boot';
import { onVisibilityChange } from '@scripts/lib/dom';
import { gsap, whenMotionAllowed } from './gsap';

const INTRO = {
  sunRise: { yPercent: 60, duration: 2.2 },
  brand: { y: -8, duration: 0.6, at: 0.2 },
  eyebrow: { y: 12, duration: 0.8, at: 0.3 },
  title: { yPercent: 110, duration: 1, stagger: 0.12, at: 0.4 },
  copy: { y: 12, duration: 0.8, stagger: 0.1, at: 1 },
};

const SCROLL_DEPTH = { sun: 150, stars: -60, copy: -40 };
const AWAKE_OPACITY = { min: 0.5, max: 0.95 };
// Each window switches on over a short slice of the scroll, so only a few change in any one frame
const AWAKE_SWITCH = { duration: 0.08, spread: 1 };

const BEACON_PULSE = { opacity: 0.1, duration: 1.2, maxDelay: 2 };
const WINDOW_BREATH = { count: 40, minOpacity: 0.12, maxOpacity: 0.4, minDuration: 1.6, maxDuration: 4, maxDelay: 3 };
const HAZE_DRIFT = { distance: 70, duration: 38, durationStep: 8 };
const SCROLL_IDLE_MS = 200;

const METEOR = {
  firstDelay: 4,
  minInterval: 7,
  maxInterval: 12,
  minStartX: 0.1,
  maxStartX: 0.75,
  minStartY: 40,
  maxStartY: 200,
  angle: 27,
  travelX: 280,
  travelY: 140,
  fadeIn: 0.15,
  flight: 1.1,
  fadeOutAt: 0.7,
  fadeOut: 0.5,
};

export function initHeroMotion() {
  const hero = document.querySelector<HTMLElement>('.hero');

  if (!hero) return;

  const select = <T extends Element>(selector: string) => gsap.utils.toArray<T>(selector, hero);
  const sun = hero.querySelector('.scene__sun');
  const meteor = hero.querySelector('.scene__meteor');
  const litWindows = select<SVGRectElement>('.skyline__lit .skyline__window');
  const awakeWindows = select<SVGRectElement>('.skyline__awake .skyline__window');
  const beacons = select<SVGCircleElement>('.skyline__beacon');
  const hazes = select<SVGGElement>('.skyline__haze');

  whenMotionAllowed(() => {
    const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    intro
      .from(sun, { yPercent: INTRO.sunRise.yPercent, opacity: 0, duration: INTRO.sunRise.duration }, 0)
      .fromTo(
        '.site-header__brand',
        { y: INTRO.brand.y, opacity: 0 },
        { y: 0, opacity: 1, duration: INTRO.brand.duration, clearProps: 'opacity,transform' },
        INTRO.brand.at,
      )
      .from(select('.eyebrow'), { y: INTRO.eyebrow.y, opacity: 0, duration: INTRO.eyebrow.duration }, INTRO.eyebrow.at)
      .from(
        select('.hero__line-inner'),
        { yPercent: INTRO.title.yPercent, duration: INTRO.title.duration, stagger: INTRO.title.stagger },
        INTRO.title.at,
      )
      .from(
        select('.hero__lede, .hero__meta'),
        { y: INTRO.copy.y, opacity: 0, duration: INTRO.copy.duration, stagger: INTRO.copy.stagger },
        INTRO.copy.at,
      );

    whenBooted(() => intro.play());

    const acrossHero = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };

    gsap.to(sun, { y: SCROLL_DEPTH.sun, ease: 'none', scrollTrigger: acrossHero });
    gsap.to(select('.scene__stars'), { y: SCROLL_DEPTH.stars, ease: 'none', scrollTrigger: acrossHero });
    gsap.to(select('.hero__copy'), { y: SCROLL_DEPTH.copy, ease: 'none', scrollTrigger: acrossHero });

    gsap.set(awakeWindows, { opacity: 0 });

    gsap.to(awakeWindows, {
      opacity: () => gsap.utils.random(AWAKE_OPACITY.min, AWAKE_OPACITY.max),
      duration: AWAKE_SWITCH.duration,
      ease: 'none',
      stagger: { amount: AWAKE_SWITCH.spread, from: 'random' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 45%', scrub: true },
    });

    const loops: gsap.core.Animation[] = [];
    let isHeroActive = true;

    for (const beacon of beacons) {
      loops.push(
        gsap.to(beacon, {
          opacity: BEACON_PULSE.opacity,
          duration: BEACON_PULSE.duration,
          delay: gsap.utils.random(0, BEACON_PULSE.maxDelay),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }),
      );
    }

    for (const litWindow of gsap.utils.shuffle([...litWindows]).slice(0, WINDOW_BREATH.count)) {
      loops.push(
        gsap.to(litWindow, {
          opacity: gsap.utils.random(WINDOW_BREATH.minOpacity, WINDOW_BREATH.maxOpacity),
          duration: gsap.utils.random(WINDOW_BREATH.minDuration, WINDOW_BREATH.maxDuration),
          delay: gsap.utils.random(0, WINDOW_BREATH.maxDelay),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }),
      );
    }

    for (const [index, haze] of hazes.entries()) {
      loops.push(
        gsap.to(haze, {
          x: index % 2 ? -HAZE_DRIFT.distance : HAZE_DRIFT.distance,
          duration: HAZE_DRIFT.duration + index * HAZE_DRIFT.durationStep,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }),
      );
    }

    let nextMeteor: gsap.core.Tween | undefined;
    let meteorFlight: gsap.core.Timeline | undefined;

    const scheduleMeteor = (delay: number) => {
      nextMeteor = gsap.delayedCall(delay, shootMeteor);
      nextMeteor.paused(!isHeroActive);
    };

    const shootMeteor = () => {
      if (!meteor) return;

      const startX = gsap.utils.random(hero.clientWidth * METEOR.minStartX, hero.clientWidth * METEOR.maxStartX);
      const startY = gsap.utils.random(METEOR.minStartY, METEOR.maxStartY);

      gsap.set(meteor, { x: startX, y: startY, rotation: METEOR.angle, transformOrigin: '100% 50%', opacity: 0 });

      meteorFlight = gsap
        .timeline({ onComplete: () => scheduleMeteor(gsap.utils.random(METEOR.minInterval, METEOR.maxInterval)) })
        .to(meteor, { opacity: 1, duration: METEOR.fadeIn }, 0)
        .to(
          meteor,
          { x: startX + METEOR.travelX, y: startY + METEOR.travelY, duration: METEOR.flight, ease: 'power1.in' },
          0,
        )
        .to(meteor, { opacity: 0, duration: METEOR.fadeOut }, METEOR.fadeOutAt);
    };

    scheduleMeteor(METEOR.firstDelay);

    let isHeroVisible = true;
    let isScrolling = false;
    let scrollIdleTimer = 0;

    const syncLoops = () => {
      isHeroActive = isHeroVisible && !document.hidden && !isScrolling;

      for (const loop of loops) loop.paused(!isHeroActive);

      nextMeteor?.paused(!isHeroActive);
    };

    // Every loop repaints the whole skyline SVG, which makes scrolling stutter on phones
    const pauseWhileScrolling = () => {
      if (!isScrolling) {
        isScrolling = true;
        syncLoops();
      }

      window.clearTimeout(scrollIdleTimer);

      scrollIdleTimer = window.setTimeout(() => {
        isScrolling = false;
        syncLoops();
      }, SCROLL_IDLE_MS);
    };

    const stopWatchingHero = onVisibilityChange(hero, (isVisible) => {
      isHeroVisible = isVisible;
      syncLoops();
    });

    document.addEventListener('visibilitychange', syncLoops);
    window.addEventListener('scroll', pauseWhileScrolling, { passive: true });

    // The meteor is created after setup, outside GSAP's context, so it has to be cleaned up by hand
    return () => {
      nextMeteor?.kill();
      meteorFlight?.kill();

      if (meteor) gsap.set(meteor, { clearProps: 'all' });

      stopWatchingHero();
      document.removeEventListener('visibilitychange', syncLoops);
      window.removeEventListener('scroll', pauseWhileScrolling);
      window.clearTimeout(scrollIdleTimer);
    };
  });
}
