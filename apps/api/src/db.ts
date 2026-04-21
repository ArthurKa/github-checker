import { Db, MongoClient } from 'mongodb';
import { isNull } from '@arthurka/ts-utils';
import { config, up } from 'migrate-mongo';
import { MONGO_URL } from '@repo/common/src/envVariables/private';
import path from 'path';
import assert from 'assert';
import { NODE_ENV } from '@repo/common/src/envVariables/public';
import { generateUUID } from '@repo/common/src/utils';

let _db: Db | null = null;
let _client: MongoClient | null = null;

export const db = () => {
  assert(!isNull(_db), 'Something went wrong. |mi1oc3|');

  return _db;
};

export const client = () => {
  assert(!isNull(_client), 'Something went wrong. |ff2xxp|');

  return _client;
};

export const initDb = async () => {
  const mongoUrl = NODE_ENV !== 'testing' ? MONGO_URL : `${MONGO_URL}-${generateUUID()}`;
  _client = await new MongoClient(mongoUrl).connect();
  _db = _client.db();

  config.set({
    mongodb: {
      url: mongoUrl,
      options: {
        // @ts-expect-error
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    migrationsDir: path.join(__dirname, '../migrations'),
    changelogCollectionName: 'migrations_changelog',
    migrationFileExtension: '.js',
    useFileHash: false,
    moduleSystem: 'commonjs',
  });

  for(const fileName of await up(_db, _client)) {
    if(NODE_ENV !== 'testing') {
      console.info(`Migrated: ${fileName}`);
    }
  }
};
