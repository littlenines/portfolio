const LCG_MULTIPLIER = 9301;
const LCG_INCREMENT = 49297;
const LCG_MODULUS = 233280;

export interface SeededRandom {
  next: () => number;
  between: (min: number, max: number) => number;
}

export function createSeededRandom(seed: number): SeededRandom {
  let state = seed;

  const next = () => {
    state = (state * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;

    return state / LCG_MODULUS;
  };
  const between = (min: number, max: number) => min + next() * (max - min);

  return { next, between };
}

export const roundTo = (value: number, decimals = 1) => {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};
