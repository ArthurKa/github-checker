import { isNull, trimMultiline } from '@arthurka/ts-utils';
import { Email, RepoName, SubscribeToken, UnsubscribeToken } from '@repo/common/src/brands';
import { apiUrls } from '@repo/common/src/commonUrls';
import { GOOGLE_APP_PASS, NODEMAILER_SENDER } from '@repo/common/src/envVariables/private';
import { API_URL } from '@repo/common/src/envVariables/public';
import { stringifyUrl } from '@repo/common/src/utils';
import { routes } from '@repo/common/src/schemas';
import { RepoReleases } from '@repo/common/src/schemas/github';
import nodemailer from 'nodemailer';
import assert from 'assert';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: NODEMAILER_SENDER,
    pass: GOOGLE_APP_PASS,
  },
});

export const sendSubscriptionConfirmationMail = async ({ to, repoName, repoRelease, subscribeToken }: {
  to: Email;
  repoName: RepoName;
  repoRelease: RepoReleases[number] | null;
  subscribeToken: SubscribeToken;
}) => {
  const latestTagText = (
    isNull(repoRelease)
      ? 'For now there is no release tag in the repo yet.'
      : `For now the latest release tag is <a href="${repoRelease.html_url}">${repoRelease.tag_name}</a>.`
  );

  await transporter.sendMail({
    from: `"GitHub Checker" <${NODEMAILER_SENDER}>`,
    to,
    subject: 'Subscription confirmation',
    html: trimMultiline`
      <h1>Hello from GitHub Checker 👋</h1>
      <div>You are subscribing to <a href="https://github.com/${repoName}">${repoName}</a> GitHub repo <a href="https://github.com/${repoName}/releases">release</a> updates.</div>
      <div>Click here to <a href="${API_URL}${apiUrls.confirm}/${subscribeToken}">confirm</a>.</div>
      <br />
      <div>${latestTagText}</div>
    `,
  });
};

export const sendReleaseUpdateMail = async ({ to, repoName, oldRepoRelease, newRepoRelease, unsubscribeToken }: {
  to: Email;
  repoName: RepoName;
  oldRepoRelease: RepoReleases[number] | null;
  newRepoRelease: RepoReleases[number] | null;
  unsubscribeToken: UnsubscribeToken;
}) => {
  const tagUpdateText = (
    isNull(oldRepoRelease)
      ? isNull(newRepoRelease)
        ? assert(false, 'Something went wrong. |6vms43|')
        : `created its first release tag <a href="${newRepoRelease.html_url}">${newRepoRelease.tag_name}</a>. Take a look!`
      : isNull(newRepoRelease)
        ? `removed its only release tag <a href="${oldRepoRelease.html_url}">${oldRepoRelease.tag_name}</a>.`
        : `changed release tag from <a href="${oldRepoRelease.html_url}">${oldRepoRelease.tag_name}</a> to <a href="${newRepoRelease.html_url}">${newRepoRelease.tag_name}</a>. Take a look!`
  );
  const subscriptionsUrl = stringifyUrl(`${API_URL}${apiUrls.subscriptions}`, {
    email: to,
  } satisfies routes.subscriptions.ReqQuery);

  await transporter.sendMail({
    from: `"GitHub Checker" <${NODEMAILER_SENDER}>`,
    to,
    subject: 'Release update',
    html: trimMultiline`
      <div>GitHub repo <a href="https://github.com/${repoName}">${repoName}</a> has ${tagUpdateText}</div>
      <br />
      <div>You've received this email because of your <a href="${subscriptionsUrl}">subscriptions</a>.</div>
      <div>Click here to <a href="${API_URL}${apiUrls.unsubscribe}/${unsubscribeToken}">unsubscribe</a>.</div>
    `,
  });
};
