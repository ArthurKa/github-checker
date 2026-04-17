import { Brand, WITNESS } from '@arthurka/ts-utils';
import { initializeByTypeGuard } from '../utils';
import { NonNegativeInteger, PositiveInteger } from './common';

export type RepoId = Brand<PositiveInteger, 'RepoId'>;
export const isRepoId = (e: unknown): e is RepoId => (
  RepoId.schema.safeParse(e).success
);
export const RepoId = (e: RepoId[WITNESS]): RepoId => (
  initializeByTypeGuard(e, isRepoId, 'RepoId')
);
RepoId.schema = PositiveInteger.schema;

export type IntegerSecond = Brand<NonNegativeInteger, 'IntegerSecond'>;
export const isIntegerSecond = (e: unknown): e is IntegerSecond => (
  IntegerSecond.schema.safeParse(e).success
);
export const IntegerSecond = (e: IntegerSecond[WITNESS]): IntegerSecond => (
  initializeByTypeGuard(e, isIntegerSecond, 'IntegerSecond')
);
IntegerSecond.schema = NonNegativeInteger.schema;
