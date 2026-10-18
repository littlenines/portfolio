import { isOdd } from '@lib/math';
import type { AmbientClock } from '../ambient-clock';
import { gsap, selectAll } from '../gsap';

const BEACON_PULSE = { opacity: 0.1, duration: 1.2, maxDelay: 2 };
const WINDOW_BREATH = { count: 40, minOpacity: 0.12, maxOpacity: 0.4, minDuration: 1.6, maxDuration: 4, maxDelay: 3 };
const HAZE_DRIFT = { distance: 70, duration: 38, durationStep: 8 };

const LOOP = { repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true } as const;

export function addAmbientLoops(clock: AmbientClock, hero: HTMLElement) {
  for (const beacon of selectAll('.skyline__beacon', hero)) {
    clock.add(
      gsap.to(beacon, { ...LOOP, opacity: BEACON_PULSE.opacity, duration: BEACON_PULSE.duration }),
      -gsap.utils.random(0, BEACON_PULSE.maxDelay),
    );
  }

  const litWindows = selectAll('.skyline__lit .skyline__window', hero);

  for (const litWindow of gsap.utils.shuffle(litWindows).slice(0, WINDOW_BREATH.count)) {
    clock.add(
      gsap.to(litWindow, {
        ...LOOP,
        opacity: gsap.utils.random(WINDOW_BREATH.minOpacity, WINDOW_BREATH.maxOpacity),
        duration: gsap.utils.random(WINDOW_BREATH.minDuration, WINDOW_BREATH.maxDuration),
      }),
      -gsap.utils.random(0, WINDOW_BREATH.maxDelay),
    );
  }

  for (const [index, haze] of selectAll('.skyline__haze', hero).entries()) {
    clock.add(
      gsap.to(haze, {
        ...LOOP,
        x: isOdd(index) ? -HAZE_DRIFT.distance : HAZE_DRIFT.distance,
        duration: HAZE_DRIFT.duration + index * HAZE_DRIFT.durationStep,
      }),
    );
  }
}
