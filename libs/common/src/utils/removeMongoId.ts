import { WithId } from 'mongodb';

export const removeMongoId = <T extends WithId<{}> | null>(e: T) => {
  if(e === null) {
    return e;
  }

  const { _id, ...rest } = e;

  return rest;
};
