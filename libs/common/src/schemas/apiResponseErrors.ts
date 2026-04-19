import { z } from 'zod/v4';
import { customEmail, customRepoId, customRepoName, customUUID } from './customs';

const UnexpectedServerError = z.object({
  type: z.literal('UnexpectedServerError'),
  description: z.string().optional().meta({ example: "Response doesn't match the schema" }),
}).describe('Something went wrong.');
export type UnexpectedServerError = z.infer<typeof UnexpectedServerError>;

export const eachApiRoute = {
  500: UnexpectedServerError,
};

const InputDataValidationError = (example: string) => (
  z.object({
    type: z.literal('InputDataValidationError'),
    description: z.string().meta({ example }),
  }).describe('Input data validation error.')
);
export type InputDataValidationError = z.infer<ReturnType<typeof InputDataValidationError>>;

export const inputDataValidationError = (example: string) => ({
  400: InputDataValidationError(example),
});

export const GitHubLimitExceeded = z.object({
  type: z.literal('GitHubLimitExceeded'),
});
export const RepoNotFound = z.object({
  type: z.literal('RepoNotFound'),
  repoName: customRepoName,
});
export const AlreadySubscribed = z.object({
  type: z.literal('AlreadySubscribed'),
  email: customEmail,
  repoName: customRepoName,
  repoId: customRepoId,
});
export const TokenNotFound = z.object({
  type: z.literal('TokenNotFound'),
  token: customUUID,
});
