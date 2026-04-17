import { Brand, WITNESS } from '@arthurka/ts-utils';
import { z } from 'zod/v4';
import { initializeByTypeGuard } from '../utils';
import { NonEmptyString } from './common';

export type RepoName = Brand<NonEmptyString, 'RepoName'>;
export const isRepoName = (e: unknown): e is RepoName => (
  RepoName.schema.safeParse(e).success
);
export const RepoName = (e: RepoName[WITNESS]): RepoName => (
  initializeByTypeGuard(e, isRepoName, 'RepoName')
);
RepoName.schema = z.intersection(NonEmptyString.schema, z.string().regex(/^[^/]+\/[^/]+$/));

export type Email = Brand<NonEmptyString, 'Email'>;
export const isEmail = (e: unknown): e is Email => (
  Email.schema.safeParse(e).success
);
export const Email = (e: Email[WITNESS]): Email => (
  initializeByTypeGuard(e, isEmail, 'Email')
);
Email.schema = z.intersection(NonEmptyString.schema, z.email());

export type ReleaseTag = Brand<NonEmptyString, 'ReleaseTag'>;
export const isReleaseTag = (e: unknown): e is ReleaseTag => (
  ReleaseTag.schema.safeParse(e).success
);
export const ReleaseTag = (e: ReleaseTag[WITNESS]): ReleaseTag => (
  initializeByTypeGuard(e, isReleaseTag, 'ReleaseTag')
);
ReleaseTag.schema = NonEmptyString.schema;
