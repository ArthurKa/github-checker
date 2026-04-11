import { describe, expect, it } from 'vitest';
import { createShouldNotify } from './createShouldNotify';

describe('shouldNotify', () => {
  it('returns true on first call', () => {
    const shouldNotify = createShouldNotify(new Map<number, number>(), () => 1000);

    expect(shouldNotify(123, 5000)).toBe(true);
  });

  it('returns false if called within interval', () => {
    let time = 1000;
    const shouldNotify = createShouldNotify(new Map<number, number>(), () => time);

    expect(shouldNotify(123, 5000)).toBe(true);

    time = 2000;
    expect(shouldNotify(123, 5000)).toBe(false);
  });

  it('returns true after interval passes', () => {
    let time = 1000;
    const shouldNotify = createShouldNotify(new Map<number, number>(), () => time);

    expect(shouldNotify(123, 5000)).toBe(true);

    time = 7000;
    expect(shouldNotify(123, 5000)).toBe(true);
  });

  it('tracks different repoIds independently', () => {
    const shouldNotify = createShouldNotify(new Map<number, number>(), () => 1000);

    expect(shouldNotify(123, 5000)).toBe(true);
    expect(shouldNotify(222, 5000)).toBe(true);
  });

  it('updates lastSent timestamp on success', () => {
    const store = new Map<number, number>();
    let time = 1000;
    const shouldNotify = createShouldNotify(store, () => time);

    expect(shouldNotify(123, 5000)).toBe(true);
    expect(store.get(123)).toBe(1000);

    time = 7000;
    expect(shouldNotify(123, 5000)).toBe(true);
    expect(store.get(123)).toBe(7000);
  });
});
