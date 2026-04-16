import { z } from 'zod/v4';
import { eachApiRoute, inputDataValidationError } from '../apiResponseErrors';
import { customEmail, customReleaseTag, customRepoName } from '../customs';

export const ReqQuery = z.object({
  email: customEmail.describe('Email address to look up subscriptions for'),
});
export type ReqQuery = z.infer<typeof ReqQuery>;

export const RouteResponse = {
  ...eachApiRoute,
  ...inputDataValidationError('querystring/email "bad-email.com" of type String is not valid Email'),
  200: z.array(
    z.object({
      email: customEmail,
      repo: customRepoName,
      isConfirmed: z.boolean(),
      lastSeenTag: customReleaseTag.nullable(),
    }),
  ).describe('Successful operation - list of subscriptions returned'),
};
export type RouteResponse = z.infer<z.ZodObject<typeof RouteResponse>>;
