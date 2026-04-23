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
  assert(!isNull(app));

  await db().dropDatabase();
  await app.close();
});
beforeEach(async () => {
  assert(!isNull(subscriptionCollection));

  await subscriptionCollection.deleteMany();
});

describe('GET /confirm', () => {
  it('confirms subscription successfully and marks it as confirmed', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const email = Email('test@example.com');
    const repoId = RepoId(123);
    const isConfirmed = false;
    const subscribeToken = SubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email,
      repoId,
      confirmation: {
        isConfirmed,
        subscribeToken,
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/confirm/${subscribeToken}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json<routes.confirm.RouteResponse[200]>()).toBe(true);

    const record = await subscriptionCollection.findOne({
      'confirmation.subscribeToken': subscribeToken,
    });

    expect(record).toBeNull();

    const confirmedRecord = await subscriptionCollection.findOne({
      email,
      repoId,
    });

    expect(confirmedRecord).not.toBeNull();
    assert(!isNull(confirmedRecord));

    expect(confirmedRecord.confirmation.isConfirmed).toBe(isConfirmed === false);
  });

  it('returns 404 when token does not exist', async () => {
    assert(!isNull(app));

    const token = SubscribeToken(generateUUID());

    const res = await app.inject({
      method: 'GET',
      url: `/confirm/${token}`,
    });

    expect(res.statusCode).toBe(404);
    expect(res.json<routes.confirm.RouteResponse[404]>()).toStrictEqual({
      type: 'TokenNotFound',
      token,
    });
  });

  it('second call returns 404 after successful confirm (idempotency)', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const subscribeToken = SubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email: Email('test@example.com'),
      repoId: RepoId(123),
      confirmation: {
        isConfirmed: false,
        subscribeToken,
      },
    });

    const first = await app.inject({
      method: 'GET',
      url: `/confirm/${subscribeToken}`,
    });

    expect(first.statusCode).toBe(200);

    const second = await app.inject({
      method: 'GET',
      url: `/confirm/${subscribeToken}`,
    });

    expect(second.statusCode).toBe(404);
  });

  it('returns 404 when trying to confirm an already-confirmed subscription (unsubscribeToken provided)', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const unsubscribeToken = UnsubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email: Email('test@example.com'),
      repoId: RepoId(123),
      confirmation: {
        isConfirmed: true,
        unsubscribeToken,
      },
    });

    const fakeSubscribeToken = SubscribeToken(generateUUID());

    expect<UUID>(unsubscribeToken).not.toBe(fakeSubscribeToken);

    const res = await app.inject({
      method: 'GET',
      url: `/confirm/${fakeSubscribeToken}`,
    });

    expect(res.statusCode).toBe(404);
    expect(res.json<routes.confirm.RouteResponse[404]>()).toStrictEqual({
      type: 'TokenNotFound',
      token: fakeSubscribeToken,
    });
  });

  it('does not confirm subscription if confirm token accidentally matches unsubscribeToken', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const isConfirmed = true;
    const unsubscribeToken = UnsubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email: Email('test@example.com'),
      repoId: RepoId(123),
      confirmation: {
        isConfirmed,
        unsubscribeToken,
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/confirm/${unsubscribeToken}`,
    });

    expect(res.statusCode).toBe(404);

    const record = await subscriptionCollection.findOne({
      'confirmation.unsubscribeToken': unsubscribeToken,
    });

    expect(record).not.toBeNull();
    assert(!isNull(record));

    expect(record.confirmation.isConfirmed).toBe(isConfirmed);
  });

  it('returns 400 when token format is invalid', async () => {
    assert(!isNull(app));

    const res = await app.inject({
      method: 'GET',
      url: '/confirm/not-a-valid-uuid-token',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<routes.confirm.RouteResponse[400]>()).toMatchObject({
      type: 'InputDataValidationError',
    });
  });
});
