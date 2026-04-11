import { Brand, WITNESS } from '@arthurka/ts-utils';
import { initializeByTypeGuard } from '../utils';
import { isNonNegativeInteger, isPositiveInteger, NonNegativeInteger, PositiveInteger } from './common';

export type RepoId = Brand<PositiveInteger, 'RepoId'>;
export const isRepoId = (e: unknown): e is RepoId => isPositiveInteger(e);
export const RepoId = (e: RepoId[WITNESS]): RepoId => (
  initializeByTypeGuard(e, isRepoId, 'RepoId')
);

export type IntegerSecond = Brand<NonNegativeInteger, 'IntegerSecond'>;
export const isIntegerSecond = (e: unknown): e is IntegerSecond => isNonNegativeInteger(e);
export const IntegerSecond = (e: IntegerSecond[WITNESS]): IntegerSecond => (
  initializeByTypeGuard(e, isIntegerSecond, 'IntegerSecond')
);
