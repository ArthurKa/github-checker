import { NoTrailingSlashStringURL, RepoId, RepoName } from '@repo/common/src/brands';

const apiUrl = 'https://api.github.com';

export const githubApiUrls = {
  repoByName: (repoName: RepoName) => NoTrailingSlashStringURL(`${apiUrl}/repos/${repoName}`),
  repoReleasesByName: (repoName: RepoName) => NoTrailingSlashStringURL(`${apiUrl}/repos/${repoName}/releases?per_page=1`),
  repoReleasesById: (repoId: RepoId) => NoTrailingSlashStringURL(`${apiUrl}/repositories/${repoId}/releases?per_page=1`),
} as const;
