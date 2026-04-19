import { trimMultiline } from '@arthurka/ts-utils';
import { apiUrls } from '@repo/common/src/commonUrls';
import type { App } from '../app';
import { mountSubscribe } from './subscribe';
import { mountConfirm } from './confirm';
import { mountSubscriptions } from './subscriptions';
import { mountUnsubscribe } from './unsubscribe';
import { mountDocs } from './docs';
import { mountHealth } from './health';

export const mountRouter = async (app: App) => {
  await mountDocs(app);
  mountSubscribe(app);
  mountConfirm(app);
  mountUnsubscribe(app);
  mountSubscriptions(app);
  mountHealth(app);

  app.get('/', {
    schema: {
      hide: true,
    },
  }, (req, res) => {
    res.header('content-type', 'text/html');
    res.status(200).send(
      trimMultiline`
        <a href="${apiUrls.docs.swagger}">Swagger docs</a>
        <br>
        <a href="${apiUrls.docs.scalar}">Scalar docs</a>
      `,
    );
  });

  app.get(apiUrls.docs._, {
    schema: {
      hide: true,
    },
  }, (req, res) => {
    res.status(307).redirect('/');
  });
};
