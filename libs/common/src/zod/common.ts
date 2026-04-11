import { z, ZodType } from 'zod/v4';

export const makeRouteResponse = <U1, V1, U2, V2>(error: ZodType<U1, V1>, data: ZodType<U2, V2>) => (
  z.discriminatedUnion('success', [
    z.object({
      success: z.literal(false),
      data: z.undefined().optional(),
      error,
    }),
    z.object({
      success: z.literal(true),
      error: z.undefined().optional(),
      data,
    }),
  ])
);
