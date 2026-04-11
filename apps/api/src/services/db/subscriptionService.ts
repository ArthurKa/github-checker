import { ObjectId, WithId } from 'mongodb';
import { Email, RepoId, SubscribeToken, UnsubscribeToken } from '@repo/common/src/brands';
import assert from 'assert';
import { isNull, Union } from '@arthurka/ts-utils';
import { generateUUID, SafeOmit } from '@repo/common/src/utils';
import { db } from '../../db';
import type { DbRepo } from './repoService';

export type DbSubscription = {
  email: Email;
  repoId: RepoId;
  confirmation: (
    | {
      isConfirmed: false;
      subscribeToken: SubscribeToken;
    }
    | {
      isConfirmed: true;
      unsubscribeToken: UnsubscribeToken;
    }
  );
};

export const subscriptionService = {
  get(_id: ObjectId): Promise<null | WithId<DbSubscription>> {
    const collection = db().collection<DbSubscription>('subscriptions');

    return collection.findOne({ _id });
  },
  findByEmail(email: Email): Promise<Array<WithId<DbSubscription>>> {
    const collection = db().collection<DbSubscription>('subscriptions');

    return collection.find({ email }).toArray();
  },
  async getAllSubscribedByRepoId(
    repoId: RepoId,
  ): Promise<Array<Union<
    & SafeOmit<WithId<DbSubscription>, 'confirmation' >
    & {
      confirmation: Extract<DbSubscription['confirmation'], { isConfirmed: true }>;
    }
  >>> {
    const collection = db().collection<DbSubscription>('subscriptions');

    const res = await collection.find({
      'confirmation.isConfirmed': true,
      repoId,
    }).toArray();

    return res.map(({ confirmation, ...rest }): Awaited<ReturnType<typeof this.getAllSubscribedByRepoId>>[number] => {
      assert(confirmation.isConfirmed === true, 'This should never happen. |e921o7|');

      return {
        ...rest,
        confirmation,
      };
    });
  },
  getAllSubscribedRepos() {
    const collection = db().collection<DbSubscription>('subscriptions');

    type AggregationResult = {
      repo: WithId<DbRepo>;
      subscriptionData: Array<{
        email: DbSubscription['email'];
        unsubscribeToken: Extract<DbSubscription['confirmation'], { isConfirmed: true }>['unsubscribeToken'];
      }>;
    };

    return collection.aggregate<AggregationResult>([
      {
        $match: {
          'confirmation.isConfirmed': true,
        },
      },
      {
        $group: {
          _id: '$repoId',
          subscriptionData: {
            $push: {
              email: '$email',
              unsubscribeToken: '$confirmation.unsubscribeToken',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'repos',
          localField: '_id',
          foreignField: 'id',
          // eslint-disable-next-line arthurka/space-after-keywords
          as: 'repo',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $unwind: '$repo',
      },
    ]).toArray();
  },
  async create(subscription: DbSubscription): Promise<WithId<DbSubscription>> {
    const collection = db().collection<DbSubscription>('subscriptions');

    const res = await collection.findOneAndUpdate(
      {
        email: subscription.email,
        repoId: subscription.repoId,
      },
      {
        $setOnInsert: subscription,
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );
    assert(!isNull(res), 'This should never happen. |a7ay9n|');

    return res;
  },
  async confirm(subscribeToken: SubscribeToken): Promise<'NotFound' | 'OK'> {
    const collection = db().collection<DbSubscription>('subscriptions');

    const { matchedCount } = await collection.updateOne(
      {
        'confirmation.subscribeToken': subscribeToken,
      },
      {
        $set: {
          confirmation: {
            isConfirmed: true,
            unsubscribeToken: UnsubscribeToken(generateUUID()),
          },
        },
      },
    );

    switch(matchedCount) {
      case 0:
        return 'NotFound';
      case 1:
        return 'OK';
      default:
        throw new Error('Something went wrong. |dm7uhq|');
    }
  },
  async remove(unsubscribeToken: UnsubscribeToken): Promise<'NotFound' | 'OK'> {
    const collection = db().collection<DbSubscription>('subscriptions');

    const { deletedCount } = await collection.deleteOne({
      'confirmation.unsubscribeToken': unsubscribeToken,
    });

    switch(deletedCount) {
      case 0:
        return 'NotFound';
      case 1:
        return 'OK';
      default:
        throw new Error('This should never happen. |7qr5w4|');
    }
  },
};
