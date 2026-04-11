// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const { scripts } = require('../package.json');

const searchExcludeFilesOrFolders = [
  'node_modules',
  'dist',
  '.next',
  '.git',
  '.turbo',
  'public',
  'prod-build',
  'ios',
  'android',
];

/**
  @type {
    Array<[
      RegExp,
      ((e: RegExpExecArray) => any[]) | any[],
      (string | Parameters<Parameters<string['replace']>[0][typeof Symbol.replace]>[1])?,
      RegExp?,
    ]>
  }
*/
const matchReplacePatterns = [
  [/\(\s+\)/, ['Probably some unnecessary spaces in parentheses?'], '()'],
  [/\{\s+\}/, ['Probably some unnecessary spaces in curly braces?'], '{}'],
  [/ +$/m, ['Probably some unnecessary trailing spaces?'], ''],
  [/\[\s+\]/, ['Probably some unnecessary spaces in square brackets?'], '[]'],
  [/\}{\n/, ['Probably forgot space between "}{"?'], '} {\n'],
  [/\){\n/, ['Probably forgot space between "){"?'], ') {\n'],
  [/,\)/, ['Probably unnecessary coma before ")"?'], ')'],
  [/(\w)({\n)/, ['Probably forgot space before "{"?'], '$1 $2'],
  [/#[a-f\d]*(?=[A-F]).+?\b/, ['Probably inappropriate uppercase letter(s) in color hash?'], e => e.toLowerCase()],
  [/#([a-f\d])\1([a-f\d])\2([a-f\d])\3(?:([a-f\d])\4)?\b/, ['Probably some shortable color hash?'], e => (
    e
      .split('')
      .filter((e, i) => i % 2 === 0)
      .join('')
  )],
  [/((^| )\/\/)(?![ /])/m, ['Probably need the space after "//"?'], '$1 '],
  [/(`\n)\n+|\n+?(\n`)/, ['Probably some extra blank line(s) next to backtick?'], (...match) => `${match[1] ?? ''}${match[2] ?? ''}`],
  [/[\n ]+;\n/, ['Probably some extra space(s) before semicolon?'], ';\n'],
  // [ /\bstyled\.a\b|\b<a\b/, [ 'Probably forgot to use NextLink?' ] ],
  [/^(.*?)>(\{[^}]*\}\n)/m, ['Probably wrong code formatting?'], (...match) => (
    `${match[1]}>\n${Array.from({ length: match[1].length + 2 }, () => ' ').join('')}${match[2]}`
  )],
  [/([Gg])rey/, ['Probably spell "gray", not with "e"?'], '$1ray'],
  [/([^.]\.{3}) ({)/, ['Probably some unnecessary spaces before curly brace?'], '$1$2'],
  [new RegExp('<'.repeat(7)), ['Please, pay attention. Conflicts should be resolved.']],
  [/([^:])(:(before|after))/, ['Pseudo-elements should be written with double semicolon.'], '$1:$2'],
  // [/styled\('(\w+)'\)/, ['Probably better to use dot notation?'], 'styled.$1'],
  [/(transitionDuration\})(?!ms)/, ['Probably forgot to specify "ms"?'], '$1ms'],
  // [/\/zustand\/.*/, ['Probably forgot to re-export from "zustand index.ts"?']],
  // [/\/customHooks\/.*/, ['Probably forgot to re-export from "customHooks index.ts"?']],
  [/\bimport React\b.* from 'react'/, ['Probably no import React needed?']],
  [/\bimport type \{\}/, ['Probably forget to remove useless import?']],
  [/\bcustomLog\(/, ['Probably forget to remove customLog usage?']],
  [/([sS])emitransparent/, ['Probably misspelled word semiTransparent?'], '$1emiTransparent'],
  [/[f]rom 'zod'/, ['Prefer to use zod/v4, but if you really need zod/v3 use zod/v3 explicitly.']],
  [/[^.]((?:set|clear)(?:Timeout|Interval))\(/, e => [`Do not use raw "${e[1]}". Use "window.${e[1]}" or "global.${e[1]}" instead.`]],
  [/\b(scale-[xyz])/, e => [`Use "scale" instead of "${e[1]}".`]],
  [/set(Timeout|Interval)\([^()]/, e => [`set${e[1]} callback typings are not safe. Use something like "set${e[1]}(() => {...})" instead.`]],
  [/new Array\(/, ['Prefer to use "Array.from" instead "new Array".']],
  [/= use(Memo|Callback)</, e => [`Do not use generic parameter of use${e[1]}. Specify return type of callback parameter.`]],
  [/useRefreshDetection\(/, ['Do not forget to remove "useRefreshDetection" call.']],
];

/** @type {Set<string>} */
const uniqueErrorHashes = new Set();
/** @param {string} id */
const isBadErrorHash = id => /[a-z]{4}/.test(id) || id.includes('l');
const getErrorHash = () => {
  const getId = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');
  let id;
  do {
    id = getId();
  } while(id.length !== 6 || isBadErrorHash(id));

  return id;
};
/** @type {typeof matchReplacePatterns[number]} */
const uniqueErrorHashMatchReplacePattern = [
  /(\|)([a-z0-9]{6})(\|)/i,
  match => [`Probably bad unique error id "${match[2]}"?`],
  (...match) => `${match[1]}${getErrorHash()}${match[3]}`,
];

const fixFlag = '--fix';
const reverseFlag = '--reverse';
const isFixMode = process.argv.includes(fixFlag);
const isReverseMode = process.argv.includes(reverseFlag);
let isFoundSomeErrors = false;

/** @param {string} file */
function parseFile(file) {
  if(!file.match(/\.[jt]sx?$/i)) {
    return;
  }

  const originalText = fs.readFileSync(file).toString('utf-8');
  let text = originalText;

  for(const [re, errorMessage, replaceOn, fileNameMatchRE] of matchReplacePatterns) {
    if(fileNameMatchRE && !file.match(fileNameMatchRE)) {
      continue;
    }

    let match;
    const regExp = new RegExp(re, [...new Set(`${re.flags}g`)].join(''));

    // eslint-disable-next-line no-cond-assign
    while((match = regExp.exec(text)) && match[0] !== undefined) {
      if(isFixMode && replaceOn !== undefined) {
        const re = new RegExp(regExp, regExp.flags.replace('g', ''));

        if(typeof replaceOn === 'string') {
          text = text.replace(re, replaceOn);
        } else {
          text = text.replace(re, replaceOn);
        }

        regExp.lastIndex -= match[0].length - replaceOn.length;
      } else {
        const line = text.slice(0, match.index).split('\n').length;
        console.info(`${path.relative('.', file)}:${line}`);
        if(typeof errorMessage === 'function') {
          console.info(...errorMessage(match));
        } else {
          console.info(...errorMessage);
        }

        isFoundSomeErrors = true;
      }
    }
  }

  {
    const [re, errorMessage, replaceOn] = uniqueErrorHashMatchReplacePattern;

    /** @type {RegExpExecArray | null} */
    let match;
    const regExp = new RegExp(re, [...new Set(`${re.flags}g`)].join(''));

    // eslint-disable-next-line no-cond-assign
    while((match = regExp.exec(text)) && match[0] !== undefined) {
      const hash = match[2];
      if(hash === undefined) {
        continue;
      }

      if(!isBadErrorHash(hash) && !uniqueErrorHashes.has(hash)) {
        uniqueErrorHashes.add(hash);
        continue;
      }

      if(isFixMode && replaceOn !== undefined) {
        const re = new RegExp(regExp, regExp.flags.replace('g', ''));

        let replacedString = '';
        if(typeof replaceOn === 'string') {
          replacedString = replaceOn;
          text = text.replace(re, replaceOn);
        } else {
          const start = text.slice(0, match.index);
          const end = text.slice(match.index).replace(re, (...params) => {
            replacedString = replaceOn(...params);

            return replacedString;
          });

          text = `${start}${end}`;
        }

        regExp.lastIndex -= match[0].length - replacedString.length;
      } else {
        const line = text.slice(0, match.index).split('\n').length;
        console.info(`${path.relative('.', file)}:${line}`);
        if(typeof errorMessage === 'function') {
          console.info(...errorMessage(match));
        } else {
          console.info(...errorMessage);
        }

        isFoundSomeErrors = true;
      }
    }
  }

  if(originalText !== text) {
    fs.writeFileSync(file, text);
  }
}

/** @param {string} folderOrFile */
function parseDirOrFile(folderOrFile) {
  if(searchExcludeFilesOrFolders.includes(path.parse(folderOrFile).base)) {
    return;
  }

  if(!fs.statSync(folderOrFile).isDirectory()) {
    parseFile(folderOrFile);
  } else {
    const folder = fs.readdirSync(folderOrFile);
    if(isReverseMode) {
      folder.reverse();
    }

    for(const subfolderOrFile of folder) {
      parseDirOrFile(path.join(folderOrFile, subfolderOrFile));
    }
  }
}

const argv = process.argv.slice(2).filter(e => e !== fixFlag && e !== reverseFlag);
if(!argv.length) {
  argv.push('.');
}

for(const folderOrFile of argv) {
  parseDirOrFile(path.resolve(folderOrFile));
}

if(isFoundSomeErrors) {
  console.info();
  console.error([
    'Some errors were found. Try to',
    !Object.keys(scripts).includes('repo-fix') && 'add `repo-fix` NPM-run script and',
    'run `npm run repo-fix` to fix them.',
  ].filter(e => e !== false).join(' '));
  console.info();

  process.exit(1);
}
