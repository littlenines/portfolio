import { PALETTE } from './palette';
import { TOWER_LAYERS, type LayerOptions } from './skyline';

export type SkylineVariant = 'home' | 'lost';

export interface SkylineVariantOptions {
  windowColor: string;
  afterDarkShare: number;
  streamBeams: boolean;
  layers: LayerOptions[];
}

export const SKYLINE_VARIANTS: Record<SkylineVariant, SkylineVariantOptions> = {
  home: {
    windowColor: PALETTE.peach,
    afterDarkShare: 0.5,
    streamBeams: true,
    layers: [
      { ...TOWER_LAYERS.far, haze: { cy: 205, rx: 540, ry: 46, centers: [300, 1050] } },
      {
        ...TOWER_LAYERS.mid,
        litChance: 0.02,
        awakeChance: 0.08,
        beacons: true,
        haze: { cy: 238, rx: 500, ry: 34, centers: [520, 1250] },
      },
      { ...TOWER_LAYERS.near, litChance: 0.05, awakeChance: 0.14, megaTowers: true, neon: true, beacons: true },
    ],
  },
  lost: {
    windowColor: PALETTE.windowGlow,
    afterDarkShare: 0,
    streamBeams: false,
    layers: [
      TOWER_LAYERS.far,
      { ...TOWER_LAYERS.mid, litChance: 0.04, flicker: true },
      { ...TOWER_LAYERS.near, litChance: 0.07, flicker: true },
    ],
  },
};
