import { showToast } from './toast';

const DEFAULT_COPIED_MESSAGE = 'Copied';
const FAILED_MESSAGE = 'Could not copy. Select it by hand instead.';

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
}

export function initCopyButtons() {
  for (const button of document.querySelectorAll<HTMLElement>('[data-copy]')) {
    button.addEventListener('click', async () => {
      const { copy: text = '', copiedMessage = DEFAULT_COPIED_MESSAGE } = button.dataset;

      showToast((await copy(text)) ? copiedMessage : FAILED_MESSAGE);
    });
  }
}
