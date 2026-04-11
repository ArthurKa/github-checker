// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { workspaces } = require('../package.json');

const mode = process.argv[2] === '--clean-up' ? 'remove' : 'create';

/**
  @typedef Packages
  @type {
    | import('../package.json')
    | import('../libs/common/package.json')
    | import('../apps/api/package.json')
  }

  @typedef Package
  @type {
    & import('@arthurka/ts-utils').Union<Packages>
    & {
      scripts: import('@arthurka/ts-utils').Union<Packages['scripts']>
    }
  }
*/

const packageNames = (
  execSync(`ls -d ${workspaces.join(' ')}`)
    .toString('utf-8')
    .trim()
    .split('\n')
);

const filepaths = [
  'package.json',
  ...packageNames.map(e => `${e}/package.json`),
];

for(const filepath of filepaths) {
  const {
    name,
    version,
    workspaces,
    dependencies,
    devDependencies,
    scripts,
  } = /** @type {Package} */ (JSON.parse(fs.readFileSync(path.resolve(filepath), 'utf-8')));

  const newFilepath = path.resolve(path.parse(filepath).dir, './docker-package.json');
  const scriptsFilepath = path.resolve(path.parse(filepath).dir, './docker-build-package.json');

  switch(mode) {
    case 'remove':
      try {
        fs.unlinkSync(newFilepath);
      } catch(e) {}
      try {
        fs.unlinkSync(scriptsFilepath);
      } catch(e) {}
      break;
    case 'create':
      fs.writeFileSync(newFilepath, `${JSON.stringify({
        name,
        version,
        scripts: {
          preinstall: scripts.preinstall,
          'start-checks': scripts['start-checks'],
        },
        dependencies,
        devDependencies,
        workspaces,
      }, null, 2)}\n`);

      fs.writeFileSync(scriptsFilepath, `${JSON.stringify({
        name,
        version,
        scripts: {
          start: scripts.start,
          'start-checks': scripts['start-checks'],
          'ts:noWatch': scripts['ts:noWatch'],
          'api:ts:noWatch': scripts['api:ts:noWatch'],
          'api:start': scripts['api:start'],
        },
        dependencies,
        devDependencies,
        workspaces,
      }, null, 2)}\n`);
      break;
    default:
      ((/** @type {never} */ e) => e)(mode);
      throw new Error('This should never happen. |f1bx1f|');
  }
}
