import { isNull } from '@arthurka/ts-utils';
import { IntegerSecond } from '@repo/common/src/brands';
import { mapGitHubApiRespError } from './mapGitHubApiRespError';
import { makeRetryAfterHeader } from '../../../../utils/makeRetryAfterHeader';

export const handleGitHubApiRespErrors = (res: Response) => {
  const rateLimitResetTimeRaw = res.headers.get('x-ratelimit-reset');
  const rateLimitResetTime = isNull(rateLimitResetTimeRaw) ? null : IntegerSecond(+rateLimitResetTimeRaw);
  const retryAfter = isNull(rateLimitResetTime) ? null : makeRetryAfterHeader(Date.now(), rateLimitResetTime);

  return mapGitHubApiRespError(res.status, retryAfter);
};
