import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import assert from 'assert';
import { isNull } from '@arthurka/ts-utils';
import { Collection } from 'mongodb';
import { Email, ReleaseTag, RepoId, RepoName, StringURL, UnsubscribeToken } from '@repo/common/src/brands';
import { generateUUID, stringifyUrl } from '@repo/common/src/utils';
import { routes } from '@repo/common/src/schemas';
import { processEnvFlags } from '@repo/common/src/utils/processEnvFlags';
import { DbSubscription } from '../services/db/subscriptionService';
import { DbRepo } from '../services/db/repoService';
import { App, createApp } from '../app';
import { db, initDb } from '../db';

let app: App | null = null;
let subscriptionCollection: Collection<DbSubscription> | null = null;
let repoCollection: Collection<DbRepo> | null = null;

beforeAll(async () => {
  await initDb();
  subscriptionCollection = db().collection<DbSubscription>('subscriptions');
  repoCollection = db().collection<DbRepo>('repos');

  app = await createApp();
  await app.ready();
});
afterAll(async () => {
  await db().dropDatabase();

  assert(!isNull(app));

  await app.close();
});
beforeEach(async () => {
  assert(!isNull(subscriptionCollection));
  assert(!isNull(repoCollection));

  await subscriptionCollection.deleteMany();
  await repoCollection.deleteMany();
});

describe('GET /subscriptions', () => {
  it('returns empty array when no subscriptions exist', async () => {
    assert(!isNull(app));

    const res = await app.inject({
      method: 'GET',
      url: stringifyUrl('/subscriptions', {
        email: Email('test@example.com'),
      } satisfies routes.subscriptions.ReqQuery),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json<routes.subscriptions.RouteResponse[200]>()).toStrictEqual([]);
  });

  it('returns subscriptions with repo info', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));
    assert(!isNull(repoCollection));

    const repoId = RepoId(123);
    const repoName = RepoName('owner/repo');
    const releaseTag = {
      tag: ReleaseTag('v1.0.0'),
      url: StringURL('https://asd.com'),
    } satisfies DbRepo['latestTag'];
    const email = Email('test@example.com');
    const isConfirmed = true;

    await Promise.all([
      subscriptionCollection.insertOne({
        email,
        repoId,
        confirmation: {
          isConfirmed,
          unsubscribeToken: UnsubscribeToken(generateUUID()),
        },
      }),
      repoCollection.insertOne({
        id: repoId,
        name: repoName,
        latestTag: releaseTag,
      }),
    ]);

    const res = await app.inject({
      method: 'GET',
      url: stringifyUrl('/subscriptions', {
        email,
      } satisfies routes.subscriptions.ReqQuery),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json<routes.subscriptions.RouteResponse[200]>()).toStrictEqual([
      {
        email,
        repo: repoName,
        isConfirmed,
        lastSeenTag: releaseTag.tag,
      },
    ] satisfies routes.subscriptions.RouteResponse[200]);
  });

  it('fails when repo is missing (invalid data state)', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const email = Email('test@example.com');

    await subscriptionCollection.insertOne({
      repoId: RepoId(222),
      email,
      confirmation: {
        isConfirmed: true,
        unsubscribeToken: UnsubscribeToken(generateUUID()),
      },
    });

    processEnvFlags.muteOnceApiLogError500.on();
    const res = await app.inject({
      method: 'GET',
      url: stringifyUrl('/subscriptions', {
        email,
      } satisfies routes.subscriptions.ReqQuery),
    });
    processEnvFlags.muteOnceApiLogError500.off();

    expect(res.statusCode).toBe(500);
  });
});
