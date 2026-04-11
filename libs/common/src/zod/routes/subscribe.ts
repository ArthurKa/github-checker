import { z } from 'zod/v4';
import { makeRouteResponse } from '../common';
import { AlreadySubscribed, EachApiRoute, GitHubLimitExceeded, RepoNotFound, WrongBodyParams } from '../apiResponseErrors';
import { customEmail, customRepoName } from '../customs';

export const ReqBody = z.object({
  email: customEmail,
  repo: customRepoName,
});
export type ReqBody = z.infer<typeof ReqBody>;

export const RouteResponse = makeRouteResponse(
  z.union([EachApiRoute, WrongBodyParams, GitHubLimitExceeded, RepoNotFound, AlreadySubscribed]),
  z.literal(true),
);
export type RouteResponse = z.infer<typeof RouteResponse>;
