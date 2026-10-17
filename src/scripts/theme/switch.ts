import { SECRET_THEME, type Theme } from '@lib/themes';
import { currentTheme, onThemeChange } from './state';
import type { ChooseTheme } from './transition';

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

export function initThemeSwitch(group: HTMLElement, chooseTheme: ChooseTheme) {
  const options = [...group.querySelectorAll<HTMLButtonElement>('[data-theme-option]')];
  const themeOf = (option: HTMLButtonElement) => option.dataset.themeOption as Theme;

  const placeHighlight = () => {
    const active = options.find((option) => themeOf(option) === currentTheme());

    if (!active?.offsetWidth) return;

    group.style.setProperty('--x', `${active.offsetLeft}px`);
    group.style.setProperty('--w', `${active.offsetWidth}px`);
  };

  const sync = (theme: Theme) => {
    // Checked before the secret option may be hidden, which would drop focus to the page
    const hadFocus = group.contains(document.activeElement);

    for (const option of options) {
      const isActive = themeOf(option) === theme;

      option.setAttribute('aria-checked', String(isActive));
      option.tabIndex = isActive ? 0 : -1;

      if (themeOf(option) === SECRET_THEME) option.hidden = !isActive;

      if (isActive && hadFocus) option.focus();
    }

    placeHighlight();
  };

  const visibleNeighbour = (index: number, direction: 1 | -1) => {
    let next = index;

    do {
      next = (next + direction + options.length) % options.length;
    } while (options[next].hidden);

    return options[next];
  };

  for (const [index, option] of options.entries()) {
    option.addEventListener('click', () => chooseTheme(themeOf(option)));

    option.addEventListener('keydown', (event) => {
      const direction = NEXT_KEYS.has(event.key) ? 1 : PREVIOUS_KEYS.has(event.key) ? -1 : 0;

      if (!direction) return;

      event.preventDefault();
      chooseTheme(themeOf(visibleNeighbour(index, direction)));
    });
  }

  const resizeObserver = new ResizeObserver(placeHighlight);

  for (const option of options) resizeObserver.observe(option);

  onThemeChange(sync);
  sync(currentTheme());
}
