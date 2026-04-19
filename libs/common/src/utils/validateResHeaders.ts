import { RouteShorthandOptions } from 'fastify';
import { isUndefined } from '@arthurka/ts-utils';
import { ZodType } from 'zod/v4';

export const validateResHeaders = (schemas: Record<number, ZodType>) => (
  ((req, res, payload, done) => {
    const schema = schemas[res.statusCode];
    if(!isUndefined(schema)) {
      schema.parse(res.getHeaders());
    }

    done();
  }) satisfies NonNullable<RouteShorthandOptions['onSend']>
);
