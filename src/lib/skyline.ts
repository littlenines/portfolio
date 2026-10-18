import { PALETTE } from './palette';
import { createSeededRandom, roundTo } from './rng';
import { WINDOW, createWindowLighting, type WindowLight } from './skyline-windows';
import type { Tower } from './stream-beams';

export const SKYLINE_WIDTH = 1600;
export const SKYLINE_HEIGHT = 300;

const EDGE_OVERHANG = 20;

const VALLEY = { depth: 0.5, spread: 240 } as const;

const SETBACK = {
  chance: [0.3, 0.55],
  minTiers: 2,
  extraTiers: 2,
  shrink: 0.74,
  minHeight: 14,
  maxHeight: 30,
} as const;

const ANTENNA = {
  chance: [0.55, 0.75],
  width: 2,
  minLength: 26,
  maxLength: 64,
  beaconChance: 0.55,
  beaconLift: 2,
} as const;

const ROOF_BLOCK = {
  chance: [0.75, 0.9],
  overhang: 3,
  slabHeight: 6,
  boxOffset: 0.2,
  boxWidth: 0.3,
  boxRise: 14,
  boxHeight: 9,
} as const;
const MEGA_TOWER = { chanceAbove: 0.9, minWidth: 130, maxWidth: 190 } as const;
const NEON = { minTowerHeight: 120, chance: 0.22, inset: 4, top: 14, width: 2, minLength: 40, maxLength: 100 } as const;

const SEAM = 1;
const BASE_BLEED = 2;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Beacon {
  cx: number;
  cy: number;
}
export interface Haze {
  cy: number;
  rx: number;
  ry: number;
  centers: number[];
}

export interface LayerOptions {
  color: string;
  opacity: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  minGap: number;
  maxGap: number;
  litChance?: number;
  awakeChance?: number;
  beacons?: boolean;
  neon?: boolean;
  megaTowers?: boolean;
  flicker?: boolean;
  haze?: Haze;
}

export interface Layer {
  color: string;
  opacity: number;
  shapes: Box[];
  lit: WindowLight[];
  awake: WindowLight[];
  beacons: Beacon[];
  neon: Box[];
  towers: Tower[];
  haze?: Haze;
}

export interface SkylineOptions {
  layers: LayerOptions[];
  windowColor: string;
  afterDarkShare?: number;
  seed?: number;
  awakeSeed?: number;
}

const DEFAULT_SEED = 11;
const DEFAULT_AWAKE_SEED = 7;

const inRange = (value: number, [min, max]: readonly [number, number]) => value > min && value <= max;

