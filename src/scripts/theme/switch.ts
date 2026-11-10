import { DEFAULT_THEME, SECRET_THEME, isTheme, type Theme } from '@lib/themes';
import { STATE_CLASS } from '@scripts/lib/state-classes';
import { currentTheme, onThemeChange } from './state';
import type { ChooseTheme } from './transition';

type Direction = 1 | -1;

const KEY_DIRECTIONS: Partial<Record<string, Direction>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export function initThemeSwitch(group: HTMLElement, chooseTheme: ChooseTheme) {
  const options = [...group.querySelectorAll<HTMLButtonElement>('[data-theme-option]')];

  const themeOf = (option: HTMLButtonElement): Theme => {
    const { themeOption } = option.dataset;

    return isTheme(themeOption) ? themeOption : DEFAULT_THEME;
  };

  const placeHighlight = () => {
    const active = options.find((option) => themeOf(option) === currentTheme());

    if (!active?.offsetWidth) return;

    group.style.setProperty('--pill-left', `${active.offsetLeft}px`);
    group.style.setProperty('--pill-width', `${active.offsetWidth}px`);

    if (!group.classList.contains(STATE_CLASS.entered)) {
      requestAnimationFrame(() => group.classList.add(STATE_CLASS.entered));
    }
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

  const visibleNeighbour = (index: number, direction: Direction) => {
    let next = index;

    do {
      next = (next + direction + options.length) % options.length;
    } while (options[next].hidden);

    return options[next];
  };

  for (const [index, option] of options.entries()) {
    option.addEventListener('click', () => chooseTheme(themeOf(option)));

    option.addEventListener('keydown', (event) => {
      const direction = KEY_DIRECTIONS[event.key];

      if (direction === undefined) return;

      event.preventDefault();
      chooseTheme(themeOf(visibleNeighbour(index, direction)));
    });
  }

  const resizeObserver = new ResizeObserver(placeHighlight);

  for (const option of options) resizeObserver.observe(option);

  onThemeChange(sync);
  sync(currentTheme());
}
