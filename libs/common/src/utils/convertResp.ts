import { ObjEntries } from '@arthurka/ts-utils';
import { z, ZodType } from 'zod/v4';

export const convertResp = <T extends Record<number, ZodType>>(schemas: T) => (
  z.union(
    ObjEntries(schemas).map(([code, schema]) => (
      z.object({
        statusCode: z.literal(+code),
        body: schema,
      }) as {
        [K in keyof T]: (
          K extends number
            ? z.ZodObject<{
              statusCode: z.ZodLiteral<K>;
              body: T[K];
            }>
            : never
        )
      }[keyof T]
    )),
  )
);
