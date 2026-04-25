import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Collection } from 'mongodb';
import assert from 'assert';
import { isArrayLength, isNull } from '@arthurka/ts-utils';
import { Email, IntegerSecond, ReleaseTag, RepoId, RepoName, StringURL, SubscribeToken, UnsubscribeToken } from '@repo/common/src/brands';
import { generateUUID } from '@repo/common/src/utils';
import { routes } from '@repo/common/src/schemas';
import { removeMongoId } from '@repo/common/src/utils/removeMongoId';
import Redis from 'ioredis';
import { REDIS_CONNECTION_URL } from '@repo/common/src/envVariables/private';
import { processEnvFlags } from '@repo/common/src/utils/processEnvFlags';
import { App, createApp } from '../app';
import { DbSubscription } from '../services/db/subscriptionService';
import { db, initDb } from '../db';
import { getRepoByRepoName } from '../services/fetch/github/getRepoByRepoName';
import { cacheRepoLatestReleaseById, getRepoLatestReleaseByRepoName } from '../services/fetch/github/getRepoLatestRelease';
import { sendSubscriptionConfirmationMail } from '../services/mailer';
import { notifyReleaseUpdate } from '../utils/notifyReleaseUpdate';
import { DbRepo } from '../services/db/repoService';
import { redisNamespaceKeys } from '../services/redisService';

const MOCK_REPO_NAME = RepoName('test-owner/test-repo');
const MOCK_REPO_ID = RepoId(12345);
const MOCK_RELEASE_TAG = ReleaseTag('v19.0.0');
const MOCK_RELEASE_TAG_URL = StringURL('http://example.com');

vi.mock('../services/mailer', () => ({
  sendSubscriptionConfirmationMail: vi.fn<typeof sendSubscriptionConfirmationMail>(() => Promise.resolve()),
} satisfies Partial<Record<keyof typeof import('../services/mailer'), ReturnType<typeof vi.fn>>>));
vi.mock('../services/fetch/github/getRepoByRepoName', () => ({
  getRepoByRepoName: vi.fn<typeof getRepoByRepoName>(() => (
    Promise.resolve<Awaited<ReturnType<typeof getRepoByRepoName>>>({
      success: true,
      data: {
        id: MOCK_REPO_ID,
        full_name: MOCK_REPO_NAME,
      },
    })
  )),
} satisfies Partial<Record<keyof typeof import('../services/fetch/github/getRepoByRepoName'), ReturnType<typeof vi.fn>>>));
vi.mock('../services/fetch/github/getRepoLatestRelease', () => ({
  getRepoLatestReleaseByRepoName: vi.fn<typeof getRepoLatestReleaseByRepoName>(() => (
    Promise.resolve<Awaited<ReturnType<typeof getRepoLatestReleaseByRepoName>>>({
      success: true,
      data: {
        tag_name: MOCK_RELEASE_TAG,
        html_url: MOCK_RELEASE_TAG_URL,
      },
    })
  )),
  cacheRepoLatestReleaseById: vi.fn<typeof cacheRepoLatestReleaseById>(() => Promise.resolve()),
} satisfies Partial<Record<keyof typeof import('../services/fetch/github/getRepoLatestRelease'), ReturnType<typeof vi.fn>>>));
vi.mock('../utils/notifyReleaseUpdate', () => ({
  notifyReleaseUpdate: vi.fn<typeof notifyReleaseUpdate>(() => Promise.resolve()),
} satisfies Partial<Record<keyof typeof import('../utils/notifyReleaseUpdate'), ReturnType<typeof vi.fn>>>));

const mocks = {
  sendSubscriptionConfirmationMail: vi.mocked(sendSubscriptionConfirmationMail),
  getRepoByRepoName: vi.mocked(getRepoByRepoName),
  getRepoLatestReleaseByRepoName: vi.mocked(getRepoLatestReleaseByRepoName),
  cacheRepoLatestReleaseById: vi.mocked(cacheRepoLatestReleaseById),
  notifyReleaseUpdate: vi.mocked(notifyReleaseUpdate),
};

let app: App | null = null;
let subscriptionCollection: Collection<DbSubscription> | null = null;
let repoCollection: Collection<DbRepo> | null = null;
let redis: Redis | null = null;

