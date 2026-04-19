import { typeOf } from '@arthurka/ts-utils';
import { Email, IntegerSecond, isEmail, isIntegerSecond, isReleaseTag, isRepoId, isRepoName, isSubscribeToken, isUnsubscribeToken, isUUID, ReleaseTag, RepoId, RepoName, SubscribeToken, UnsubscribeToken, UUID } from '../brands';
import { BasicNoTrailingSlashStringURL, isBasicNoTrailingSlashStringURL, isNonEmptyString, NonEmptyString } from '../brands/string/common';

const makeCustomErrorMessage = (name: string) => ({
  error({ input }: { input: unknown }) {
    return `${JSON.stringify(input)} of type ${typeOf(input)} is not valid ${name}`;
  },
});

export const customNonEmptyString = NonEmptyString.schema.refine(isNonEmptyString, makeCustomErrorMessage('NonEmptyString'));
export const customBasicNoTrailingSlashStringURL = BasicNoTrailingSlashStringURL.schema.refine(isBasicNoTrailingSlashStringURL, makeCustomErrorMessage('BasicNoTrailingSlashStringURL'));
export const customUUID = UUID.schema.refine(isUUID, makeCustomErrorMessage('UUID')).meta({
  example: UUID('fa2eda39-ef39-417f-8660-f560c14afefb'),
});
export const customIntegerSecond = IntegerSecond.schema.refine(isIntegerSecond, makeCustomErrorMessage('IntegerSecond'));

export const customRepoName = RepoName.schema.refine(isRepoName, makeCustomErrorMessage('RepoName')).meta({
  example: RepoName('facebook/react'),
});
export const customEmail = Email.schema.refine(isEmail, makeCustomErrorMessage('Email')).meta({
  example: Email('example@mail.com'),
});
export const customRepoId = RepoId.schema.refine(isRepoId, makeCustomErrorMessage('RepoId')).meta({
  example: RepoId(10270250),
});
export const customReleaseTag = ReleaseTag.schema.refine(isReleaseTag, makeCustomErrorMessage('ReleaseTag')).meta({
  example: ReleaseTag('v1.0.0'),
});
export const customSubscribeToken = SubscribeToken.schema.refine(isSubscribeToken, makeCustomErrorMessage('SubscribeToken')).meta({
  example: SubscribeToken('f2afc354-0925-41ee-9472-0f9f50b156d0'),
});
export const customUnsubscribeToken = UnsubscribeToken.schema.refine(isUnsubscribeToken, makeCustomErrorMessage('UnsubscribeToken')).meta({
  example: UnsubscribeToken('b0f562d1-7094-4df5-b238-d76138c23a63'),
});
