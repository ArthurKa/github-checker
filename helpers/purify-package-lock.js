// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { name, workspaces } = require('../package.json');
const pkgLock = require('../package-lock.json');

const workspacePackageNames = (
  execSync(`ls -d ${workspaces.join(' ')}`)
    .toString('utf-8')
    .trim()
    .split('\n')
    .map(e => e.split('/').slice(-1)[0] ?? '')
);

const result = {
  ...pkgLock,
  packages: Object.fromEntries(
    Object.entries(pkgLock.packages)
      .filter(([key]) => {
        if(!key.startsWith(`node_modules/@${name}/`) && !key.startsWith('apps/') && !key.startsWith('libs/')) {
          return true;
        }

        return workspacePackageNames.some(e => key.endsWith(`/${e}`));
      }),
  ),
};

fs.writeFileSync(path.resolve('./package-lock.json'), `${JSON.stringify(result, null, 2)}\n`);
