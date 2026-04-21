import { expect, it } from 'vitest';
import { IntegerSecond } from '@repo/common/src/brands';
import { mapGitHubApiRespError } from './mapGitHubApiRespError';

it('returns null for non-error statuses', () => {
  for(const e of [200, 201, 300, 400, 500]) {
    expect(mapGitHubApiRespError(e, null)).toBeNull();
  }
});

it('maps 404', () => {
  expect(mapGitHubApiRespError(404, null)).toStrictEqual({
    success: false,
    error: 404,
  });
});

it('throws on 403 without retryAfter', () => {
  expect(() => mapGitHubApiRespError(403, null)).toThrow();
});

it('maps 403 to 503 with retryAfter', () => {
  expect(mapGitHubApiRespError(403, IntegerSecond(0))).toStrictEqual({
    success: false,
    error: 503,
    retryAfter: IntegerSecond(0),
  });
  expect(mapGitHubApiRespError(403, IntegerSecond(1000))).toStrictEqual({
    success: false,
    error: 503,
    retryAfter: IntegerSecond(1000),
  });
});
