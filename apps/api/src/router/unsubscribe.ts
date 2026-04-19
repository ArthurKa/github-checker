import { routes } from '@repo/common/src/schemas';
import { apiUrls } from '@repo/common/src/commonUrls';
import { subscriptionService } from '../services/db/subscriptionService';
import type { App } from '../app';
import { docTags } from '../docTags';

export const mountUnsubscribe = (app: App) => {
  app.get(`${apiUrls.unsubscribe}/:token`, {
    schema: {
      tags: [docTags.subscription.name],
      summary: 'Unsubscribe from release notifications',
      description: 'Unsubscribes an email from release notifications using the token sent in emails.',
      params: routes.unsubscribe.UrlParams,
      response: routes.unsubscribe.RouteResponse,
    },
  }, async (req, res) => {
    const removeResult = await subscriptionService.remove(req.params.token);
    switch(removeResult) {
      case 'NotFound':
        res.status(404).send({
          type: 'TokenNotFound',
          token: req.params.token,
        });
        return;
      case 'OK':
        break;
      default:
        ((e: never) => e)(removeResult);
        throw new Error('This should never happen. |2w33ah|');
    }

    res.status(200).send(true);
  });
};
