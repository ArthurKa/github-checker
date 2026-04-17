import { isNull } from '@arthurka/ts-utils';
import { StringURL } from '@repo/common/src/brands';
import { GitHubApiResp } from '@repo/common/src/types';
import { redisService } from '../../../redisService';
import { handleGitHubApiRespErrors } from '.';

export const makeGitHubApiRequestWithCache = async <T extends StringURL>(
  url: T,
  makeRequest: (url: T) => Promise<Response>,
): Promise<GitHubApiResp<string>> => {
  const cached = await redisService.githubApiCache.get(url);
  if(!isNull(cached)) {
    return {
      success: true,
      data: cached,
    };
  }

  const res = await makeRequest(url);

  const handledError = handleGitHubApiRespErrors(res);
  if(!isNull(handledError)) {
    return handledError;
  }

  const data = await res.text();
  await redisService.githubApiCache.set(url, data);

  return {
    success: true,
    data,
  };
};
