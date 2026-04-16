import { z } from 'zod/v4';
import { AlreadySubscribed, eachApiRoute, GitHubLimitExceeded, inputDataValidationError, RepoNotFound } from '../apiResponseErrors';
import { customEmail, customRepoName } from '../customs';
import { RepoName } from '../../brands';

export const ReqBody = (
  z
    .object({
      email: customEmail,
      repo: customRepoName,
    })
    .overwrite(({ repo, ...rest }) => ({
      ...rest,
      repo: RepoName(repo.trim()),
    }))
);
export type ReqBody = z.infer<typeof ReqBody>;

export const RouteResponse = {
  ...eachApiRoute,
  ...inputDataValidationError('body/email "bad-email.com" of type String is not valid Email, body/repo "react" of type String is not valid RepoName'),
  201: z.literal(true).describe('Subscription successful. Confirmation email sent.'),
  503: GitHubLimitExceeded.describe('GitHub API requests limit exceeded'),
  404: RepoNotFound.describe('Repository not found on GitHub'),
  409: AlreadySubscribed.describe('Email already subscribed to this repository'),
};
export type RouteResponse = z.infer<z.ZodObject<typeof RouteResponse>>;
