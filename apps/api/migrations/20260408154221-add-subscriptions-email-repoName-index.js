// @ts-check
'use strict';

export default ((/** @type {Pick<import('migrate-mongo'), 'up'>} */ e) => e)({
  async up(db) {
    /** @type {import('mongodb').Collection<import('../src/services/db/subscriptionService').DbSubscription>} */
    const collection = db.collection('subscriptions');

    await collection.createIndex({ email: 1, repoId: 1 }, { unique: true });

    return [];
  },
});
