import { describe, expect, it } from 'vitest';
import { Email, ReleaseTag, RepoId, RepoName, SubscribeToken, UnsubscribeToken } from '@repo/common/src/brands';
import { generateUUID } from '@repo/common/src/utils';
import { makeSubscriptionsRespData } from './makeSubscriptionsRespData';
import type { DbRepo } from '../services/db/repoService';
import type { DbSubscription } from '../services/db/subscriptionService';

const repo = (overrides: Partial<DbRepo> = {}) => ({
  id: RepoId(123),
  name: RepoName(RepoName('facebook/react')),
  latestTag: ReleaseTag(ReleaseTag('v1.0.0')),
  ...overrides,
});
const subscriptionConfirmed = (overrides: Partial<DbSubscription> = {}) => ({
  email: Email('test@mail.com'),
  repoId: RepoId(123),
  confirmation: {
    isConfirmed: true as const,
    unsubscribeToken: UnsubscribeToken(generateUUID()),
  },
  ...overrides,
});
const subscriptionUnconfirmed = (overrides: Partial<DbSubscription> = {}) => ({
  email: Email('test@mail.com'),
  repoId: RepoId(123),
  confirmation: {
    isConfirmed: false as const,
    subscribeToken: SubscribeToken(generateUUID()),
  },
  ...overrides,
});

describe('makeSubscriptionsRespData', () => {
  it('maps confirmed subscription with latestTag', () => {
    const result = makeSubscriptionsRespData(
      [subscriptionConfirmed()],
      [repo()],
    );

    expect(result).toStrictEqual([
      {
        email: Email('test@mail.com'),
        repo: RepoName('facebook/react'),
        confirmed: true,
        last_seen_tag: ReleaseTag('v1.0.0'),
      },
    ]);
  });

  it('maps unconfirmed subscription with latestTag', () => {
    const result = makeSubscriptionsRespData(
      [subscriptionUnconfirmed()],
      [repo()],
    );

    expect(result).toStrictEqual([
      {
        email: Email('test@mail.com'),
        repo: RepoName('facebook/react'),
        confirmed: false,
        last_seen_tag: ReleaseTag('v1.0.0'),
      },
    ]);
  });

  it('omits last_seen_tag when latestTag is null', () => {
    const result = makeSubscriptionsRespData(
      [subscriptionConfirmed()],
      [repo({ latestTag: null })],
    );

    expect(result).toStrictEqual([
      {
        email: Email('test@mail.com'),
        repo: RepoName('facebook/react'),
        confirmed: true,
      },
    ]);
  });

  it('handles multiple subscriptions', () => {
    const result = makeSubscriptionsRespData(
      [
        subscriptionConfirmed({ repoId: RepoId(123) }),
        subscriptionUnconfirmed({ repoId: RepoId(222), email: Email('a@mail.com') }),
      ],
      [
        repo({ id: RepoId(123), name: RepoName('repo/one') }),
        repo({ id: RepoId(222), name: RepoName('repo/two'), latestTag: null }),
      ],
    );

    expect(result).toStrictEqual([
      {
        email: Email('test@mail.com'),
        repo: RepoName('repo/one'),
        confirmed: true,
        last_seen_tag: ReleaseTag('v1.0.0'),
      },
      {
        email: Email('a@mail.com'),
        repo: RepoName('repo/two'),
        confirmed: false,
      },
    ]);
  });

  it('throws if repo is not found', () => {
    expect(() => makeSubscriptionsRespData([subscriptionConfirmed()], [])).toThrow();
  });
});
