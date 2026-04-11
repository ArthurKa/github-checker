import { Brand, WITNESS } from '@arthurka/ts-utils';
import { validate } from 'uuid';
import { initializeByTypeGuard } from '../utils';
import { isNonEmptyString, NonEmptyString } from './common';

export type UUID = Brand<NonEmptyString, 'UUID'>;
export const isUUID = (e: unknown): e is UUID => (
  true
    && isNonEmptyString(e)
    && validate(e)
);
export const UUID = (e: UUID[WITNESS]): UUID => (
  initializeByTypeGuard(e, isUUID, 'UUID')
);

export type SubscribeToken = Brand<UUID, 'SubscribeToken'>;
export const isSubscribeToken = (e: unknown): e is SubscribeToken => isUUID(e);
export const SubscribeToken = (e: SubscribeToken[WITNESS]): SubscribeToken => (
  initializeByTypeGuard(e, isSubscribeToken, 'SubscribeToken')
);

export type UnsubscribeToken = Brand<UUID, 'UnsubscribeToken'>;
export const isUnsubscribeToken = (e: unknown): e is UnsubscribeToken => isUUID(e);
export const UnsubscribeToken = (e: UnsubscribeToken[WITNESS]): UnsubscribeToken => (
  initializeByTypeGuard(e, isUnsubscribeToken, 'UnsubscribeToken')
);
