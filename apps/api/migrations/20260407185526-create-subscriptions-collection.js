// @ts-check
'use strict';

export default ((/** @type {Pick<import('migrate-mongo'), 'up'>} */ e) => e)({
  async up(db) {
    await db.createCollection('subscriptions');

    return [];
  },
});
