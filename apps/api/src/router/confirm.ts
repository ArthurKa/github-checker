import { Express } from 'express';
import { routes } from '@repo/common/src/zod';
import { apiUrls } from '@repo/common/src/commonUrls';
import { simplifyZodIssues } from '@repo/common/src/zod/utils/simplifyZodIssues';
import { subscriptionService } from '../services/db/subscriptionService';

export const mountConfirm = (app: Express) => {
  app.get<unknown, routes.confirm.RouteResponse>(`${apiUrls.confirm}/:token`, async (req, res) => {
    const { success, data, error } = routes.confirm.UrlParams.safeParse(req.params);
    if(success === false) {
      res.status(400).json({
        success: false,
        error: {
          type: 'WrongUrlParams',
          simplifiedZodIssues: simplifyZodIssues(error.issues),
        },
      });
      return;
    }

    const confirmResult = await subscriptionService.confirm(data.token);
    switch(confirmResult) {
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
        ((e: never) => e)(confirmResult);
        throw new Error('This should never happen. |k2v3kx|');
    }

    res.json({
      success: true,
      data: true,
    });
  });
};
