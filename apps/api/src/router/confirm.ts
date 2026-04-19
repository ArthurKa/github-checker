import { routes } from '@repo/common/src/schemas';
import { apiUrls } from '@repo/common/src/commonUrls';
import { subscriptionService } from '../services/db/subscriptionService';
import type { App } from '../app';
import { docTags } from '../docTags';

export const mountConfirm = (app: App) => {
  app.get(`${apiUrls.confirm}/:token`, {
    schema: {
      tags: [docTags.subscription.name],
      summary: 'Confirm email subscription',
      description: 'Confirms a subscription using the token sent in the confirmation email.',
      params: routes.confirm.UrlParams,
      response: routes.confirm.RouteResponse,
    },
  }, async (req, res) => {
    const confirmResult = await subscriptionService.confirm(req.params.token);
    switch(confirmResult) {
      case 'NotFound':
        res.status(404).send({
          type: 'TokenNotFound',
          token: req.params.token,
        });
        return;
      case 'OK':
        break;
      default:
        ((e: never) => e)(confirmResult);
        throw new Error('This should never happen. |4i3fvy|');
    }

    res.status(200).send(true);
  });
};
