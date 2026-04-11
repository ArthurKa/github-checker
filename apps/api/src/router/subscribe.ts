import { Express } from 'express';
import { routes } from '@repo/common/src/zod';
import { apiUrls } from '@repo/common/src/commonUrls';
import { isNull } from '@arthurka/ts-utils';
import { generateUUID } from '@repo/common/src/utils';
import { SubscribeToken } from '@repo/common/src/brands';
import { subscriptionService } from '../services/db/subscriptionService';
import { getRepoByRepoName } from '../services/fetch/github/getRepoByRepoName';
import { cacheRepoLatestReleaseById, getRepoLatestReleaseByRepoName } from '../services/fetch/github/getRepoLatestRelease';
import { repoService } from '../services/db/repoService';
import { sendSubscriptionConfirmationMail } from '../services/mailer';
import { shouldNotifyReleaseUpdate } from '../utils/shouldNotifyReleaseUpdate';
import { notifyReleaseUpdate } from '../utils/notifyReleaseUpdate';

export const mountSubscribe = (app: Express) => {
  app.post<unknown, routes.subscribe.RouteResponse>(apiUrls.subscribe, async (req, res) => {
    const { success, data, error } = routes.subscribe.ReqBody.safeParse(req.body);
    if(success === false) {
      res.status(400).json({
        success: false,
        error: {
          type: 'WrongBodyParams',
          __WARNING_DO_NOT_USE__zodIssues: error.issues,
        },
      });
      return;
    }

    const [githubRepo, repoLatestRelease] = await Promise.all([
      getRepoByRepoName(data.repo),
      getRepoLatestReleaseByRepoName(data.repo),
    ]);
    if(githubRepo.success === false) {
      switch(githubRepo.error) {
        case 503:
          res.header('Retry-After', githubRepo.retryAfter.toString());
          res.status(503).json({
            success: false,
            error: {
              type: 'GitHubLimitExceeded',
            },
          });
          break;
        case 404:
          res.status(404).json({
            success: false,
            error: {
              type: 'RepoNotFound',
            },
          });
          break;
        default:
          ((e: never) => e)(githubRepo);
          throw new Error('This should never happen. |cab8d5|');
      }
      return;
    }
    if(repoLatestRelease.success === false) {
      switch(repoLatestRelease.error) {
        case 503:
          res.header('Retry-After', repoLatestRelease.retryAfter.toString());
          res.status(503).json({ success: false,
            error: {
              type: 'GitHubLimitExceeded',
            } });
          break;
        case 404:
          throw new Error('This should never happen. |i62270|');
        default:
          ((e: never) => e)(repoLatestRelease);
          throw new Error('This should never happen. |c3sic5|');
      }
      return;
    }

    await cacheRepoLatestReleaseById(githubRepo.data.id, repoLatestRelease.data);

    const latestTag = isNull(repoLatestRelease.data) ? null : repoLatestRelease.data.tag_name;
    const [subscription, repoBefore] = await Promise.all([
      subscriptionService.create({
        email: data.email,
        repoId: githubRepo.data.id,
        confirmation: {
          isConfirmed: false,
          subscribeToken: SubscribeToken(generateUUID()),
        },
      }),
      repoService.createOrUpdateWithReturnBefore({
        id: githubRepo.data.id,
        latestTag,
        name: githubRepo.data.full_name,
      }),
    ]);

    if(shouldNotifyReleaseUpdate(repoBefore, latestTag)) {
      void notifyReleaseUpdate(repoBefore, repoLatestRelease.data);
    }
    if(subscription.confirmation.isConfirmed === true) {
      res.status(409).json({
        success: false,
        error: {
          type: 'AlreadySubscribed',
        },
      });
      return;
    }

    await sendSubscriptionConfirmationMail({
      to: data.email,
      repoName: githubRepo.data.full_name,
      repoRelease: repoLatestRelease.data,
      subscribeToken: subscription.confirmation.subscribeToken,
    });

    res.json({
      success: true,
      data: true,
    });
  });
};
