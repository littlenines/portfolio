export function throttleToFrame(callback: () => void) {
  let frame = 0;

  return () => {
    if (frame) return;

    frame = requestAnimationFrame(() => {
      frame = 0;
      callback();
    });
  };
}

export function onVisibilityChange(
  element: Element,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit,
): () => void {
  if (!('IntersectionObserver' in window)) {
    callback(true);

    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    const latest = entries.at(-1);

    if (latest) callback(latest.isIntersecting);
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
}

export const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const yieldToBrowser = (): Promise<void> =>
  'scheduler' in window && 'yield' in window.scheduler ? window.scheduler.yield() : wait(0);
