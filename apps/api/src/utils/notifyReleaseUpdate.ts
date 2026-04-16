import { WithId } from 'mongodb';
import { RepoReleases } from '@repo/common/src/zod/github';
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
        repoRelease: latestRelease,
        unsubscribeToken,
      })
    )),
  );
};
