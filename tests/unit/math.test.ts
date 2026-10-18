import { describe, expect, it } from 'vitest';
import { clamp01, isOdd, roundTo } from '@lib/math';

describe('roundTo', () => {
  it('rounds to one decimal by default', () => {
    expect(roundTo(1.26)).toBe(1.3);
  });

  it('rounds to the given number of decimals', () => {
    expect(roundTo(1.23456, 3)).toBe(1.235);
  });
});

describe('clamp01', () => {
  it('keeps values between 0 and 1', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(3)).toBe(1);
  });
});

describe('isOdd', () => {
  it('tells odd numbers from even ones, negatives included', () => {
    expect([0, 1, 2, 3, -1, -2].map(isOdd)).toEqual([false, true, false, true, true, false]);
  });
});
