import { z, ZodType } from 'zod/v4';

export const SimplifiedZodIssues = z.array(
  z.object({
    code: z.string(),
    path: z.array(z.string()),
    message: z.string(),
  }),
);
export type SimplifiedZodIssues = z.infer<typeof SimplifiedZodIssues>;

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
