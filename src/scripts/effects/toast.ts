import { STATE_CLASS } from '@scripts/lib/state-classes';

const VISIBLE_MS = 2000;
let hideTimer = 0;

export function showToast(message: string) {
  const toast = document.querySelector<HTMLElement>('[data-toast]');

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add(STATE_CLASS.visible);
  clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => toast.classList.remove(STATE_CLASS.visible), VISIBLE_MS);
}
