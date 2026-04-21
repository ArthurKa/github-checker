import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Collection } from 'mongodb';
import assert from 'assert';
import { isNull } from '@arthurka/ts-utils';
import { Email, RepoId, SubscribeToken, UnsubscribeToken, UUID } from '@repo/common/src/brands';
import { generateUUID } from '@repo/common/src/utils';
import { routes } from '@repo/common/src/schemas';
import { App, createApp } from '../app';
import { DbSubscription } from '../services/db/subscriptionService';
import { db, initDb } from '../db';

let app: App | null = null;
let subscriptionCollection: Collection<DbSubscription> | null = null;

beforeAll(async () => {
  await initDb();
  subscriptionCollection = db().collection<DbSubscription>('subscriptions');

  app = await createApp();
  await app.ready();
});
afterAll(async () => {
  assert(!isNull(app), 'Something went wrong. |u7g5iy|');

  await db().dropDatabase();
  await app.close();
});
beforeEach(async () => {
  assert(!isNull(subscriptionCollection), 'Something went wrong. |zw98kf|');

  await subscriptionCollection.deleteMany();
});

describe('GET /unsubscribe', () => {
  it('unsubscribes successfully and deletes record', async () => {
    assert(!isNull(app), 'Something went wrong. |hdw24i|');
    assert(!isNull(subscriptionCollection), 'Something went wrong. |7qm2dy|');

    const unsubscribeToken = UnsubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email: Email('test@example.com'),
      repoId: RepoId(123),
      confirmation: {
        isConfirmed: true,
        unsubscribeToken,
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/unsubscribe/${unsubscribeToken}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json<routes.unsubscribe.RouteResponse[200]>()).toBe(true);

    const record = await subscriptionCollection.findOne({
      'confirmation.unsubscribeToken': unsubscribeToken,
    });

    expect(record).toBeNull();
  });

  it('returns 404 when token does not exist', async () => {
    assert(!isNull(app), 'Something went wrong. |8ohb1t|');

    const token = UnsubscribeToken(generateUUID());

    const res = await app.inject({
      method: 'GET',
      url: `/unsubscribe/${token}`,
    });

    expect(res.statusCode).toBe(404);
    expect(res.json<routes.unsubscribe.RouteResponse[404]>()).toStrictEqual({
      type: 'TokenNotFound',
      token,
    });
  });

  it('second call returns 404 after successful unsubscribe (idempotency)', async () => {
    assert(!isNull(app), 'Something went wrong. |1cqn1o|');
    assert(!isNull(subscriptionCollection), 'Something went wrong. |9fr9ix|');

    const unsubscribeToken = UnsubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email: Email('test@example.com'),
      repoId: RepoId(123),
      confirmation: {
        isConfirmed: true,
        unsubscribeToken,
      },
    });

    const first = await app.inject({
      method: 'GET',
      url: `/unsubscribe/${unsubscribeToken}`,
    });

    expect(first.statusCode).toBe(200);

    const second = await app.inject({
      method: 'GET',
      url: `/unsubscribe/${unsubscribeToken}`,
    });

    expect(second.statusCode).toBe(404);
  });

  it('returns 404 when trying to unsubscribe unconfirmed subscription (isConfirmed: false)', async () => {
    assert(!isNull(app), 'Something went wrong. |77af3s|');
    assert(!isNull(subscriptionCollection), 'Something went wrong. |0c4uis|');

    const isConfirmed = false;
    const subscribeToken = SubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email: Email('test@example.com'),
      repoId: RepoId(123),
      confirmation: {
        isConfirmed,
        subscribeToken,
      },
    });

    const fakeUnsubscribeToken = UnsubscribeToken(generateUUID());

    expect<UUID>(subscribeToken).not.toBe(fakeUnsubscribeToken);

    const res = await app.inject({
      method: 'GET',
      url: `/unsubscribe/${fakeUnsubscribeToken}`,
    });

    expect(res.statusCode).toBe(404);
    expect(res.json<routes.unsubscribe.RouteResponse[404]>()).toStrictEqual({
      type: 'TokenNotFound',
      token: fakeUnsubscribeToken,
    });

    const record = await subscriptionCollection.findOne({
      'confirmation.subscribeToken': subscribeToken,
    });

    expect(record).not.toBeNull();
    assert(!isNull(record), 'This should never happen. |1u2w74|');

    expect(record.confirmation.isConfirmed).toBe(isConfirmed);
  });

  it('does not delete subscription if unsubscribe token accidentally matches subscribeToken', async () => {
    assert(!isNull(app), 'Something went wrong. |eo4hs4|');
    assert(!isNull(subscriptionCollection), 'Something went wrong. |dz1h43|');

    const isConfirmed = false;
    const subscribeToken = SubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email: Email('test@example.com'),
      repoId: RepoId(123),
      confirmation: {
        isConfirmed,
        subscribeToken,
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/unsubscribe/${subscribeToken}`,
    });

    expect(res.statusCode).toBe(404);

    const record = await subscriptionCollection.findOne({
      'confirmation.subscribeToken': subscribeToken,
    });

    expect(record).not.toBeNull();
    assert(!isNull(record), 'This should never happen. |a92sy0|');

    expect(record.confirmation.isConfirmed).toBe(isConfirmed);
  });

  it('returns 400 when token format is invalid', async () => {
    assert(!isNull(app), 'Something went wrong. |6qt6bq|');

    const res = await app.inject({
      method: 'GET',
      url: '/confirm/not-a-valid-uuid-token',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<routes.unsubscribe.RouteResponse[400]>()).toMatchObject({
      type: 'InputDataValidationError',
    });
  });
});
