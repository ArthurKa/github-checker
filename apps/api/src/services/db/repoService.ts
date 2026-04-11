import { ObjectId, WithId } from 'mongodb';
import { ReleaseTag, RepoId, RepoName } from '@repo/common/src/brands';
import { db } from '../../db';

export type DbRepo = {
  id: RepoId;
  name: RepoName;
  latestTag: ReleaseTag | null;
};

export const repoService = {
  get(_id: ObjectId): Promise<null | WithId<DbRepo>> {
    const collection = db().collection<DbRepo>('repos');

    return collection.findOne({ _id });
  },
  findByRepoIds(repoIds: RepoId[]): Promise<Array<WithId<DbRepo>>> {
    const collection = db().collection<DbRepo>('repos');

    return collection.find({
      id: {
        $in: repoIds,
      },
    }).toArray();
  },
  createOrUpdateWithReturnBefore(repo: DbRepo): Promise<null | WithId<DbRepo>> {
    const collection = db().collection<DbRepo>('repos');

    return collection.findOneAndUpdate(
      {
        id: repo.id,
      },
      {
        $set: repo,
      },
      {
        upsert: true,
        returnDocument: 'before',
      },
    );
  },
};
