import { roundTo, type SeededRandom } from './rng';

export const WINDOW = {
  width: 3,
  height: 4,
  columnStep: 8,
  rowStep: 10,
  insetLeft: 6,
  insetRight: 8,
  insetTop: 12,
  insetBottom: 16,
  minOpacity: 0.45,
  opacityRange: 0.4,
  awakeOpacity: 0.6,
  maxSwitchDelay: 1.4,
  flickerEvery: 3,
  maxFlickerDelay: 3,
} as const;

const SECONDS_PRECISION = 2;
const OPACITY_PRECISION = 2;

export interface WindowLight {
  x: number;
  y: number;
  opacity: number;
  afterDark: boolean;
  switchDelay?: number;
  flickerDelay?: number;
}

export interface WindowLightingOptions {
  shapeRandom: SeededRandom;
  awakeRandom: SeededRandom;
  afterDarkShare: number;
  skylineHeight: number;
}

export interface WindowLighting {
  lit: (x: number, top: number, width: number, chance: number, flicker: boolean) => WindowLight[];
  awake: (x: number, top: number, width: number, chance: number) => WindowLight[];
}

const seconds = (value: number) => Number(value.toFixed(SECONDS_PRECISION));

export function createWindowLighting({
  shapeRandom,
  awakeRandom,
  afterDarkShare,
  skylineHeight,
}: WindowLightingOptions): WindowLighting {
  const isAfterDark = () => Math.random() < afterDarkShare;
  
  const switchDelay = () => seconds(Math.random() * WINDOW.maxSwitchDelay);
  let litCount = 0;

  function* windowSlots(x: number, top: number, width: number) {
    for (let y = top + WINDOW.insetTop; y < skylineHeight - WINDOW.insetBottom; y += WINDOW.rowStep) {
      for (let column = x + WINDOW.insetLeft; column < x + width - WINDOW.insetRight; column += WINDOW.columnStep) {
        yield { x: roundTo(column), y: roundTo(y) };
      }
    }
  }

  const lit: WindowLighting['lit'] = (x, top, width, chance, flicker) => {
    const lights: WindowLight[] = [];

    for (const slot of windowSlots(x, top, width)) {
      if (shapeRandom.next() >= chance) continue;

      const opacity = Number((WINDOW.minOpacity + shapeRandom.next() * WINDOW.opacityRange).toFixed(OPACITY_PRECISION));
      const afterDark = isAfterDark();
      const light: WindowLight = { ...slot, opacity, afterDark };

      if (afterDark) light.switchDelay = switchDelay();

      if (flicker && litCount++ % WINDOW.flickerEvery === 0) {
        light.flickerDelay = seconds(shapeRandom.next() * WINDOW.maxFlickerDelay);
      }

      lights.push(light);
    }

    return lights;
  };

  const awake: WindowLighting['awake'] = (x, top, width, chance) => {
    const lights: WindowLight[] = [];

    for (const slot of windowSlots(x, top, width)) {
      if (awakeRandom.next() >= chance) continue;

      const afterDark = isAfterDark();

      lights.push({
        ...slot,
        opacity: WINDOW.awakeOpacity,
        afterDark,
        switchDelay: afterDark ? switchDelay() : undefined,
      });
    }

    return lights;
  };

  return { lit, awake };
}
