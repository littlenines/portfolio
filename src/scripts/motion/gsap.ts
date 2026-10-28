import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { yieldToBrowser } from '@scripts/lib/dom';
import { MEDIA } from '@scripts/lib/media';

gsap.registerPlugin(ScrollTrigger);

export const selectAll = <T extends Element>(selector: string, scope: Element) =>
  gsap.utils.toArray<T>(selector, scope);

type MotionSetup = () => void | (() => void);

export function whenMotionAllowed(setup: (context: gsap.Context) => ReturnType<MotionSetup>) {
  gsap.matchMedia().add(MEDIA.motionOk, setup);
}

export function addInNextTask(context: gsap.Context, setup: MotionSetup): () => void {
  let isCancelled = false;

  void yieldToBrowser().then(() => {
    if (!isCancelled) context.add(setup);
  });

  return () => {
    isCancelled = true;
  };
}

export { gsap, ScrollTrigger };
