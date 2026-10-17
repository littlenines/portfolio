import { DEFAULT_THEME, THEME_CHANGE_EVENT, THEME_STORAGE_KEY, isTheme, type Theme } from '@lib/themes';

const root = document.documentElement;

export const currentTheme = (): Theme => {
  const { theme } = root.dataset;

  return isTheme(theme) ? theme : DEFAULT_THEME;
};

export function applyTheme(theme: Theme, { remember = true } = {}) {
  root.dataset.theme = theme;

  if (remember) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked (private mode); the theme still applies for this visit.
    }
  }

  document.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
}

export function onThemeChange(callback: (theme: Theme) => void) {
  document.addEventListener(THEME_CHANGE_EVENT, (event) => callback((event as CustomEvent<Theme>).detail));
}
