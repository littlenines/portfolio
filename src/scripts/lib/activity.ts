import { onVisibilityChange } from './dom';

const SCROLL_IDLE_MS = 200;

export interface ActivityState {
  isShown: boolean;
  isScrolling: boolean;
}

export function watchActivity(element: Element, callback: (state: ActivityState) => void): () => void {
  let isOnScreen = true;
  let isScrolling = false;
  let lastState: ActivityState | undefined;
  let scrollIdleTimer = 0;

  const update = () => {
    const state: ActivityState = { isShown: isOnScreen && !document.hidden, isScrolling };

    if (lastState?.isShown === state.isShown && lastState.isScrolling === state.isScrolling) return;

    lastState = state;
    callback(state);
  };

  const onScroll = () => {
    if (!isScrolling) {
      isScrolling = true;
      update();
    }

    window.clearTimeout(scrollIdleTimer);

    scrollIdleTimer = window.setTimeout(() => {
      isScrolling = false;
      update();
    }, SCROLL_IDLE_MS);
  };

  const stopWatchingVisibility = onVisibilityChange(element, (isVisible) => {
    isOnScreen = isVisible;
    update();
  });

  document.addEventListener('visibilitychange', update);
  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  return () => {
    stopWatchingVisibility();
    document.removeEventListener('visibilitychange', update);
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(scrollIdleTimer);
  };
}
