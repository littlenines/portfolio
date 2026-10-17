export type Rgb = [red: number, green: number, blue: number];

export function throttleToFrame(callback: () => void) {
  let frame = 0;

  return () => {
    if (frame) return;

    frame = requestAnimationFrame(() => {
      frame = 0;
      callback();
    });
  };
}

export function onVisibilityChange(
  element: Element,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit,
): () => void {
  if (!('IntersectionObserver' in window)) {
    callback(true);

    return () => {};
  }

  const observer = new IntersectionObserver(([entry]) => callback(entry.intersectionRatio > 0), options);

  observer.observe(element);

  return () => observer.disconnect();
}

export function readRgbToken(name: string, element: Element = document.documentElement): Rgb {
  const [red = 0, green = 0, blue = 0] = getComputedStyle(element)
    .getPropertyValue(name)
    .split(',')
    .map((channel) => Number(channel.trim()));

  return [red, green, blue];
}

export const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb =>
  from.map((channel, index) => channel + (to[index] - channel) * amount) as Rgb;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const rgbToHex = (rgb: Rgb) =>
  `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

export const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
