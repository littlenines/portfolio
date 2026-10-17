// Mirrors the lg breakpoint in styles/abstracts/_variables.scss
const DESKTOP_MIN_WIDTH_PX = 1280;
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

export const MEDIA = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  finePointer: FINE_POINTER,
  wideDesktop: `(min-width: ${DESKTOP_MIN_WIDTH_PX}px) and ${FINE_POINTER}`,
} as const;

export const matches = (query: string) => window.matchMedia(query).matches;
export const prefersReducedMotion = () => matches(MEDIA.reducedMotion);
