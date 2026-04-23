import { WithId } from 'mongodb';
import { castTo } from './helpers';

export const removeMongoId = <T extends WithId<{}> | null>(e: T) => {
  if(e === null) {
    castTo<null>(e);

    return e;
  }

  const { _id, ...rest } = e;

  return rest;
};
