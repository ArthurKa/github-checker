import { typeOf } from '@arthurka/ts-utils';
import { z } from 'zod/v4';
import { Email, isEmail, isReleaseTag, isRepoId, isRepoName, isSubscribeToken, isUnsubscribeToken, isUUID, ReleaseTag, RepoId, RepoName, SubscribeToken, UnsubscribeToken, UUID } from '../brands';
import { isNonEmptyString, isNoTrailingSlashStringURL } from '../brands/string/common';

const makeCustomErrorMessage = (name: string) => ({
  error({ input }: { input: unknown }) {
    return `${JSON.stringify(input)} of type ${typeOf(input)} is not valid ${name}`;
  },
});

export const customNonEmptyString = z.string().refine(isNonEmptyString, makeCustomErrorMessage('NonEmptyString'));
export const customNoTrailingSlashStringURL = z.string().refine(isNoTrailingSlashStringURL, makeCustomErrorMessage('NoTrailingSlashStringURL'));
export const customUUID = z.string().refine(isUUID, makeCustomErrorMessage('UUID')).meta({
  example: UUID('fa2eda39-ef39-417f-8660-f560c14afefb'),
});

export const customRepoName = z.string().refine(isRepoName, makeCustomErrorMessage('RepoName')).meta({
  example: RepoName('facebook/react'),
});
export const customEmail = z.string().refine(isEmail, makeCustomErrorMessage('Email')).meta({
  example: Email('example@mail.com'),
});
export const customRepoId = z.number().refine(isRepoId, makeCustomErrorMessage('RepoId')).meta({
  example: RepoId(10270250),
});
export const customReleaseTag = z.string().refine(isReleaseTag, makeCustomErrorMessage('ReleaseTag')).meta({
  example: ReleaseTag('v1.0.0'),
});
export const customSubscribeToken = z.string().refine(isSubscribeToken, makeCustomErrorMessage('SubscribeToken')).meta({
  example: SubscribeToken('f2afc354-0925-41ee-9472-0f9f50b156d0'),
});
export const customUnsubscribeToken = z.string().refine(isUnsubscribeToken, makeCustomErrorMessage('UnsubscribeToken')).meta({
  example: UnsubscribeToken('b0f562d1-7094-4df5-b238-d76138c23a63'),
});