beforeAll(async () => {
  await initDb();
  subscriptionCollection = db().collection<DbSubscription>('subscriptions');
  repoCollection = db().collection<DbRepo>('repos');

  app = await createApp();
  await app.ready();

  redis = new Redis(REDIS_CONNECTION_URL);
  await redis.flushdb();
});
afterAll(async () => {
  await db().dropDatabase();

  assert(!isNull(app));
  assert(!isNull(redis));

  await app.close();
  await redis.quit();
});
beforeEach(async () => {
  assert(!isNull(subscriptionCollection));
  assert(!isNull(repoCollection));
  assert(!isNull(redis));

  expect(await redis.keys(`${redisNamespaceKeys.githubApiCache}:*`)).toStrictEqual([]);
  await subscriptionCollection.deleteMany();
  await repoCollection.deleteMany();

  vi.resetAllMocks();
});
afterEach(async () => {
  assert(!isNull(redis));

  expect(await redis.keys(`${redisNamespaceKeys.githubApiCache}:*`)).toStrictEqual([]);
});

describe('POST /subscribe', () => {
  it('creates unconfirmed subscription and sends confirmation email', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const email = Email('test@example.com');

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email,
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<routes.subscribe.RouteResponse[201]>()).toBe(true);

    const subscription = await subscriptionCollection.findOne({
      email,
      repoId: MOCK_REPO_ID,
    });

    expect(subscription).not.toBeNull();
    assert(!isNull(subscription));

    expect(subscription.email).toBe(email);
    expect(subscription.repoId).toBe(MOCK_REPO_ID);
    expect(subscription.confirmation.isConfirmed).toBe(false);
    assert(subscription.confirmation.isConfirmed === false);

    expect(subscription.confirmation.subscribeToken).toBeTruthy();

    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledOnce();
    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledWith<Parameters<typeof sendSubscriptionConfirmationMail>>({
      to: email,
      repoName: MOCK_REPO_NAME,
      subscribeToken: subscription.confirmation.subscribeToken,
      repoRelease: {
        tag_name: MOCK_RELEASE_TAG,
        html_url: MOCK_RELEASE_TAG_URL,
      },
    });
  });

  it('sends confirmation email even if unconfirmed subscription already exists', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const email = Email('test@example.com');
    const isConfirmed = false;
    const subscribeToken = SubscribeToken(generateUUID());

    await subscriptionCollection.insertOne({
      email,
      repoId: MOCK_REPO_ID,
      confirmation: {
        isConfirmed,
        subscribeToken,
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email,
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<routes.subscribe.RouteResponse[201]>()).toBe(true);

    const subscriptions = await subscriptionCollection.find({
      email,
      repoId: MOCK_REPO_ID,
    }).toArray();

    expect(subscriptions.map(removeMongoId)).toStrictEqual([{
      email,
      repoId: MOCK_REPO_ID,
      confirmation: {
        isConfirmed,
        subscribeToken,
      },
    }]);
    assert(isArrayLength(subscriptions, '===', 1));
    assert(subscriptions[0].confirmation.isConfirmed === isConfirmed);

    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledOnce();
    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledWith<Parameters<typeof sendSubscriptionConfirmationMail>>({
      to: email,
      repoName: MOCK_REPO_NAME,
      subscribeToken: subscriptions[0].confirmation.subscribeToken,
      repoRelease: {
        tag_name: MOCK_RELEASE_TAG,
        html_url: MOCK_RELEASE_TAG_URL,
      },
    });
  });

  it('does not send email and returns 409 when subscription is already confirmed (isConfirmed: true)', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const email = Email('test@example.com');

    await subscriptionCollection.insertOne({
      email,
      repoId: MOCK_REPO_ID,
      confirmation: {
        isConfirmed: true,
        unsubscribeToken: UnsubscribeToken(generateUUID()),
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email,
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(409);
    expect(res.json<routes.subscribe.RouteResponse[409]>()).toStrictEqual({
      type: 'AlreadySubscribed',
      email,
      repoName: MOCK_REPO_NAME,
      repoId: MOCK_REPO_ID,
    });

    expect(mocks.sendSubscriptionConfirmationMail).not.toHaveBeenCalled();
  });

  it('returns 404 when GitHub repo is not found', async () => {
    assert(!isNull(app));

    mocks.getRepoByRepoName.mockResolvedValue({
      success: false,
      error: 404,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: Email('test@example.com'),
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(404);
    expect(res.json<routes.subscribe.RouteResponse[404]>()).toStrictEqual({
      type: 'RepoNotFound',
      repoName: MOCK_REPO_NAME,
    });

    expect(mocks.sendSubscriptionConfirmationMail).not.toHaveBeenCalled();
  });

  it('returns 500 when only GitHub repo release tag is not found', async () => {
    assert(!isNull(app));

    mocks.getRepoLatestReleaseByRepoName.mockResolvedValue({
      success: false,
      error: 404,
    });

    processEnvFlags.muteOnceApiLogError500.on();
    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: Email('test@example.com'),
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });
    processEnvFlags.muteOnceApiLogError500.off();

    expect(res.statusCode).toBe(500);
    expect(res.json<routes.subscribe.RouteResponse[500]>()).toStrictEqual({
      type: 'UnexpectedServerError',
    });

    expect(mocks.sendSubscriptionConfirmationMail).not.toHaveBeenCalled();
  });

  it('returns 503 with retry-after header when GitHub repo request hits rate limit', async () => {
    assert(!isNull(app));

    const retryAfter = IntegerSecond(60);

    mocks.getRepoByRepoName.mockResolvedValue({
      success: false,
      error: 503,
      retryAfter,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: Email('test@example.com'),
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(503);
    expect(res.json<routes.subscribe.RouteResponse[503]>()).toStrictEqual({
      type: 'GitHubLimitExceeded',
    });
    expect(res.headers['retry-after']).toBe(retryAfter.toString());

    expect(mocks.sendSubscriptionConfirmationMail).not.toHaveBeenCalled();
  });

  it('returns 503 with retry-after header when GitHub repo release tag request hits rate limit', async () => {
    assert(!isNull(app));

    const retryAfter = IntegerSecond(123);

    mocks.getRepoLatestReleaseByRepoName.mockResolvedValue({
      success: false,
      error: 503,
      retryAfter,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: Email('test@example.com'),
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(503);
    expect(res.json<routes.subscribe.RouteResponse[503]>()).toStrictEqual({
      type: 'GitHubLimitExceeded',
    });
    expect(res.headers['retry-after']).toBe(retryAfter.toString());

    expect(mocks.sendSubscriptionConfirmationMail).not.toHaveBeenCalled();
  });

  it('returns 400 when email is invalid', async () => {
    assert(!isNull(app));

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: 'not-an-email' as any,
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<routes.subscribe.RouteResponse[400]>()).toMatchObject({
      type: 'InputDataValidationError',
    });

    expect(mocks.sendSubscriptionConfirmationMail).not.toHaveBeenCalled();
  });

  it('returns 400 when repoName is invalid', async () => {
    assert(!isNull(app));

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: Email('test@example.com'),
        repoName: 'react' as any,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<routes.subscribe.RouteResponse[400]>()).toMatchObject({
      type: 'InputDataValidationError',
    });

    expect(mocks.sendSubscriptionConfirmationMail).not.toHaveBeenCalled();
  });

  it('trims whitespace from repoName before processing', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));
    assert(!isNull(repoCollection));

    const email = Email('test@example.com');

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email,
        repoName: RepoName(`  ${MOCK_REPO_NAME}  `),
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<routes.subscribe.RouteResponse[201]>()).toBe(true);

    expect(mocks.getRepoByRepoName).toHaveBeenCalledWith<Parameters<typeof getRepoByRepoName>>(MOCK_REPO_NAME);

    const subscription = await subscriptionCollection.findOne({
      email,
      repoId: MOCK_REPO_ID,
    }).then(removeMongoId);
    const repo = await repoCollection.findOne({
      id: MOCK_REPO_ID,
    }).then(removeMongoId);

    expect(subscription).not.toBeNull();
    assert(!isNull(subscription));

    expect(subscription.email).toBe(email);
    expect(subscription.repoId).toBe(MOCK_REPO_ID);
    expect(subscription.confirmation.isConfirmed).toBe(false);
    assert(subscription.confirmation.isConfirmed === false);

    expect(subscription.confirmation.subscribeToken).toBeTruthy();

    expect(repo).toStrictEqual({
      id: MOCK_REPO_ID,
      name: MOCK_REPO_NAME,
      latestTag: {
        tag: MOCK_RELEASE_TAG,
        url: MOCK_RELEASE_TAG_URL,
      },
    });

    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledOnce();
    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledWith<Parameters<typeof sendSubscriptionConfirmationMail>>({
      to: email,
      repoName: MOCK_REPO_NAME,
      subscribeToken: subscription.confirmation.subscribeToken,
      repoRelease: {
        tag_name: MOCK_RELEASE_TAG,
        html_url: MOCK_RELEASE_TAG_URL,
      },
    });
  });

  it('works when repo has no releases (latestTag: null)', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const email = Email('test@example.com');
    const repoRelease = null;

    mocks.getRepoLatestReleaseByRepoName.mockResolvedValue({
      success: true,
      data: repoRelease,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email,
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<routes.subscribe.RouteResponse[201]>()).toBe(true);

    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledOnce();
    expect(mocks.sendSubscriptionConfirmationMail).toHaveBeenCalledWith<Parameters<typeof sendSubscriptionConfirmationMail>>(
      expect.objectContaining<Partial<Parameters<typeof sendSubscriptionConfirmationMail>[0]>>({
        to: email,
        repoName: MOCK_REPO_NAME,
        repoRelease,
      }),
    );
  });

  it('caches GitHub API fetched data', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));

    const email = Email('test@example.com');

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email,
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<routes.subscribe.RouteResponse[201]>()).toBe(true);

    expect(mocks.cacheRepoLatestReleaseById).toHaveBeenCalledOnce();
    expect(mocks.cacheRepoLatestReleaseById).toHaveBeenCalledWith<Parameters<typeof cacheRepoLatestReleaseById>>(MOCK_REPO_ID, {
      tag_name: MOCK_RELEASE_TAG,
      html_url: MOCK_RELEASE_TAG_URL,
    });
  });

  it('sends notifications to all already subscribed emails if new release tag is out', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));
    assert(!isNull(repoCollection));

    const latestTag = {
      tag: ReleaseTag('v1.2.3'),
      url: StringURL('https://asd.com'),
    } satisfies DbRepo['latestTag'];

    await subscriptionCollection.insertMany([
      {
        email: Email('test-user1@gmail.com'),
        repoId: MOCK_REPO_ID,
        confirmation: {
          isConfirmed: true,
          unsubscribeToken: UnsubscribeToken(generateUUID()),
        },
      },
      {
        email: Email('test-user2@gmail.com'),
        repoId: MOCK_REPO_ID,
        confirmation: {
          isConfirmed: true,
          unsubscribeToken: UnsubscribeToken(generateUUID()),
        },
      },
    ]);
    await repoCollection.insertOne({
      id: MOCK_REPO_ID,
      name: MOCK_REPO_NAME,
      latestTag,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: Email('new-test@example.com'),
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<routes.subscribe.RouteResponse[201]>()).toBe(true);

    expect(mocks.notifyReleaseUpdate).toHaveBeenCalledOnce();
    expect(mocks.notifyReleaseUpdate).toHaveBeenCalledWith<Parameters<typeof notifyReleaseUpdate>>(
      expect.objectContaining<Partial<Parameters<typeof notifyReleaseUpdate>[0]>>({
        id: MOCK_REPO_ID,
        name: MOCK_REPO_NAME,
        latestTag,
      }),
      {
        tag_name: MOCK_RELEASE_TAG,
        html_url: MOCK_RELEASE_TAG_URL,
      },
    );
  });

  it('sends notifications to all already subscribed emails if new release null', async () => {
    assert(!isNull(app));
    assert(!isNull(subscriptionCollection));
    assert(!isNull(repoCollection));

    const latestTag = {
      tag: ReleaseTag('v1.2.3'),
      url: StringURL('https://asd.com'),
    } satisfies DbRepo['latestTag'];

    mocks.getRepoLatestReleaseByRepoName.mockResolvedValue({
      success: true,
      data: null,
    });

    await subscriptionCollection.insertMany([
      {
        email: Email('test-user1@gmail.com'),
        repoId: MOCK_REPO_ID,
        confirmation: {
          isConfirmed: true,
          unsubscribeToken: UnsubscribeToken(generateUUID()),
        },
      },
      {
        email: Email('test-user2@gmail.com'),
        repoId: MOCK_REPO_ID,
        confirmation: {
          isConfirmed: true,
          unsubscribeToken: UnsubscribeToken(generateUUID()),
        },
      },
    ]);
    await repoCollection.insertOne({
      id: MOCK_REPO_ID,
      name: MOCK_REPO_NAME,
      latestTag,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/subscribe',
      payload: {
        email: Email('new-test@example.com'),
        repoName: MOCK_REPO_NAME,
      } satisfies routes.subscribe.ReqBody,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<routes.subscribe.RouteResponse[201]>()).toBe(true);

    expect(mocks.notifyReleaseUpdate).toHaveBeenCalledOnce();
    expect(mocks.notifyReleaseUpdate).toHaveBeenCalledWith<Parameters<typeof notifyReleaseUpdate>>(
      expect.objectContaining<Partial<Parameters<typeof notifyReleaseUpdate>[0]>>({
        id: MOCK_REPO_ID,
        name: MOCK_REPO_NAME,
        latestTag,
      }),
      null,
    );
  });
});
