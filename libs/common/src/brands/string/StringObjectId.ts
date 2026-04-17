import { Brand, WITNESS } from '@arthurka/ts-utils';
import { ObjectId } from 'bson';
import { NonEmptyString } from './common';
import { initializeByTypeGuard } from '../utils';

export type StringObjectId = Brand<NonEmptyString, 'StringObjectId'>;
export const isStringObjectId = (e: unknown): e is StringObjectId => (
  StringObjectId.schema.safeParse(e).success
);
export const StringObjectId = (e: StringObjectId[WITNESS]): StringObjectId => (
  initializeByTypeGuard(e, isStringObjectId, 'StringObjectId')
);
StringObjectId.schema = NonEmptyString.schema.refine(ObjectId.isValid, {
  error({ input }) {
    return `"${input}" is not valid BSON ObjectId`;
  },
});
