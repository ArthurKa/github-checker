import { typeOf } from '@arthurka/ts-utils';
import { z } from 'zod/v4';
import { isEmail, isNonNegativeInteger, isPositiveInteger, isReleaseTag, isRepoId, isRepoName, isStringObjectId, isSubscribeToken, isUnsubscribeToken } from '../brands';
import { isNonEmptyString, isNoTrailingSlashStringURL, isStringURL } from '../brands/string/common';

const makeCustomErrorMessage = (name: string) => ({
  error({ input }: { input: unknown }) {
    return `${JSON.stringify(input)} of type ${typeOf(input)} is not valid ${name}`;
  },
});

export const customNonEmptyString = z.custom(isNonEmptyString, makeCustomErrorMessage('NonEmptyString'));
export const customStringURL = z.custom(isStringURL, makeCustomErrorMessage('StringURL'));
export const customNoTrailingSlashStringURL = z.custom(isNoTrailingSlashStringURL, makeCustomErrorMessage('NoTrailingSlashStringURL'));

export const customNonNegativeInteger = z.custom(isNonNegativeInteger, makeCustomErrorMessage('NonNegativeInteger'));
export const customPositiveInteger = z.custom(isPositiveInteger, makeCustomErrorMessage('PositiveInteger'));

export const customStringObjectId = z.custom(isStringObjectId, makeCustomErrorMessage('StringObjectId'));
export const customRepoName = z.custom(isRepoName, makeCustomErrorMessage('RepoName'));
export const customEmail = z.custom(isEmail, makeCustomErrorMessage('Email'));
export const customRepoId = z.custom(isRepoId, makeCustomErrorMessage('RepoId'));
export const customReleaseTag = z.custom(isReleaseTag, makeCustomErrorMessage('ReleaseTag'));
export const customSubscribeToken = z.custom(isSubscribeToken, makeCustomErrorMessage('SubscribeToken'));
export const customUnsubscribeToken = z.custom(isUnsubscribeToken, makeCustomErrorMessage('UnsubscribeToken'));
