import { isUndefined } from '@arthurka/ts-utils';
import { RepoId } from '@repo/common/src/brands';
import { NODE_ENV } from '@repo/common/src/envVariables/public';
import { DbRepo } from '../db/repoService';
import { githubApiUrls } from '../fetch/github/githubApiUrls';
import { createShouldNotify } from './createShouldNotify';

const ntfy = async (message: string, openUrl?: string) => {
  await fetch('https://ntfy.sh/GitHub-Checker-eae414aa-5fd8-4a6f-bbf9-157ed5c71081', {
    method: 'POST',
    body: message,
    headers: {
      Title: 'GitHub Checker',
      ...!isUndefined(openUrl) && {
        Actions: `view, Open repo, ${openUrl}`,
      },
    },
  });
};

const shouldNotify = createShouldNotify(new Map<RepoId, number>());

export const notify = {
  async limitExceeded() {
    await ntfy('GitHub API limit exceeded.');
  },
  async repoNotFound({ id, name }: DbRepo) {
    if(NODE_ENV === 'production' && shouldNotify(id, 7 * 24 * 60 * 60 * 1000 /* 1 week */)) {
      await ntfy(`Repo ${name} can't be found anymore.`, githubApiUrls.repoReleasesById(id));
    }
  },
};
