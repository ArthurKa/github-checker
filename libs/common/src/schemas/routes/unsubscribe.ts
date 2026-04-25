import { z, ZodType } from 'zod/v4';
import { eachApiRoute, inputDataValidationError, TokenNotFound } from '../apiResponseErrors';
import { customUnsubscribeToken } from '../customs';

export const UrlParams = z.object({
  token: customUnsubscribeToken.describe('Unsubscribe token.'),
});
export type UrlParams = z.infer<typeof UrlParams>;

export const RouteResponse = {
  ...eachApiRoute,
  ...inputDataValidationError('params/token "super-token" of type String is not valid UnsubscribeToken'),
  200: z.literal(true).describe('Unsubscribed successfully.'),
  404: TokenNotFound.describe('Token not found.'),
} satisfies Record<number, ZodType>;
export type RouteResponse = z.infer<z.ZodObject<typeof RouteResponse>>;
