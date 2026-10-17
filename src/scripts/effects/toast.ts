const VISIBLE_MS = 2000;
let hideTimer = 0;

export function showToast(message: string) {
  const toast = document.querySelector<HTMLElement>('[data-toast]');

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-on');
  clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => toast.classList.remove('is-on'), VISIBLE_MS);
}
