import { z, ZodType } from 'zod/v4';
import { eachApiRoute } from '../apiResponseErrors';

export const RouteResponse = {
  ...eachApiRoute,
  200: z.object({
    ok: z.literal(true),
  }).describe('Service is healthy.'),
} satisfies Record<number, ZodType>;
export type RouteResponse = z.infer<z.ZodObject<typeof RouteResponse>>;
