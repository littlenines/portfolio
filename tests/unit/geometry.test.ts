import { describe, expect, it } from 'vitest';
import { hexagonCorners, pointOnCircle } from '@lib/geometry';

const CENTER = { x: 10, y: 20 };
const RADIUS = 5;

describe('pointOnCircle', () => {
  it('measures angles clockwise from the right, as SVG does', () => {
    const right = pointOnCircle(CENTER, RADIUS, 0);
    const below = pointOnCircle(CENTER, RADIUS, 90);

    expect(right.x).toBeCloseTo(15);
    expect(right.y).toBeCloseTo(20);
    expect(below.x).toBeCloseTo(10);
    expect(below.y).toBeCloseTo(25);
  });
});

describe('hexagonCorners', () => {
  const corners = hexagonCorners(CENTER, RADIUS);

  it('returns six corners on the circle', () => {
    expect(corners).toHaveLength(6);

    for (const corner of corners) expect(Math.hypot(corner.x - CENTER.x, corner.y - CENTER.y)).toBeCloseTo(RADIUS);
  });

  it('points up and down', () => {
    const heights = corners.map((corner) => corner.y);

    expect(Math.min(...heights)).toBeCloseTo(CENTER.y - RADIUS);
    expect(Math.max(...heights)).toBeCloseTo(CENTER.y + RADIUS);
  });
});
