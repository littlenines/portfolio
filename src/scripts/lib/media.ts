export const MEDIA = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

export const matches = (query: string) => window.matchMedia(query).matches;
export const prefersReducedMotion = () => matches(MEDIA.reducedMotion);
