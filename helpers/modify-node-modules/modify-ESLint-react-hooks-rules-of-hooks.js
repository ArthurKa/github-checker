// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');

const filePath = path.resolve('node_modules/eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js');
const filename = path.parse(__filename).base;

/** @param {boolean} isCheckMode */
module.exports = isCheckMode => {
  const fileLines = fs.readFileSync(filePath, 'utf-8').split('\n');

  if(fileLines[137]?.trim() === "return !!(node.parent && node.parent.callee && isReactFunction(node.parent.callee, 'forwardRef'));") {
    if(isCheckMode === true) {
      return 'update-needed';
    }

    fileLines.splice(137, 1, `${fileLines[137].replace("isReactFunction(node.parent.callee, 'forwardRef')", "(isReactFunction(node.parent.callee, 'forwardRef') || isReactFunction(node.parent.callee, 'SuspenseHOC'))")} // modified from \`${filename}\``);

    fs.writeFileSync(filePath, fileLines.join('\n'));
    console.info(`${filename} applied successfully.`);
  } else if(isCheckMode === false) {
    console.info(`${filename} WAS NOT APPLIED.`);
  }
};