export function buildSkyline({
  layers,
  windowColor,
  afterDarkShare = 0,
  seed = DEFAULT_SEED,
  awakeSeed = DEFAULT_AWAKE_SEED,
}: SkylineOptions) {
  const shapeRandom = createSeededRandom(seed);
  const awakeRandom = createSeededRandom(awakeSeed);
  const windows = createWindowLighting({ shapeRandom, awakeRandom, afterDarkShare, skylineHeight: SKYLINE_HEIGHT });
  const valley = (x: number) => 1 - VALLEY.depth * Math.exp(-(((x - SKYLINE_WIDTH / 2) / VALLEY.spread) ** 2));

  const buildLayer = (options: LayerOptions): Layer => {
    const { next: random, between } = shapeRandom;

    const layer: Layer = {
      color: options.color,
      opacity: options.opacity,
      shapes: [],
      lit: [],
      awake: [],
      beacons: [],
      neon: [],
      towers: [],
      haze: options.haze,
    };

    const addShape = (x: number, y: number, width: number, height: number) =>
      layer.shapes.push({ x: roundTo(x), y: roundTo(y), width: roundTo(width), height: roundTo(height) });

    let x = -EDGE_OVERHANG;

    while (x < SKYLINE_WIDTH + EDGE_OVERHANG) {
      let width = between(options.minWidth, options.maxWidth);
      const kind = random();
      const isMega = (options.megaTowers ?? false) && kind > MEGA_TOWER.chanceAbove;

      if (isMega) width = between(MEGA_TOWER.minWidth, MEGA_TOWER.maxWidth);

      const height = between(options.minHeight, options.maxHeight) * valley(x + width / 2);
      const top = SKYLINE_HEIGHT - height;

      addShape(x, top, width, height + BASE_BLEED);

      let roof = top;
      let roofLeft = x;
      let roofWidth = width;

      if (isMega || inRange(kind, SETBACK.chance)) {
        const tiers = SETBACK.minTiers + Math.floor(random() * SETBACK.extraTiers);
        let tierWidth = width;
        let tierTop = top;

        for (let tier = 0; tier < tiers; tier++) {
          tierWidth *= SETBACK.shrink;

          const tierHeight = between(SETBACK.minHeight, SETBACK.maxHeight);

          tierTop -= tierHeight;
          addShape(x + (width - tierWidth) / 2, tierTop, tierWidth, tierHeight + SEAM);
        }

        roof = tierTop;
        roofLeft = x + (width - tierWidth) / 2;
        roofWidth = tierWidth;
      } else if (inRange(kind, ANTENNA.chance)) {
        const length = between(ANTENNA.minLength, ANTENNA.maxLength);

        addShape(x + width / 2 - ANTENNA.width / 2, top - length, ANTENNA.width, length + SEAM);

        if (options.beacons && random() > 1 - ANTENNA.beaconChance) {
          layer.beacons.push({ cx: roundTo(x + width / 2), cy: roundTo(top - length - ANTENNA.beaconLift) });
        }
      } else if (inRange(kind, ROOF_BLOCK.chance)) {
        roof = top - ROOF_BLOCK.slabHeight;

        addShape(
          x - ROOF_BLOCK.overhang,
          top - ROOF_BLOCK.slabHeight,
          width + ROOF_BLOCK.overhang * 2,
          ROOF_BLOCK.slabHeight,
        );

        addShape(
          x + width * ROOF_BLOCK.boxOffset,
          top - ROOF_BLOCK.boxRise,
          width * ROOF_BLOCK.boxWidth,
          ROOF_BLOCK.boxHeight,
        );
      }

      layer.towers.push({
        x: roundTo(x),
        width: roundTo(width),
        roof: roundTo(roof),
        roofLeft: roundTo(roofLeft),
        roofWidth: roundTo(roofWidth),
      });

      if (options.litChance) layer.lit.push(...windows.lit(x, top, width, options.litChance, options.flicker ?? false));

      if (options.awakeChance) layer.awake.push(...windows.awake(x, top, width, options.awakeChance));

      if (options.neon && height > NEON.minTowerHeight && random() > 1 - NEON.chance) {
        layer.neon.push({
          x: roundTo(x + width - NEON.inset),
          y: roundTo(top + NEON.top),
          width: NEON.width,
          height: roundTo(between(NEON.minLength, NEON.maxLength)),
        });
      }

      x += width + between(options.minGap, options.maxGap);
    }

    return layer;
  };

  return {
    width: SKYLINE_WIDTH,
    height: SKYLINE_HEIGHT,
    windowColor,
    windowSize: { width: WINDOW.width, height: WINDOW.height },
    layers: layers.map(buildLayer),
  };
}

export type Skyline = ReturnType<typeof buildSkyline>;

export const TOWER_LAYERS = {
  far: {
    color: PALETTE.towerFar,
    opacity: 0.5,
    minWidth: 30,
    maxWidth: 70,
    minHeight: 90,
    maxHeight: 210,
    minGap: 0,
    maxGap: 10,
  },
  mid: {
    color: PALETTE.towerMid,
    opacity: 1,
    minWidth: 40,
    maxWidth: 90,
    minHeight: 80,
    maxHeight: 220,
    minGap: 0,
    maxGap: 14,
  },
  near: {
    color: PALETTE.ground,
    opacity: 1,
    minWidth: 36,
    maxWidth: 100,
    minHeight: 50,
    maxHeight: 250,
    minGap: 0,
    maxGap: 18,
  },
} satisfies Record<string, LayerOptions>;
