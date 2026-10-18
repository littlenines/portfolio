import type { AmbientClock } from '../ambient-clock';
import { gsap, selectAll } from '../gsap';

const PEAK_OPACITY = 0.7;
const FADE_IN_SHARE = 0.04;

export function addStreamBeamPackets(clock: AmbientClock, hero: HTMLElement): boolean {
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
