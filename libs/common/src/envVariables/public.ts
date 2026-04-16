import assert from 'assert';
import { z, ZodError } from 'zod/v4';
import { customNoTrailingSlashStringURL } from '../zod/customs';

const Envs = z.object({
  NODE_ENV: z.enum(['production', 'development']),
  API_URL: customNoTrailingSlashStringURL,
});

let envs: z.infer<typeof Envs>;

try {
  // eslint-disable-next-line no-process-env
  envs = Envs.parse(process.env);
} catch(e) {
  assert(e instanceof ZodError, 'This should never happen. |01rtz9|');

  console.error('.env Zod issues:', e.issues);
  throw e;
}

export const publicEnvs = envs;

export const NODE_ENV = envs.NODE_ENV;
export const API_URL = envs.API_URL;
