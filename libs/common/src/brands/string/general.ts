import { Brand, isNull, WITNESS } from '@arthurka/ts-utils';
import { z } from 'zod/v4';
import { initializeByTypeGuard } from '../utils';
import { isNonEmptyString, NonEmptyString } from './common';

export type RepoName = Brand<NonEmptyString, 'RepoName'>;
export const isRepoName = (e: unknown): e is RepoName => (
  true
    && isNonEmptyString(e)
    && !isNull(e.match(/[^/]+\/[^/]+/))
);
export const RepoName = (e: RepoName[WITNESS]): RepoName => (
  initializeByTypeGuard(e, isRepoName, 'RepoName')
);

export type Email = Brand<NonEmptyString, 'Email'>;
export const isEmail = (e: unknown): e is Email => (
  true
    && isNonEmptyString(e)
    && z.email().safeParse(e).success
);
export const Email = (e: Email[WITNESS]): Email => (
  initializeByTypeGuard(e, isEmail, 'Email')
);

export type ReleaseTag = Brand<NonEmptyString, 'ReleaseTag'>;
export const isReleaseTag = (e: unknown): e is ReleaseTag => isNonEmptyString(e);
export const ReleaseTag = (e: ReleaseTag[WITNESS]): ReleaseTag => (
  initializeByTypeGuard(e, isReleaseTag, 'ReleaseTag')
);
