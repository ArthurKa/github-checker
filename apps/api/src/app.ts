import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { InputDataValidationError, UnexpectedServerError } from '@repo/common/src/zod/apiResponseErrors';
import { FastifyErrorShape } from '@repo/common/src/zod/FastifyErrorShape';
import { name } from '../package.json';
import { mountRouter } from './router';

const app = Fastify().withTypeProvider<ZodTypeProvider>();
export type App = typeof app;

export const initApp = async () => {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await mountRouter(app);

  app.setErrorHandler((e, req, res) => {
    const { success, data } = FastifyErrorShape.safeParse(e);
    if(success === true) {
      switch(data.statusCode) {
        case 400:
          res.status(400).send({
            type: 'InputDataValidationError',
            description: data.message,
          } satisfies InputDataValidationError);
          break;
        case 500:
          console.error('Something went wrong. |g7uw54|', e);
          res.status(500).send({
            type: 'UnexpectedServerError',
            description: data.message,
          } satisfies UnexpectedServerError);
          break;
        default:
          ((e: never) => e)(data.statusCode);
          throw new Error('This should never happen. |k2v3kx|');
      }
      return;
    }

    console.error('Something went wrong. |n6575i|', e);
    res.status(500).send({
      type: 'UnexpectedServerError',
    } satisfies UnexpectedServerError);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Something went wrong. |fw5xgm|', promise, JSON.stringify(reason, null, 2));
  });
  process.on('uncaughtException', (err, errOrigin) => {
    console.error('Something went wrong. |03mi29|', err, errOrigin);
  });

  const port = 3000;
  await app.listen({ port });
  console.info(`${name} is listening on localhost:${port}`);
};
