import { StringURL } from '@repo/common/src/brands';
import { REDIS_CONNECTION_URL } from '@repo/common/src/envVariables/private';
import { NODE_ENV } from '@repo/common/src/envVariables/public';
import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(REDIS_CONNECTION_URL);

const makeRedisKey = (_e: string) => {
  const e = _e.toLowerCase();

  return (
    NODE_ENV === 'development'
      ? `willBeHashOnProd(${e})`
      : (
        crypto
          .createHash('sha1')
          .update(e)
          .digest('hex')
      )
  );
};

export const redisService = {
  githubApiCache: {
    get(url: StringURL) {
      return redis.get(`githubApiCache:${makeRedisKey(url)}`);
    },
    async set(url: StringURL, value: string) {
      await redis.set(`githubApiCache:${makeRedisKey(url)}`, value, 'EX', NODE_ENV === 'production' ? 10 * 60 : 30);
    },
    async setIfNotExists(url: StringURL, value: string) {
      await redis.set(`githubApiCache:${makeRedisKey(url)}`, value, 'EX', NODE_ENV === 'production' ? 10 * 60 : 30, 'NX');
    },
  },
};
