import { afterEach, describe, expect, it, vi } from 'vitest';
import { onVisibilityChange, yieldToBrowser } from '@scripts/lib/dom';

type Entry = Pick<IntersectionObserverEntry, 'isIntersecting' | 'intersectionRatio'>;
type ObserverCallback = (entries: Entry[]) => void;

const VISIBLE: Entry = { isIntersecting: true, intersectionRatio: 1 };
const HIDDEN: Entry = { isIntersecting: false, intersectionRatio: 0 };
const TOUCHING_EDGE: Entry = { isIntersecting: true, intersectionRatio: 0 };

// Stands in for the browser's IntersectionObserver and lets the test deliver batches by hand
function stubIntersectionObserver() {
  let deliver: ObserverCallback = () => {};

  class FakeIntersectionObserver {
    constructor(callback: ObserverCallback) {
      deliver = callback;
    }

    observe() {}

    disconnect() {}
  }

  vi.stubGlobal('window', { IntersectionObserver: FakeIntersectionObserver });
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

  return (entries: Entry[]) => deliver(entries);
}

describe('onVisibilityChange', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports each change', () => {
    const deliver = stubIntersectionObserver();
    const callback = vi.fn();

    onVisibilityChange({} as Element, callback);
    deliver([HIDDEN]);
    deliver([VISIBLE]);

    expect(callback.mock.calls).toEqual([[false], [true]]);
  });

  it('uses the latest change when a slow frame delivers several at once', () => {
    const deliver = stubIntersectionObserver();
    const callback = vi.fn();

    onVisibilityChange({} as Element, callback);
    deliver([HIDDEN, VISIBLE]);

    expect(callback).toHaveBeenLastCalledWith(true);
  });

  it('counts an element touching the viewport edge as visible, since the observer stays quiet as it scrolls further in', () => {
    const deliver = stubIntersectionObserver();
    const callback = vi.fn();

    onVisibilityChange({} as Element, callback);
    deliver([HIDDEN]);
    deliver([TOUCHING_EDGE]);

    expect(callback).toHaveBeenLastCalledWith(true);
  });
});

describe('yieldToBrowser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('uses scheduler.yield where the browser has it', async () => {
    const schedulerYield = vi.fn(() => Promise.resolve());

    vi.stubGlobal('window', { scheduler: { yield: schedulerYield } });
    await yieldToBrowser();

    expect(schedulerYield).toHaveBeenCalledOnce();
  });

  it('falls back to a timer where scheduler has no yield', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', { scheduler: {} });

    let hasResumed = false;

    void yieldToBrowser().then(() => (hasResumed = true));
    await Promise.resolve();

    expect(hasResumed).toBe(false);

    await vi.runAllTimersAsync();

    expect(hasResumed).toBe(true);
  });
});
