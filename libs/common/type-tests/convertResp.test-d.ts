import { expectType } from 'tsd';
import { z } from 'zod/v4';
import { convertResp } from '../src/utils';

declare const test1: {
  200: z.ZodLiteral<true>;
  404: z.ZodLiteral<'NotFound'>;
};
expectType<
  | {
    statusCode: 200;
    body: true;
  }
  | {
    statusCode: 404;
    body: 'NotFound';
  }
>(convertResp(test1).parse({}));
