import { getNotUndefined, isNull } from '@arthurka/ts-utils';
import { routes } from '@repo/common/src/zod';
import type { DbSubscription } from '../services/db/subscriptionService';
import type { DbRepo } from '../services/db/repoService';

export const makeSubscriptionsRespData = (
  subscriptions: DbSubscription[],
  repos: DbRepo[],
): Extract<routes.subscriptions.RouteResponse, { success: true }>['data'] => (
  subscriptions.map(({ repoId, email, confirmation }) => {
    const { name, latestTag } = getNotUndefined(repos.find(e => repoId === e.id), 'Something went wrong. |335him|');

    return {
      email,
      repo: name,
      confirmed: confirmation.isConfirmed,
      ...!isNull(latestTag) && {
        last_seen_tag: latestTag,
      },
    };
  })
);
