import { z } from 'zod/v4';
import { makeRouteResponse } from '../common';
import { EachApiRoute } from '../apiResponseErrors';

export const RouteResponse = makeRouteResponse(
  EachApiRoute,
  z.literal(true),
);
export type RouteResponse = z.infer<typeof RouteResponse>;
