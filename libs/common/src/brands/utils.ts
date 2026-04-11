import { GuardedType } from '@arthurka/ts-utils';
import assert from 'assert';

export const initializeByTypeGuard = <T, U>(
  e: T,
  typeGuard: (e: unknown) => e is U,
  typeName: string,
): GuardedType<typeof typeGuard> => {
  assert(typeGuard(e), `${e} is not ${typeName}`);

  return e;
};
