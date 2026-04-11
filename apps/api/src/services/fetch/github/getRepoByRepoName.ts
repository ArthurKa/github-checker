import { RepoName } from '@repo/common/src/brands';
import { Repo } from '@repo/common/src/zod/github';
import assert from 'assert';
import { GitHubApiResp } from '@repo/common/src/types';
import { githubFetchHelper } from './common/fetchHelper';
import { githubApiUrls } from './githubApiUrls';
import { makeGitHubApiRequestWithCache } from './common/makeGitHubApiRequestWithCache';

export const getRepoByRepoName = async (repoName: RepoName): Promise<GitHubApiResp<Repo>> => {
  const res = await makeGitHubApiRequestWithCache(githubApiUrls.repoByName(repoName), url => githubFetchHelper.get(url));
  if(res.success === false) {
    return res;
  }

  const { success, data } = Repo.safeParse(JSON.parse(res.data));
  assert(success === true, 'Something went wrong. |8mab5a|');

  return {
    success: true,
    data,
  };
};
