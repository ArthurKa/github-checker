import { IntegerSecond } from '@repo/common/src/brands';

export const makeRetryAfterHeader = (now: number, rateLimitResetTime: IntegerSecond): IntegerSecond => (
  IntegerSecond(Math.max(1, Math.ceil(rateLimitResetTime - now / 1000)))
);
