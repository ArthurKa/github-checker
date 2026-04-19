import { z } from 'zod/v4';

export const FastifyErrorShape = z.object({
  statusCode: z.union([z.literal(400), z.literal(500)]),
  message: z.string(),
});
