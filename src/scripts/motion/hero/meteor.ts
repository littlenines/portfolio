import { gsap } from '../gsap';

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

export interface MeteorShower {
  setActive: (isActive: boolean) => void;
  kill: () => void;
}

export function createMeteorShower(hero: HTMLElement): MeteorShower {
  const meteor = hero.querySelector('.scene__meteor');
  let nextMeteor: gsap.core.Tween | undefined;
  let flight: gsap.core.Timeline | undefined;
  let isActive = false;

  const schedule = (delay: number) => {
    nextMeteor = gsap.delayedCall(delay, shoot);
    nextMeteor.paused(!isActive);
  };

  const shoot = () => {
    if (!meteor) return;

    const startX = gsap.utils.random(hero.clientWidth * METEOR.minStartX, hero.clientWidth * METEOR.maxStartX);
    const startY = gsap.utils.random(METEOR.minStartY, METEOR.maxStartY);

    gsap.set(meteor, { x: startX, y: startY, rotation: METEOR.angle, transformOrigin: '100% 50%', opacity: 0 });

    flight = gsap
      .timeline({ onComplete: () => schedule(gsap.utils.random(METEOR.minInterval, METEOR.maxInterval)) })
      .to(meteor, { opacity: 1, duration: METEOR.fadeIn }, 0)
      .to(
        meteor,
        { x: startX + METEOR.travelX, y: startY + METEOR.travelY, duration: METEOR.flight, ease: 'power1.in' },
        0,
      )
      .to(meteor, { opacity: 0, duration: METEOR.fadeOut }, METEOR.fadeOutAt);
  };

  schedule(METEOR.firstDelay);

  return {
    setActive: (shouldRun) => {
      isActive = shouldRun;
      nextMeteor?.paused(!shouldRun);
    },

    kill: () => {
      nextMeteor?.kill();
      flight?.kill();

      if (meteor) gsap.set(meteor, { clearProps: 'all' });
    },
  };
}
