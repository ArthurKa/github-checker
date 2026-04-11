import { z } from 'zod/v4';
import { makeRouteResponse } from '../common';
import { EachApiRoute, TokenNotFound, WrongUrlParams } from '../apiResponseErrors';
import { customSubscribeToken } from '../customs';

export const UrlParams = z.object({
  token: customSubscribeToken,
});
export type UrlParams = z.infer<typeof UrlParams>;

export const RouteResponse = makeRouteResponse(
  z.union([EachApiRoute, WrongUrlParams, TokenNotFound]),
  z.literal(true),
);
export type RouteResponse = z.infer<typeof RouteResponse>;
