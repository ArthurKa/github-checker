import { z } from 'zod/v4';
import { Brand, WITNESS } from '@arthurka/ts-utils';
import { initializeByTypeGuard } from '../utils';

export type NonEmptyString = Brand<string, 'NonEmptyString'>;
export const isNonEmptyString = (e: unknown): e is NonEmptyString => (
  NonEmptyString.schema.safeParse(e).success
);
export const NonEmptyString = (e: NonEmptyString[WITNESS]): NonEmptyString => (
  initializeByTypeGuard(e, isNonEmptyString, 'NonEmptyString')
);
NonEmptyString.schema = z.string().min(1);

export type StringURL = Brand<NonEmptyString, 'StringURL'>;
export const isStringURL = (e: unknown): e is StringURL => (
  StringURL.schema.safeParse(e).success
);
export const StringURL = (e: StringURL[WITNESS]): StringURL => (
  initializeByTypeGuard(e, isStringURL, 'StringURL')
);
StringURL.schema = z.intersection(NonEmptyString.schema, z.url());

export type BasicStringURL = Brand<StringURL, 'no ?, no #'>;
export const isBasicStringURL = (e: unknown): e is BasicStringURL => (
  BasicStringURL.schema.safeParse(e).success
);
export const BasicStringURL = (e: BasicStringURL[WITNESS]): BasicStringURL => (
  initializeByTypeGuard(e, isBasicStringURL, 'BasicStringURL')
);
BasicStringURL.schema = z.intersection(StringURL.schema, z.string().regex(/^[^#?]*$/));

export type BasicNoTrailingSlashStringURL = Brand<BasicStringURL, 'NoTrailingSlash'>;
export const isBasicNoTrailingSlashStringURL = (e: unknown): e is BasicNoTrailingSlashStringURL => (
  BasicNoTrailingSlashStringURL.schema.safeParse(e).success
);
export const BasicNoTrailingSlashStringURL = (e: BasicNoTrailingSlashStringURL[WITNESS]): BasicNoTrailingSlashStringURL => (
  initializeByTypeGuard(e, isBasicNoTrailingSlashStringURL, 'BasicNoTrailingSlashStringURL')
);
BasicNoTrailingSlashStringURL.schema = z.intersection(BasicStringURL.schema, z.string().regex(/[^/]$/));
