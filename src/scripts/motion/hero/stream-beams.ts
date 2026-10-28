import { createAmbientClock, type AmbientClock } from '../ambient-clock';
import { addInNextTask, gsap, selectAll } from '../gsap';

const FRAMES_PER_SECOND = 30;
const PEAK_OPACITY = 0.7;
const FADE_IN_SHARE = 0.04;

export interface StreamBeams {
  setRunning: (shouldRun: boolean) => void;
  kill: () => void;
}

function addPackets(clock: AmbientClock, hero: HTMLElement): boolean {
  const packets = selectAll<SVGRectElement>('[data-stream-packet]', hero);

  for (const packet of packets) {
    const rise = Number(packet.dataset.rise);
    const duration = Number(packet.dataset.duration);
    const fadeIn = duration * FADE_IN_SHARE;

    const climb = gsap
      .timeline({ paused: true, repeat: -1 })
      .fromTo(packet, { y: 0 }, { y: -rise, duration, ease: 'none' }, 0)
      .fromTo(packet, { opacity: 0 }, { opacity: PEAK_OPACITY, duration: fadeIn, ease: 'none' }, 0)
      .to(packet, { opacity: 0, duration: duration - fadeIn, ease: 'none' }, fadeIn);

    clock.add(climb, Number(packet.dataset.startOffset));
  }

  return packets.length > 0;
}

export function createStreamBeams(hero: HTMLElement, context: gsap.Context): StreamBeams {
  const clock = createAmbientClock(FRAMES_PER_SECOND);
  let isWanted = false;
  let hasPackets = false;
  let cancelSetup: (() => void) | undefined;

  return {
    setRunning: (shouldRun) => {
      isWanted = shouldRun;

      if (shouldRun) {
        cancelSetup ??= addInNextTask(context, () => {
          hasPackets = addPackets(clock, hero);
          clock.setRunning(isWanted && hasPackets);
        });
      }

      clock.setRunning(shouldRun && hasPackets);
    },

    kill: () => {
      cancelSetup?.();
      clock.kill();
    },
  };
}
