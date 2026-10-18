export type Rgb = [red: number, green: number, blue: number];

const HEX_RADIX = 16;
const HEX_DIGITS = 2;

export function readRgbToken(name: string, element: Element = document.documentElement): Rgb {
  const [red = 0, green = 0, blue = 0] = getComputedStyle(element)
    .getPropertyValue(name)
    .split(',')
    .map((channel) => Number(channel.trim()));

  return [red, green, blue];
}

export const mixRgb = (start: Rgb, end: Rgb, amount: number): Rgb =>
  start.map((channel, index) => channel + (end[index] - channel) * amount) as Rgb;

export const rgbToHex = (rgb: Rgb) =>
  `#${rgb.map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(HEX_DIGITS, '0')).join('')}`;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
