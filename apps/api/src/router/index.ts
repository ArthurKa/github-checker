import { apiUrls } from '@repo/common/src/commonUrls';
import { Express } from 'express';
import { routes } from '@repo/common/src/zod';
import swaggerUi from 'swagger-ui-express';
import { mountSubscribe } from './subscribe';
import { mountConfirm } from './confirm';
import { mountSubscriptions } from './subscriptions';
import { mountUnsubscribe } from './unsubscribe';

export const mountRouter = (app: Express) => {
  mountSubscribe(app);
  mountConfirm(app);
  mountUnsubscribe(app);
  mountSubscriptions(app);

  app.use('/', swaggerUi.serve, swaggerUi.setup(null, {
    customSiteTitle: 'GitHub Checker API',
    swaggerOptions: {
      url: '/swagger.yml',
    },
  }));

  app.get<unknown, routes.health.RouteResponse>(apiUrls.health, (req, res) => {
    res.json({
      success: true,
      data: true,
    });
  });
};
