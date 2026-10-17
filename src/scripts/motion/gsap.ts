import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@scripts/lib/media';

gsap.registerPlugin(ScrollTrigger);

export function whenMotionAllowed(setup: () => void | (() => void)) {
  gsap.matchMedia().add(MEDIA.motionOk, setup);
}

export { gsap, ScrollTrigger };
