import { afterEach, describe, expect, it, vi } from 'vitest';
import { onVisibilityChange } from '@scripts/lib/dom';

type ObserverCallback = (entries: Pick<IntersectionObserverEntry, 'intersectionRatio'>[]) => void;

const VISIBLE = { intersectionRatio: 1 };
const HIDDEN = { intersectionRatio: 0 };

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

  return (entries: Pick<IntersectionObserverEntry, 'intersectionRatio'>[]) => deliver(entries);
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
});
