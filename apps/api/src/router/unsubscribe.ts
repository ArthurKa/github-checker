import { Express } from 'express';
import { routes } from '@repo/common/src/zod';
import { apiUrls } from '@repo/common/src/commonUrls';
import { subscriptionService } from '../services/db/subscriptionService';

export const mountUnsubscribe = (app: Express) => {
  app.get<unknown, routes.unsubscribe.RouteResponse>(`${apiUrls.unsubscribe}/:token`, async (req, res) => {
    const { success, data, error } = routes.unsubscribe.UrlParams.safeParse(req.params);
    if(success === false) {
      res.status(400).json({
        success: false,
        error: {
          type: 'WrongUrlParams',
          __WARNING_DO_NOT_USE__zodIssues: error.issues,
        },
      });
      return;
    }

    const removeResult = await subscriptionService.remove(data.token);
    switch(removeResult) {
      case 'NotFound':
        res.status(404).json({
          success: false,
          error: {
            type: 'TokenNotFound',
          },
        });
        return;
      case 'OK':
        break;
      default:
        ((e: never) => e)(removeResult);
        throw new Error('This should never happen. |2w33ah|');
    }

    res.json({
      success: true,
      data: true,
    });
  });
};
