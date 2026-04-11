import { GITHUB_API_TOKEN } from '@repo/common/src/envVariables/private';

export const githubFetchHelper = {
  get(url: string) {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
      },
    });
  },
};
