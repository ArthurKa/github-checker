import assert from 'assert';
import { z, ZodError } from 'zod/v4';
import { customEmail, customNonEmptyString, customNoTrailingSlashStringURL } from '../zod/customs';

const Envs = z.object({
  MONGO_URL: customNoTrailingSlashStringURL,
  GITHUB_API_TOKEN: customNonEmptyString,
  GOOGLE_APP_PASS: customNonEmptyString,
  NODEMAILER_SENDER: customEmail,
});
type Envs = z.infer<typeof Envs>;

let envs: Envs;

try {
  // eslint-disable-next-line no-process-env
  envs = Envs.parse(process.env);
} catch(e) {
  assert(e instanceof ZodError, 'This should never happen. |81x6rn|');

  console.error('.env Zod issues:', e.issues);
  throw e;
}

export const MONGO_URL = envs.MONGO_URL;
export const GITHUB_API_TOKEN = envs.GITHUB_API_TOKEN;
export const GOOGLE_APP_PASS = envs.GOOGLE_APP_PASS;
export const NODEMAILER_SENDER = envs.NODEMAILER_SENDER;
