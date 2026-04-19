import { routes } from '@repo/common/src/zod';
import { apiUrls } from '@repo/common/src/commonUrls';
import type { App } from '../app';
import { docTags } from '../docTags';

export const mountHealth = (app: App) => {
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
