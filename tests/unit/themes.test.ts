import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, SECRET_THEME, THEMES, isTheme } from '@lib/themes';

describe('themes', () => {
  it('accepts every known theme', () => {
    for (const theme of THEMES) expect(isTheme(theme)).toBe(true);
  });

  it('rejects anything else', () => {
    for (const value of ['', 'dark', undefined, null, 1]) expect(isTheme(value)).toBe(false);
  });

  it('includes the default and the secret theme', () => {
    expect(THEMES).toContain(DEFAULT_THEME);
    expect(THEMES).toContain(SECRET_THEME);
  });
});
