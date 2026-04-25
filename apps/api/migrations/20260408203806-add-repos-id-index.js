// @ts-check
'use strict';

export default ((/** @type {Pick<import('migrate-mongo'), 'up'>} */ e) => e)({
  async up(db) {
    /** @type {import('mongodb').Collection<import('../src/services/db/repoService').DbRepo>} */
    const collection = db.collection('repos');

    await collection.createIndex({ id: 1 }, { unique: true });

    return [];
  },
});
