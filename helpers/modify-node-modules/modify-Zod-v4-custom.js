// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');

const filePath = path.resolve('node_modules/zod/v4/classic/schemas.d.ts');
const filename = path.parse(__filename).base;

/** @param {boolean} isCheckMode */
module.exports = isCheckMode => {
  const fileLines = fs.readFileSync(filePath, 'utf-8').split('\n');

  if(fileLines[605] === 'export declare function custom<O>(fn?: (data: unknown) => unknown, _params?: string | core.$ZodCustomParams | undefined): ZodCustom<O, O>;') {
    if(isCheckMode === true) {
      return 'update-needed';
    }

    fileLines.splice(605, 1, `${fileLines[605].replace('(data: unknown) => unknown', '(e: unknown) => e is O')} // modified from \`${filename}\``);

    fs.writeFileSync(filePath, fileLines.join('\n'));
    console.info(`${filename} applied successfully.`);
  } else if(isCheckMode === false) {
    console.info(`${filename} WAS NOT APPLIED.`);
  }
};
