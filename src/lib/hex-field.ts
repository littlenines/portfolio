import { hexagonCorners } from './geometry';
import { isOdd } from './math';
import { PALETTE } from './palette';

export const HEX_FIELD_PATH = '/hex-field.svg';

const SQRT_3 = Math.sqrt(3);
const ROW_SPACING = 1.5;

const GLOW_CENTER_X = 0.88;
const GLOW_RADIUS_X = 0.65;
const GLOW_RADIUS_Y = 0.75;
const MIN_VISIBLE_FADE = 0.04;
const MAX_STROKE_OPACITY = 0.75;

const STROKE_COLOR = PALETTE.evaHexStroke;
const STROKE_WIDTH = 1.2;

export interface HexFieldOptions {
  radius?: number;
  width?: number;
  height?: number;
}

function hexagonPath(cx: number, cy: number, radius: number) {
  const corners = hexagonCorners({ x: cx, y: cy }, radius).map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`);

  return `M${corners.join('L')}Z`;
}

export function buildHexField({ radius = 36, width = 1600, height = 900 }: HexFieldOptions = {}) {
  const columnStep = radius * SQRT_3;
  const rowStep = radius * ROW_SPACING;
  const paths: string[] = [];

  for (let row = 0; row * rowStep < height + radius; row++) {
    const rowOffset = isOdd(row) ? columnStep / 2 : 0;

    for (let column = 0; column * columnStep < width + columnStep; column++) {
      const cx = column * columnStep + rowOffset;
      const cy = row * rowStep;
      const distanceX = (cx - width * GLOW_CENTER_X) / (width * GLOW_RADIUS_X);
      const distanceY = cy / (height * GLOW_RADIUS_Y);
      const fade = 1 - Math.hypot(distanceX, distanceY);

      if (fade < MIN_VISIBLE_FADE) continue;

      paths.push(
        `<path d="${hexagonPath(cx, cy, radius)}" stroke-opacity="${(fade * MAX_STROKE_OPACITY).toFixed(2)}"/>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}">${paths.join('')}</svg>`;
}
