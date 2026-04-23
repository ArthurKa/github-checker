import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import assert from 'assert';
import { isNull } from '@arthurka/ts-utils';
import { routes } from '@repo/common/src/schemas';
import { App, createApp } from '../app';

let app: App | null = null;

beforeAll(async () => {
  app = await createApp();
  await app.ready();
});
afterAll(async () => {
  assert(!isNull(app));

  await app.close();
});

describe('GET /health', () => {
  it('should return 200', async () => {
    assert(!isNull(app));

    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json<routes.health.RouteResponse[200]>()).toStrictEqual({
      ok: true,
    });
  });
});
