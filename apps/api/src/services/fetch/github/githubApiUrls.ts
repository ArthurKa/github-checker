import { RepoId, RepoName } from '@repo/common/src/brands';

const apiUrl = 'https://api.github.com';

export const githubApiUrls = {
  repoByName: (repoName: RepoName) => `${apiUrl}/repos/${repoName}` as const,
  repoReleasesByName: (repoName: RepoName) => `${apiUrl}/repos/${repoName}/releases?per_page=1` as const,
  repoReleasesById: (repoId: RepoId) => `${apiUrl}/repositories/${repoId}/releases?per_page=1` as const,
} as const;
