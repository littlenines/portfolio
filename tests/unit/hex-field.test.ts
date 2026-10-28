import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HEX_FIELD_PATH, buildHexField } from '@lib/hex-field';

const MAX_STROKE_OPACITY = 0.75;

describe('buildHexField', () => {
  it('returns an SVG sized to the requested area', () => {
    const svg = buildHexField({ width: 800, height: 400 });

    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 800 400"/);
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('draws hexagons with stroke opacities between 0 and the maximum', () => {
    const opacities = [...buildHexField().matchAll(/stroke-opacity="([\d.]+)"/g)].map(([, value]) => Number(value));

    expect(opacities.length).toBeGreaterThan(0);

    for (const opacity of opacities) {
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThanOrEqual(MAX_STROKE_OPACITY);
    }
  });
});

describe('HEX_FIELD_PATH', () => {
  it('matches the endpoint that writes the file', () => {
    expect(existsSync(new URL(`../../src/pages${HEX_FIELD_PATH}.ts`, import.meta.url))).toBe(true);
  });
});
