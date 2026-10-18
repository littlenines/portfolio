import type { Point } from '@lib/geometry';
import { SECRET_THEME } from '@lib/themes';
import { MEDIA, matches, prefersReducedMotion } from '@scripts/lib/media';
import { currentTheme, onThemeChange } from '@scripts/theme/state';
import { STATE_CLASS } from '@scripts/lib/state-classes';

const FOLLOW_EASING = 0.22;
const SETTLE_THRESHOLD_PX = 0.1;
const COORDINATE_DIGITS = 4;
const INTERACTIVE = 'a, button, .project';

const formatCoordinate = (value: number) => String(Math.round(value)).padStart(COORDINATE_DIGITS, '0');

class Reticle {
  readonly #element: HTMLElement;
  readonly #readout: HTMLElement | null;
  readonly #easing = prefersReducedMotion() ? 1 : FOLLOW_EASING;
  #target: Point = { x: 0, y: 0 };
  #position: Point = { x: 0, y: 0 };
  #isShown = false;
  #frame = 0;

  constructor(element: HTMLElement) {
    this.#element = element;
    this.#readout = element.querySelector('[data-reticle-readout]');

    document.addEventListener('mousemove', (event) => this.#follow(event), { passive: true });
    document.documentElement.addEventListener('mouseleave', () => this.#hide());
    window.addEventListener('scroll', () => this.#updateReadout(), { passive: true });
    onThemeChange(() => this.#updateReadout());
  }

  #updateReadout() {
    if (!this.#readout || !this.#isShown || currentTheme() !== SECRET_THEME) return;

    const pageY = this.#position.y + window.scrollY;

    this.#readout.textContent = `X${formatCoordinate(this.#position.x)} Y${formatCoordinate(pageY)}`;
  }

  #follow({ clientX, clientY, target }: MouseEvent) {
    this.#target = { x: clientX, y: clientY };

    if (!this.#isShown) {
      this.#position = { ...this.#target };
      this.#isShown = true;
      this.#element.classList.add(STATE_CLASS.visible);
    }

    if (!this.#frame) this.#frame = requestAnimationFrame(this.#tick);

    const isOverInteractive = target instanceof Element && target.closest(INTERACTIVE) !== null;

    this.#element.classList.toggle(STATE_CLASS.hovering, isOverInteractive);
  }

  #hide() {
    this.#element.classList.remove(STATE_CLASS.visible);
    this.#isShown = false;
  }

  #tick = () => {
    const { x, y } = this.#position;

    this.#position = {
      x: x + (this.#target.x - x) * this.#easing,
      y: y + (this.#target.y - y) * this.#easing,
    };

    this.#element.style.transform = `translate3d(${this.#position.x}px, ${this.#position.y}px, 0)`;
    this.#updateReadout();

    const isMoving =
      Math.abs(this.#target.x - this.#position.x) > SETTLE_THRESHOLD_PX ||
      Math.abs(this.#target.y - this.#position.y) > SETTLE_THRESHOLD_PX;

    this.#frame = isMoving ? requestAnimationFrame(this.#tick) : 0;
  };
}

export function initReticle(element: HTMLElement) {
  if (matches(MEDIA.finePointer)) new Reticle(element);
}
