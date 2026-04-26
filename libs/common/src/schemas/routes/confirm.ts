import { z, ZodType } from 'zod/v4';
import { eachApiRoute, inputDataValidationError, TokenNotFound } from '../apiResponseErrors';
import { customSubscribeToken } from '../customs';

export const UrlParams = z.object({
  token: customSubscribeToken.describe('Subscribe confirmation token.'),
});
export type UrlParams = z.infer<typeof UrlParams>;

export const RouteResponse = {
  ...eachApiRoute,
  ...inputDataValidationError('params/token "super-token" of type String is not valid SubscribeToken'),
  404: TokenNotFound.describe('Token not found.'),
  200: z.literal(true).describe('Subscription confirmed successfully.'),
} satisfies Record<number, ZodType>;
export type RouteResponse = z.infer<z.ZodObject<typeof RouteResponse>>;
