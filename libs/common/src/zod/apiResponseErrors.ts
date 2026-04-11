import { z } from 'zod/v4';

export const UnexpectedServerError = z.object({
  type: z.literal('UnexpectedServerError'),
});
export type UnexpectedServerError = z.infer<typeof UnexpectedServerError>;

export const EachApiRoute = z.union([UnexpectedServerError]);
export type EachApiRoute = z.infer<typeof EachApiRoute>;

export const WrongUrlParams = z.object({
  type: z.literal('WrongUrlParams'),
  __WARNING_DO_NOT_USE__zodIssues: z.custom((e): e is z.core.$ZodIssue[] => true),
});
export type WrongUrlParams = z.infer<typeof WrongUrlParams>;

export const WrongQueryParams = z.object({
  type: z.literal('WrongQueryParams'),
  __WARNING_DO_NOT_USE__zodIssues: z.custom((e): e is z.core.$ZodIssue[] => true),
});
export type WrongQueryParams = z.infer<typeof WrongQueryParams>;

export const WrongBodyParams = z.object({
  type: z.literal('WrongBodyParams'),
  __WARNING_DO_NOT_USE__zodIssues: z.custom((e): e is z.core.$ZodIssue[] => true),
});
export type WrongBodyParams = z.infer<typeof WrongBodyParams>;

export const GitHubLimitExceeded = z.object({
  type: z.literal('GitHubLimitExceeded'),
});
export type GitHubLimitExceeded = z.infer<typeof GitHubLimitExceeded>;

export const RepoNotFound = z.object({
  type: z.literal('RepoNotFound'),
});
export type RepoNotFound = z.infer<typeof RepoNotFound>;

export const AlreadySubscribed = z.object({
  type: z.literal('AlreadySubscribed'),
});
export type AlreadySubscribed = z.infer<typeof AlreadySubscribed>;

export const TokenNotFound = z.object({
  type: z.literal('TokenNotFound'),
});
export type TokenNotFound = z.infer<typeof TokenNotFound>;
