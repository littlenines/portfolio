import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '@lib/seeded-random';

const SEED = 11;
const SAMPLE_SIZE = 50;

const sample = (seed: number) => {
  const random = createSeededRandom(seed);

  return Array.from({ length: SAMPLE_SIZE }, () => random.next());
};

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    expect(sample(SEED)).toEqual(sample(SEED));
  });

  it('gives a different sequence for a different seed', () => {
    expect(sample(SEED)).not.toEqual(sample(SEED + 1));
  });

  it('stays between 0 and 1', () => {
    for (const value of sample(SEED)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('keeps between() inside its range', () => {
    const random = createSeededRandom(SEED);
    const [min, max] = [20, 40];

    for (let draw = 0; draw < SAMPLE_SIZE; draw++) {
      const value = random.between(min, max);

      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThan(max);
    }
  });
});
