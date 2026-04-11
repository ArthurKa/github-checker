import { NODE_ENV } from '@repo/common/src/envVariables/public';
import cron from 'node-cron';
import { checkRepoReleases } from './utils/checkRepoReleases';

export const initCron = () => {
  cron.schedule(`*/${NODE_ENV === 'development' ? 1 : 15} * * * *`, async () => {
    await checkRepoReleases();
  });
};
