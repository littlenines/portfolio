const DEFAULT_DECIMALS = 1;

export const roundTo = (value: number, decimals = DEFAULT_DECIMALS) => {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const isOdd = (value: number) => Math.abs(value % 2) === 1;
