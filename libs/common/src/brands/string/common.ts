import { z } from 'zod/v4';
import { Brand, WITNESS } from '@arthurka/ts-utils';
import { initializeByTypeGuard } from '../utils';

export type NonEmptyString = Brand<string, 'NonEmptyString'>;
export const isNonEmptyString = (e: unknown): e is NonEmptyString => (
  true
    && typeof e === 'string'
    && e !== ''
);
export const NonEmptyString = (e: NonEmptyString[WITNESS]): NonEmptyString => (
  initializeByTypeGuard(e, isNonEmptyString, 'NonEmptyString')
);

export type StringURL = Brand<NonEmptyString, 'StringURL'>;
export const isStringURL = (e: unknown): e is StringURL => (
  true
    && isNonEmptyString(e)
    && z.url().safeParse(e).success
);
export const StringURL = (e: StringURL[WITNESS]): StringURL => (
  initializeByTypeGuard(e, isStringURL, 'StringURL')
);

export type NoTrailingSlashStringURL = Brand<StringURL, 'NoTrailingSlash'>;
export const isNoTrailingSlashStringURL = (e: unknown): e is NoTrailingSlashStringURL => (
  true
    && isStringURL(e)
    && !e.endsWith('/')
);
export const NoTrailingSlashStringURL = (e: NoTrailingSlashStringURL[WITNESS]): NoTrailingSlashStringURL => (
  initializeByTypeGuard(e, isNoTrailingSlashStringURL, 'NoTrailingSlashStringURL')
);
