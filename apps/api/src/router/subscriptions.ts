import { routes } from '@repo/common/src/schemas';
import { apiUrls } from '@repo/common/src/commonUrls';
import { getNotUndefined } from '@arthurka/ts-utils';
import { subscriptionService } from '../services/db/subscriptionService';
import { repoService } from '../services/db/repoService';
import type { App } from '../app';
import { docTags } from '../docTags';

export const mountSubscriptions = (app: App) => {
  app.get(apiUrls.subscriptions, {
    schema: {
      tags: [docTags.subscription.name],
      summary: 'Get subscriptions for an email',
      description: 'Returns all active subscriptions for the given email address.',
      querystring: routes.subscriptions.ReqQuery,
      response: routes.subscriptions.RouteResponse,
    },
  }, async (req, res) => {
    const subscriptions = await subscriptionService.findByEmail(req.query.email);
    const repos = await repoService.findByRepoIds(subscriptions.map(e => e.repoId));

    res.status(200).send(
      subscriptions.map(({ repoId, email, confirmation }): routes.subscriptions.RouteResponse[200][number] => {
        const { name, latestTag } = getNotUndefined(repos.find(e => repoId === e.id), 'Something went wrong. |335him|');

        return {
          email,
          repo: name,
          isConfirmed: confirmation.isConfirmed,
          lastSeenTag: latestTag,
        };
      }),
    );
  });
};
