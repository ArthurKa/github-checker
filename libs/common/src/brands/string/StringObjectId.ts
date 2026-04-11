import { Brand, WITNESS } from '@arthurka/ts-utils';
import { ObjectId } from 'bson';
import { isNonEmptyString, NonEmptyString } from './common';
import { initializeByTypeGuard } from '../utils';

export type StringObjectId = Brand<NonEmptyString, 'StringObjectId'>;
export const isStringObjectId = (e: unknown): e is StringObjectId => (
  true
    && isNonEmptyString(e)
    && ObjectId.isValid(e)
);
export const StringObjectId = (e: StringObjectId[WITNESS]): StringObjectId => (
  initializeByTypeGuard(e, isStringObjectId, 'StringObjectId')
);
