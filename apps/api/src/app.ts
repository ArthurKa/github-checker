import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { InputDataValidationError, UnexpectedServerError } from '@repo/common/src/schemas/apiResponseErrors';
import { FastifyErrorShape } from '@repo/common/src/schemas/FastifyErrorShape';
import { processEnvFlags } from '@repo/common/src/utils/processEnvFlags';
import { name } from '../package.json';
import { mountRouter } from './router';

export type App = Awaited<ReturnType<typeof createApp>>;
export const createApp = async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();

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

    if(!processEnvFlags.muteOnceApiLogError500.isOn()) {
      processEnvFlags.muteOnceApiLogError500.off();
      console.error('Something went wrong. |n6575i|', e);
    }
    res.status(500).send({
      type: 'UnexpectedServerError',
    } satisfies UnexpectedServerError);
  });

  const unhandledRejection = (reason: unknown, promise: Promise<unknown>) => {
    console.error('Something went wrong. |fw5xgm|', promise, JSON.stringify(reason, null, 2));
  };
  const uncaughtException = (err: Error, errOrigin: NodeJS.UncaughtExceptionOrigin) => {
    console.error('Something went wrong. |03mi29|', err, errOrigin);
  };
  process.on('unhandledRejection', unhandledRejection);
  process.on('uncaughtException', uncaughtException);

  app.addHook('onClose', () => {
    process.off('unhandledRejection', unhandledRejection);
    process.off('uncaughtException', uncaughtException);
  });

  return app;
};

export const initApp = async () => {
  const app = await createApp();

  const port = 3000;
  await app.listen({ port, host: '0.0.0.0' });
  console.info(`${name} is listening on localhost:${port}`);
};
