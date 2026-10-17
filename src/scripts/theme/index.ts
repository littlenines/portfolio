import { initEasterEgg } from './easter-egg';
import { initThemeSwitch } from './switch';
import { createThemeTransition } from './transition';

export function initThemes() {
  const chooseTheme = createThemeTransition(document.querySelector('[data-theme-veil]'));

  for (const group of document.querySelectorAll<HTMLElement>('[data-theme-switch]')) {
    initThemeSwitch(group, chooseTheme);
  }

  initEasterEgg(document.querySelector('[data-easter-egg]'), chooseTheme);
}
