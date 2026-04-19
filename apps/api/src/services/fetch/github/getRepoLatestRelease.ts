import { RepoId, RepoName, StringURL } from '@repo/common/src/brands';
import assert from 'assert';
import { RepoReleases } from '@repo/common/src/schemas/github';
import { GitHubApiResp } from '@repo/common/src/types';
import { isNull, isUndefined } from '@arthurka/ts-utils';
import { githubFetchHelper } from './common/fetchHelper';
import { githubApiUrls } from './githubApiUrls';
import { makeGitHubApiRequestWithCache } from './common/makeGitHubApiRequestWithCache';
import { redisService } from '../../redisService';

const handleResp = async (url: StringURL): Promise<GitHubApiResp<RepoReleases[number] | null>> => {
  const res = await makeGitHubApiRequestWithCache(url, url => githubFetchHelper.get(url));
  if(res.success === false) {
    return res;
  }

  const { success, data } = RepoReleases.safeParse(JSON.parse(res.data));
  assert(success === true, 'Something went wrong. |t0d9a8|');

  return {
    success: true,
    data: isUndefined(data[0]) ? null : data[0],
  };
};

export const getRepoLatestReleaseByRepoName = (repoName: RepoName) => (
  handleResp(githubApiUrls.repoReleasesByName(repoName))
);

export const getRepoLatestReleaseByRepoId = (repoId: RepoId) => (
  handleResp(githubApiUrls.repoReleasesById(repoId))
);

export const cacheRepoLatestReleaseByName = async (repoName: RepoName, _data: RepoReleases[number] | null) => {
  const data = isNull(_data) ? [] : [_data];

  await redisService.githubApiCache.setIfNotExists(githubApiUrls.repoReleasesByName(repoName), JSON.stringify(data));
};

export const cacheRepoLatestReleaseById = async (repoId: RepoId, _data: RepoReleases[number] | null) => {
  const data = isNull(_data) ? [] : [_data];

  await redisService.githubApiCache.setIfNotExists(githubApiUrls.repoReleasesById(repoId), JSON.stringify(data));
};
