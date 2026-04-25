import { isNull } from '@arthurka/ts-utils';
import { subscriptionService } from '../services/db/subscriptionService';
import { cacheRepoLatestReleaseByName, getRepoLatestReleaseByRepoId } from '../services/fetch/github/getRepoLatestRelease';
import { notify } from '../services/notifier/notify';
import { shouldNotifyReleaseUpdate } from './shouldNotifyReleaseUpdate';
import { DbRepo, repoService } from '../services/db/repoService';
import { sendReleaseUpdateMail } from '../services/mailer';

export const checkRepoReleases = async () => {
  const subscribedRepos = await subscriptionService.getAllSubscribedRepos();

  for(const { repo, subscriptionData } of subscribedRepos) {
    const repoLatestRelease = await getRepoLatestReleaseByRepoId(repo.id);
    if(repoLatestRelease.success === false) {
      switch(repoLatestRelease.error) {
        case 503:
          void notify.limitExceeded();
          return;
        case 404:
          void notify.repoNotFound(repo);
          continue;
        default:
          ((e: never) => e)(repoLatestRelease);
          throw new Error('This should never happen. |dk4j0t|');
      }
    }

    await cacheRepoLatestReleaseByName(repo.name, repoLatestRelease.data);

    const latestTag = isNull(repoLatestRelease.data) ? null : {
      tag: repoLatestRelease.data.tag_name,
      url: repoLatestRelease.data.html_url,
    } satisfies DbRepo['latestTag'];

    if(!shouldNotifyReleaseUpdate(repo, latestTag)) {
      continue;
    }

    await Promise.all([
      repoService.createOrUpdateWithReturnBefore({
        id: repo.id,
        name: repo.name,
        latestTag,
      }),
      subscriptionData.map(({ email, unsubscribeToken }) => (
        sendReleaseUpdateMail({
          to: email,
          repoName: repo.name,
          oldRepoRelease: isNull(repo.latestTag) ? null : {
            tag_name: repo.latestTag.tag,
            html_url: repo.latestTag.url,
          },
          newRepoRelease: repoLatestRelease.data,
          unsubscribeToken,
        })
      )),
    ]);
  }
};
