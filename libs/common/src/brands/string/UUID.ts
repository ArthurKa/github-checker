import { Brand, WITNESS } from '@arthurka/ts-utils';
import { z } from 'zod/v4';
import { initializeByTypeGuard } from '../utils';
import { NonEmptyString } from './common';

export type UUID = Brand<NonEmptyString, 'UUID'>;
export const isUUID = (e: unknown): e is UUID => (
  UUID.schema.safeParse(e).success
);
export const UUID = (e: UUID[WITNESS]): UUID => (
  initializeByTypeGuard(e, isUUID, 'UUID')
);
UUID.schema = z.intersection(NonEmptyString.schema, z.uuid());

export type SubscribeToken = Brand<UUID, 'SubscribeToken'>;
export const isSubscribeToken = (e: unknown): e is SubscribeToken => (
  SubscribeToken.schema.safeParse(e).success
);
export const SubscribeToken = (e: SubscribeToken[WITNESS]): SubscribeToken => (
  initializeByTypeGuard(e, isSubscribeToken, 'SubscribeToken')
);
SubscribeToken.schema = UUID.schema;

export type UnsubscribeToken = Brand<UUID, 'UnsubscribeToken'>;
export const isUnsubscribeToken = (e: unknown): e is UnsubscribeToken => (
  UnsubscribeToken.schema.safeParse(e).success
);
export const UnsubscribeToken = (e: UnsubscribeToken[WITNESS]): UnsubscribeToken => (
  initializeByTypeGuard(e, isUnsubscribeToken, 'UnsubscribeToken')
);
UnsubscribeToken.schema = UUID.schema;
