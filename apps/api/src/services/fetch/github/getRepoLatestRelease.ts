import { RepoId, RepoName } from '@repo/common/src/brands';
import assert from 'assert';
import { RepoReleases } from '@repo/common/src/zod/github/RepoReleases';
import { GitHubApiResp } from '@repo/common/src/types';
import { isNull, isUndefined } from '@arthurka/ts-utils';
import { githubFetchHelper } from './fetchHelper';
import { handleGitHubApiRespErrors } from './common';
import { githubApiUrls } from './githubApiUrls';

const handleResp = async (res: Response): Promise<GitHubApiResp<RepoReleases[number] | null>> => {
  const handledError = handleGitHubApiRespErrors(res);
  if(!isNull(handledError)) {
    return handledError;
  }

  const { success, data } = RepoReleases.safeParse(await res.json());
  assert(success === true, 'Something went wrong. |t0d9a8|');

  return {
    success: true,
    data: isUndefined(data[0]) ? null : data[0],
  };
};

export const getRepoLatestReleaseByRepoName = async (repoName: RepoName) => {
  const res = await githubFetchHelper.get(githubApiUrls.repoReleasesByName(repoName));

  return handleResp(res);
};

export const getRepoLatestReleaseByRepoId = async (repoId: RepoId) => {
  const res = await githubFetchHelper.get(githubApiUrls.repoReleasesById(repoId));

  return handleResp(res);
};
