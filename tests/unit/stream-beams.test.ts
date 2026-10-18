import { describe, expect, it } from 'vitest';
import { SKYLINE_HEIGHT, SKYLINE_WIDTH, TOWER_LAYERS, buildSkyline } from '@lib/skyline';
import { buildStreamBeams, pickBeamTowers, type Tower } from '@lib/stream-beams';

const MAX_BEAMS = 5;
const MIN_SPACING = 190;
const EDGE_MARGIN = 90;
const MIN_ROOF_Y = 60;

const frontTowers = (): Tower[] =>
  buildSkyline({ windowColor: '#FFFFFF', layers: [TOWER_LAYERS.near] }).layers[0].towers;

const centerOf = (tower: Tower) => tower.x + tower.width / 2;

describe('pickBeamTowers', () => {
  const picks = pickBeamTowers(frontTowers(), SKYLINE_WIDTH, SKYLINE_HEIGHT);

  it('picks at most five towers', () => {
    expect(picks.length).toBeGreaterThan(0);
    expect(picks.length).toBeLessThanOrEqual(MAX_BEAMS);
  });

  it('keeps the beams apart', () => {
    for (const [index, tower] of picks.entries()) {
      for (const other of picks.slice(index + 1)) {
        expect(Math.abs(centerOf(tower) - centerOf(other))).toBeGreaterThan(MIN_SPACING);
      }
    }
  });

  it('stays away from the edges', () => {
    for (const tower of picks) {
      expect(tower.x).toBeGreaterThanOrEqual(EDGE_MARGIN);
      expect(tower.x + tower.width).toBeLessThanOrEqual(SKYLINE_WIDTH - EDGE_MARGIN);
    }
  });

  it('skips roofs that a cropped skyline could cut off', () => {
    for (const tower of picks) expect(tower.roof).toBeGreaterThanOrEqual(MIN_ROOF_Y);
  });

  it('starts with the tower closest to the middle', () => {
    const [first] = picks;
    const middle = SKYLINE_WIDTH / 2;
    const closest = Math.min(...picks.map((tower) => Math.abs(centerOf(tower) - middle)));

    expect(Math.abs(centerOf(first) - middle)).toBe(closest);
  });
});

describe('buildStreamBeams', () => {
  it('builds the same beams every time', () => {
    expect(buildStreamBeams(frontTowers(), SKYLINE_WIDTH, SKYLINE_HEIGHT)).toEqual(
      buildStreamBeams(frontTowers(), SKYLINE_WIDTH, SKYLINE_HEIGHT),
    );
  });

  it('places each beam on the top of its roof', () => {
    const towers = frontTowers();
    const picks = pickBeamTowers(towers, SKYLINE_WIDTH, SKYLINE_HEIGHT);

    for (const [index, beam] of buildStreamBeams(towers, SKYLINE_WIDTH, SKYLINE_HEIGHT).entries()) {
      expect(beam.centerX).toBeGreaterThan(picks[index].roofLeft);
      expect(beam.centerX).toBeLessThan(picks[index].roofLeft + picks[index].roofWidth);
    }
  });

  it('rises each beam from its tower roof, with packets that start already moving', () => {
    const towers = frontTowers();
    const picks = pickBeamTowers(towers, SKYLINE_WIDTH, SKYLINE_HEIGHT);

    for (const [index, beam] of buildStreamBeams(towers, SKYLINE_WIDTH, SKYLINE_HEIGHT).entries()) {
      expect(beam.top + beam.height).toBeCloseTo(picks[index].roof);

      for (const packet of beam.packets) {
        expect(packet.startOffsetSeconds).toBeGreaterThanOrEqual(0);
        expect(packet.rise).toBeLessThan(beam.height);
      }
    }
  });
});
