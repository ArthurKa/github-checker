import { RepoName } from '@repo/common/src/brands';
import { Repo } from '@repo/common/src/zod/github';
import assert from 'assert';
import { GitHubApiResp } from '@repo/common/src/types';
import { isNull } from '@arthurka/ts-utils';
import { githubFetchHelper } from './fetchHelper';
import { handleGitHubApiRespErrors } from './common';
import { githubApiUrls } from './githubApiUrls';

export const getRepoByRepoName = async (repoName: RepoName): Promise<GitHubApiResp<Repo>> => {
  const res = await githubFetchHelper.get(githubApiUrls.repoByName(repoName));

  const handledError = handleGitHubApiRespErrors(res);
  if(!isNull(handledError)) {
    return handledError;
  }

  const { success, data } = Repo.safeParse(await res.json());
  assert(success === true, 'Something went wrong. |8mab5a|');

  return {
    success: true,
    data,
  };
};
