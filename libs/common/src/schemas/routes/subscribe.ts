import { z, ZodType } from 'zod/v4';
import { AlreadySubscribed, eachApiRoute, GitHubLimitExceeded, inputDataValidationError, RepoNotFound } from '../apiResponseErrors';
import { customEmail, customIntegerSecond, customRepoName } from '../customs';
import { RepoName } from '../../brands';

export const ReqBody = (
  z
    .object({
      email: customEmail,
      repoName: customRepoName,
    })
    .describe('Subscription request.')
    .transform((e): typeof e => {
      const { repoName, ...rest } = e;

      return {
        ...rest,
        repoName: RepoName(repoName.trim()),
      };
    })
);
export type ReqBody = z.infer<typeof ReqBody>;

export const RouteResponse = {
  ...eachApiRoute,
  ...inputDataValidationError('body/email "bad-email.com" of type String is not valid Email, body/repo "react" of type String is not valid RepoName'),
  503: GitHubLimitExceeded.describe('GitHub API requests limit exceeded.'),
  404: RepoNotFound.describe('Repository not found on GitHub.'),
  409: AlreadySubscribed.describe('Email already subscribed to this repository.'),
  201: z.literal(true).describe('Subscription successful. Confirmation email sent.'),
} satisfies Record<number, ZodType>;
export type RouteResponse = z.infer<z.ZodObject<typeof RouteResponse>>;

export const ResHeaders = {
  503: z.object({
    'retry-after': z.string().transform(Number).pipe(customIntegerSecond),
  }),
};
export type ResHeaders = z.infer<z.ZodObject<typeof ResHeaders>>;
