import { RepoId, RepoName, StringURL } from '@repo/common/src/brands';

const apiUrl = 'https://api.github.com';

export const githubApiUrls = {
  repoByName: (repoName: RepoName) => StringURL(`${apiUrl}/repos/${repoName}`),
  repoReleasesByName: (repoName: RepoName) => StringURL(`${apiUrl}/repos/${repoName}/releases?per_page=1`),
  repoReleasesById: (repoId: RepoId) => StringURL(`${apiUrl}/repositories/${repoId}/releases?per_page=1`),
} as const;
