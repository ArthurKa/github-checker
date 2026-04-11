import { isUndefined } from '@arthurka/ts-utils';

export const createShouldNotify = <T extends string | number>(store: Map<T, number>, getNow = () => Date.now()) => (
  (id: T, intervalMs: number): boolean => {
    const now = getNow();
    const last = (() => {
      const value = store.get(id);

      return !isUndefined(value) ? value : -Infinity;
    })();

    if(now - last <= intervalMs) {
      return false;
    }

    store.set(id, now);

    return true;
  }
);
