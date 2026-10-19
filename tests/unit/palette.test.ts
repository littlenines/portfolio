import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PALETTE } from '@lib/palette';

const COLORS_PARTIAL = new URL('../../src/styles/abstracts/_colors.scss', import.meta.url);

const SCSS_NAMES: Partial<Record<keyof typeof PALETTE, string>> = {
  ground: 'ground',
  midnight: 'midnight',
  mute: 'mute',
  peach: 'peach',
  pink: 'pink',
  teal: 'teal',
  violet: 'eva-violet',
  windowGlow: 'window-glow',
  evaOrange: 'eva-orange',
};

const scssColors = new Map(
  Array.from(
    readFileSync(COLORS_PARTIAL, 'utf8').matchAll(/^\$([a-z0-9-]+): (#[0-9a-f]{3,8});/gim),
    ([, name, value]) => [name, value.toLowerCase()],
  ),
);

describe('palette', () => {
  it.each(Object.entries(SCSS_NAMES))('keeps %s the same in palette.ts and _colors.scss', (paletteName, scssName) => {
    expect(scssColors.get(scssName)).toBe(PALETTE[paletteName as keyof typeof PALETTE].toLowerCase());
  });
});
