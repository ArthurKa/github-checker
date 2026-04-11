import { isNull } from '@arthurka/ts-utils';
import assert from 'assert';
import { IntegerSecond } from '@repo/common/src/brands';
import { GitHubApiResp } from '@repo/common/src/types';

export const mapGitHubApiRespError = (
  status: number,
  retryAfter: null | IntegerSecond,
): null | Extract<GitHubApiResp<unknown>, { success: false }> => {
  if(status === 404) {
    return {
      success: false,
      error: 404,
    };
  }
  if(status === 403) {
    assert(!isNull(retryAfter), 'Something went wrong. |ak7vah|');

    return {
      success: false,
      error: 503,
      retryAfter,
    };
  }

  return null;
};
