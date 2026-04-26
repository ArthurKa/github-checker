// @ts-check
'use strict';

import { isNull } from '@arthurka/ts-utils';
import { StringURL } from '@repo/common/src/brands';

/**
  @typedef DbRepo
  @type {import('../src/services/db/repoService').DbRepo}

  @typedef ReleaseTag
  @type {import('@repo/common/src/brands').ReleaseTag}

  @typedef OldDbRepo
  @type {
    & import('@repo/common/src/utils').SafeOmit<DbRepo, 'latestTag'>
    & {
        latestTag: ReleaseTag | null;
    }
  }
*/

export default ((/** @type {Pick<import('migrate-mongo'), 'up'>} */ e) => e)({
  async up(db) {
    /** @type {import('mongodb').Collection<DbRepo>} */
    const collection = db.collection('repos');
    /** @type {import('mongodb').Collection<OldDbRepo>} */
    const oldCollection = db.collection('repos');

    for await (const { _id, name, latestTag } of oldCollection.find()) {
      await collection.updateOne({ _id }, {
        $set: {
          latestTag: isNull(latestTag) ? null : {
            tag: latestTag,
            url: StringURL(`https://github.com/${name}/releases/tag/${latestTag}`),
          },
        },
      });
    }

    return [];
  },
});
