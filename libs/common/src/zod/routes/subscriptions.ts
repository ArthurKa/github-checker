import { z } from 'zod/v4';
import { makeRouteResponse } from '../common';
import { EachApiRoute, WrongQueryParams } from '../apiResponseErrors';
import { customEmail, customReleaseTag, customRepoName } from '../customs';

export const ReqQuery = z.object({
  email: customEmail,
});
export type ReqQuery = z.infer<typeof ReqQuery>;

export const RouteResponse = makeRouteResponse(
  z.union([EachApiRoute, WrongQueryParams]),
  z.array(
    z.object({
      email: customEmail,
      repo: customRepoName,
      confirmed: z.boolean(),
      last_seen_tag: customReleaseTag.optional(),
    }),
  ),
);
export type RouteResponse = z.infer<typeof RouteResponse>;
