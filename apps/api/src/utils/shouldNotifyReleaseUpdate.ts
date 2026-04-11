import { isNull } from '@arthurka/ts-utils';
import { StrictExclude } from '@repo/common/src/utils';
import type { DbRepo } from '../services/db/repoService';

export const shouldNotifyReleaseUpdate = (
  repo: null | Pick<DbRepo, 'latestTag'>,
  latestTag: DbRepo['latestTag'],
): repo is StrictExclude<typeof repo, null> => (
  !isNull(repo) && repo.latestTag !== latestTag
);
