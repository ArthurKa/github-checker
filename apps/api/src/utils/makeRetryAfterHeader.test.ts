import { expect, it } from 'vitest';
import { IntegerSecond } from '@repo/common/src/brands';
import { makeRetryAfterHeader } from './makeRetryAfterHeader';

it('minimum value', () => {
  expect(makeRetryAfterHeader(0, IntegerSecond(0))).toBe(IntegerSecond(1));
  expect(makeRetryAfterHeader(100, IntegerSecond(0))).toBe(IntegerSecond(1));
  expect(makeRetryAfterHeader(100_000, IntegerSecond(99))).toBe(IntegerSecond(1));
});

it('other values', () => {
  expect(makeRetryAfterHeader(90_000, IntegerSecond(100))).toBe(IntegerSecond(10));
  expect(makeRetryAfterHeader(999, IntegerSecond(2))).toBe(IntegerSecond(2));
  expect(makeRetryAfterHeader(1000, IntegerSecond(2))).toBe(IntegerSecond(1));
  expect(makeRetryAfterHeader(200_123, IntegerSecond(250))).toBe(IntegerSecond(50));
});
