import { initDb } from './db';
import { initApp } from './app';
import { initCron } from './cron';

(async (): Promise<void> => {
  await initDb();
  await initApp();
  initCron();
})();
