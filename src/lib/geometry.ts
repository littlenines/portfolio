import { toRadians } from './math';

const FULL_TURN = 360;
const HEXAGON_SIDES = 6;
const POINTY_TOP_OFFSET = -30;

export interface Point {
  x: number;
  y: number;
}

export interface Box extends Point {
  width: number;
  height: number;
}

export function pointOnCircle(center: Point, radius: number, degrees: number): Point {
  const angle = toRadians(degrees);

  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

export const hexagonCorners = (center: Point, radius: number): Point[] =>
  Array.from({ length: HEXAGON_SIDES }, (_, side) =>
    pointOnCircle(center, radius, (FULL_TURN / HEXAGON_SIDES) * side + POINTY_TOP_OFFSET),
  );
