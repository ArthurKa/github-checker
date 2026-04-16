import { apiUrls } from '@repo/common/src/commonUrls';
import { routes } from '@repo/common/src/zod';
import { mountSubscribe } from './subscribe';
import { mountConfirm } from './confirm';
import { mountSubscriptions } from './subscriptions';
import { mountUnsubscribe } from './unsubscribe';
import type { App } from '../app';
import { mountSwaggerDocs } from './swaggerDocs';
import { docTags } from '../docTags';

export const mountRouter = async (app: App) => {
  await mountSwaggerDocs(app);
  mountSubscribe(app);
  mountConfirm(app);
  mountUnsubscribe(app);
  mountSubscriptions(app);

  app.get(apiUrls.health, {
    schema: {
      tags: [docTags.health.name],
      summary: 'Health check',
      response: routes.health.RouteResponse,
    },
  }, (req, res) => {
    res.status(200).send(true);
  });
};
