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
import type { App } from '../app';
import { docTags } from '../docTags';

export const mountSubscribe = (app: App) => {
  app.post(apiUrls.subscribe, {
    schema: {
      tags: [docTags.subscription.name],
      summary: 'Subscribe to release notifications',
      description: 'Subscribe an email to receive notifications about new releases of a GitHub repository. The repository is validated via GitHub API.',
      body: routes.subscribe.ReqBody,
      response: routes.subscribe.RouteResponse,
    },
  }, async (req, res) => {
    const [githubRepo, repoLatestRelease] = await Promise.all([
      getRepoByRepoName(req.body.repo),
      getRepoLatestReleaseByRepoName(req.body.repo),
    ]);
    if(githubRepo.success === false) {
      switch(githubRepo.error) {
        case 503:
          res.header('Retry-After', githubRepo.retryAfter.toString());
          res.status(503).send({
            type: 'GitHubLimitExceeded',
          });
          break;
        case 404:
          res.status(404).send({
            type: 'RepoNotFound',
            repoName: req.body.repo,
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
          res.status(503).send({
            type: 'GitHubLimitExceeded',
          });
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
        email: req.body.email,
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
      res.status(409).send({
        type: 'AlreadySubscribed',
        email: req.body.email,
        repoName: githubRepo.data.full_name,
        repoId: githubRepo.data.id,
      });
      return;
    }

    await sendSubscriptionConfirmationMail({
      to: req.body.email,
      repoName: githubRepo.data.full_name,
      repoRelease: repoLatestRelease.data,
      subscribeToken: subscription.confirmation.subscribeToken,
    });

    res.status(201).send(true);
  });
};
