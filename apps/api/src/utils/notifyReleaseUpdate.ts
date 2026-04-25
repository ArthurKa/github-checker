import { WithId } from 'mongodb';
import { RepoReleases } from '@repo/common/src/schemas/github';
import { isNull } from '@arthurka/ts-utils';
import { DbRepo } from '../services/db/repoService';
import { subscriptionService } from '../services/db/subscriptionService';
import { sendReleaseUpdateMail } from '../services/mailer';

export const notifyReleaseUpdate = async (repoBefore: WithId<DbRepo>, latestRelease: RepoReleases[number] | null) => {
  const subscriptions = await subscriptionService.getAllSubscribedByRepoId(repoBefore.id);

  await Promise.all(
    subscriptions.map(({ email, confirmation: { unsubscribeToken } }) => (
      sendReleaseUpdateMail({
        to: email,
        repoName: repoBefore.name,
        oldRepoRelease: isNull(repoBefore.latestTag) ? null : {
          tag_name: repoBefore.latestTag.tag,
          html_url: repoBefore.latestTag.url,
        },
        newRepoRelease: latestRelease,
        unsubscribeToken,
      })
    )),
  );
};
