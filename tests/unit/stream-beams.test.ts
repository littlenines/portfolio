import { describe, expect, it } from 'vitest';
import { SKYLINE_HEIGHT, SKYLINE_WIDTH, buildSkyline, type Tower } from '@lib/skyline';
import { SKYLINE_VARIANTS } from '@lib/skyline-variants';
import { buildStreamBeams, pickBeamTowers } from '@lib/stream-beams';

const MAX_BEAMS = 5;
const MIN_SPACING = 140;
const EDGE_MARGIN = 90;
const MIN_ROOF_Y = 60;
// The middle of the skyline a 360px phone shows
const PHONE_BAND_WIDTH = 340;
const PHONE_BEAMS = 2;

const frontTowers = (): Tower[] => buildSkyline(SKYLINE_VARIANTS.home).layers.at(-1)?.towers ?? [];

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

  it('puts two beams in the middle that a phone shows', () => {
    const beams = buildStreamBeams(frontTowers(), SKYLINE_WIDTH, SKYLINE_HEIGHT);
    const middle = SKYLINE_WIDTH / 2;
    const onPhone = beams.filter((beam) => Math.abs(beam.centerX - middle) <= PHONE_BAND_WIDTH / 2);

    expect(onPhone.length).toBeGreaterThanOrEqual(PHONE_BEAMS);
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

  it('centres the beam on the top tier of a stepped tower', () => {
    const towers = frontTowers();
    const picks = pickBeamTowers(towers, SKYLINE_WIDTH, SKYLINE_HEIGHT);
    const beams = buildStreamBeams(towers, SKYLINE_WIDTH, SKYLINE_HEIGHT);

    const stepped = picks.flatMap((tower, index) =>
      tower.roofWidth < tower.width ? [{ tower, beam: beams[index] }] : [],
    );

    expect(stepped.length).toBeGreaterThan(0);

    for (const { tower, beam } of stepped) expect(beam.centerX).toBeCloseTo(tower.roofLeft + tower.roofWidth / 2, 0);
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
