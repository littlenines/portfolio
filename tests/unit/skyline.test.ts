import { describe, expect, it } from 'vitest';
import { SKYLINE_WIDTH, TOWER_LAYERS, buildSkyline, type SkylineOptions } from '@lib/skyline';
import { SKYLINE_VARIANTS } from '@lib/skyline-variants';

const OPTIONS: SkylineOptions = {
  windowColor: '#FFFFFF',
  layers: [TOWER_LAYERS.far, TOWER_LAYERS.mid, TOWER_LAYERS.near],
};

const shapesOf = (options: SkylineOptions) => buildSkyline(options).layers.map((layer) => layer.shapes);

describe('buildSkyline', () => {
  it('builds the same skyline every time, lights included', () => {
    expect(buildSkyline(SKYLINE_VARIANTS.home)).toEqual(buildSkyline(SKYLINE_VARIANTS.home));
  });

  it('builds different towers for a different seed', () => {
    expect(shapesOf({ ...OPTIONS, seed: 99 })).not.toEqual(shapesOf(OPTIONS));
  });

  it('builds one layer per option, in order, with its colour', () => {
    const skyline = buildSkyline(OPTIONS);

    expect(skyline.layers.map((layer) => layer.color)).toEqual(OPTIONS.layers.map((layer) => layer.color));
  });

  it('covers the full width of the skyline', () => {
    for (const layer of buildSkyline(OPTIONS).layers) {
      const rightEdge = Math.max(...layer.shapes.map((shape) => shape.x + shape.width));
      const leftEdge = Math.min(...layer.shapes.map((shape) => shape.x));

      expect(leftEdge).toBeLessThanOrEqual(0);
      expect(rightEdge).toBeGreaterThanOrEqual(SKYLINE_WIDTH);
    }
  });
});
