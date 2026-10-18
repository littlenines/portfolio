import { describe, expect, it } from 'vitest';
import { clamp01, mixRgb, rgbToHex, type Rgb } from '@scripts/lib/color';

const BLACK: Rgb = [0, 0, 0];
const WHITE: Rgb = [255, 255, 255];

describe('mixRgb', () => {
  it('returns the start colour at 0 and the end colour at 1', () => {
    expect(mixRgb(BLACK, WHITE, 0)).toEqual(BLACK);
    expect(mixRgb(BLACK, WHITE, 1)).toEqual(WHITE);
  });

  it('mixes each channel proportionally', () => {
    expect(mixRgb([0, 100, 200], [100, 200, 0], 0.5)).toEqual([50, 150, 100]);
  });
});

describe('rgbToHex', () => {
  it('formats channels as a lowercase hex colour', () => {
    expect(rgbToHex([255, 138, 61])).toBe('#ff8a3d');
  });

  it('rounds fractional channels and pads single digits', () => {
    expect(rgbToHex([0.4, 9.6, 15])).toBe('#000a0f');
  });
});

describe('clamp01', () => {
  it('keeps values between 0 and 1', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(3)).toBe(1);
  });
});
