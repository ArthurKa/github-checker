import { Express } from 'express';
import { routes } from '@repo/common/src/zod';
import { apiUrls } from '@repo/common/src/commonUrls';
import { simplifyZodIssues } from '@repo/common/src/zod/utils/simplifyZodIssues';
import { subscriptionService } from '../services/db/subscriptionService';
import { repoService } from '../services/db/repoService';
import { makeSubscriptionsRespData } from '../utils/makeSubscriptionsRespData';

export const mountSubscriptions = (app: Express) => {
  app.get<unknown, routes.subscriptions.RouteResponse>(apiUrls.subscriptions, async (req, res) => {
    const { success, data, error } = routes.subscriptions.ReqQuery.safeParse(req.query);
    if(success === false) {
      res.status(400).json({
        success: false,
        error: {
          type: 'WrongQueryParams',
          simplifiedZodIssues: simplifyZodIssues(error.issues),
        },
      });
      return;
    }

    const subscriptions = await subscriptionService.findByEmail(data.email);
    const repos = await repoService.findByRepoIds(subscriptions.map(e => e.repoId));

    res.json({
      success: true,
      data: makeSubscriptionsRespData(subscriptions, repos),
    });
  });
};
