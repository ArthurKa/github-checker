// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');
const { workspaces } = require('../package.json');

const packageNames = (
  execSync(`ls -d ${workspaces.join(' ')}`)
    .toString('utf-8')
    .trim()
    .split('\n')
);

/** @param {string} pathName */
const readFolder = pathName => {
  try {
    return fs.readdirSync(pathName);
  } catch(e) {
    assert(e instanceof Error, 'This should never happen. |njj3r9|');

    if(e.message.match(/no such file or directory/i)) {
      return false;
    }

    throw e;
  }
};

for(const pkg of packageNames) {
  const folderList = readFolder(path.join(pkg, 'node_modules'));

  if(folderList === false || folderList.length === 1 && folderList[0] === '.vite') {
    continue;
  }

  throw new Error(`WARNING! Pay attention to "${pkg}/node_modules". There are probably some package version conflicts that need to be fixed. |uaq91t|`);
}
