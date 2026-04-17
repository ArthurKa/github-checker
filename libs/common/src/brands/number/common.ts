import { Brand, WITNESS } from '@arthurka/ts-utils';
import { z } from 'zod/v4';
import { initializeByTypeGuard } from '../utils';

export type NonNegative = Brand<number, '>= 0'>;
export const isNonNegative = (e: unknown): e is NonNegative => (
  NonNegative.schema.safeParse(e).success
);
export const NonNegative = (e: NonNegative[WITNESS]): NonNegative => (
  initializeByTypeGuard(e, isNonNegative, 'NonNegative')
);
NonNegative.schema = z.number().gte(0);

export type Positive = Brand<NonNegative, '> 0'>;
export const isPositive = (e: unknown): e is Positive => (
  Positive.schema.safeParse(e).success
);
export const Positive = (e: Positive[WITNESS]): Positive => (
  initializeByTypeGuard(e, isPositive, 'Positive')
);
Positive.schema = z.intersection(NonNegative.schema, z.number().gt(0));

export type Integer = Brand<number, 'Integer'>;
export const isInteger = (e: unknown): e is Integer => (
  Integer.schema.safeParse(e).success
);
export const Integer = (e: Integer[WITNESS]): Integer => (
  initializeByTypeGuard(e, isInteger, 'Integer')
);
Integer.schema = z.number().int();

export type NonNegativeInteger = Brand<NonNegative, Integer>;
export const isNonNegativeInteger = (e: unknown): e is NonNegativeInteger => (
  NonNegativeInteger.schema.safeParse(e).success
);
export const NonNegativeInteger = (e: NonNegativeInteger[WITNESS]): NonNegativeInteger => (
  initializeByTypeGuard(e, isNonNegativeInteger, 'NonNegativeInteger')
);
NonNegativeInteger.schema = z.intersection(NonNegative.schema, Integer.schema);

export type PositiveInteger = Brand<Positive, Integer>;
export const isPositiveInteger = (e: unknown): e is PositiveInteger => (
  PositiveInteger.schema.safeParse(e).success
);
export const PositiveInteger = (e: PositiveInteger[WITNESS]): PositiveInteger => (
  initializeByTypeGuard(e, isPositiveInteger, 'PositiveInteger')
);
PositiveInteger.schema = z.intersection(Positive.schema, Integer.schema);
