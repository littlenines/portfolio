// Kept in the DOM (attribute + event) rather than module state, so separate component scripts agree on it.
const BOOTED_ATTRIBUTE = 'data-booted';
const BOOTED_EVENT = 'app:booted';
const LOADER_SELECTOR = '[data-loader]';

// Same as the loader's scroll-lock timeout: if the loader script never signals, run anyway
const BOOT_TIMEOUT_MS = 7500;

export function markBooted() {
  document.documentElement.setAttribute(BOOTED_ATTRIBUTE, '');
  document.dispatchEvent(new Event(BOOTED_EVENT));
}

export function whenBooted(callback: () => void) {
  const hasBooted = document.documentElement.hasAttribute(BOOTED_ATTRIBUTE);
  const hasLoader = document.querySelector(LOADER_SELECTOR) !== null;

  if (hasBooted || !hasLoader) {
    callback();

    return;
  }

  let hasRun = false;

  const runOnce = () => {
    if (hasRun) return;

    hasRun = true;
    callback();
  };

  document.addEventListener(BOOTED_EVENT, runOnce, { once: true });
  window.setTimeout(runOnce, BOOT_TIMEOUT_MS);
}
