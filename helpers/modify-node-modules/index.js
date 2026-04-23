// @ts-check
'use strict';

const isCheckMode = process.argv.includes('--check');

[
  /* eslint-disable global-require */
  require('./modify-useEffect-typings'),
  require('./modify-Number-isNaN-typings'),
  require('./modify-setTimeout-typings'),
  require('./modify-setInterval-typings'),
  require('./modify-Array-filter-typings'),
  require('./modify-Array-every-typings'),
  require('./modify-Array-some-typings'),
  require('./modify-Array-find-typings'),
  require('./modify-Array-findIndex-typings'),
  require('./modify-Array-findLast-typings'),
  require('./modify-Array-findLastIndex-typings'),
  require('./modify-ESLint-react-hooks-rules-of-hooks'),
  require('./modify-Zustand-store-setState-typings'),
  require('./modify-Ionic-useIonViewWill_Did_Enter_Leave-typings'),
  require('./modify-Ionic-AlertButton-handler-typings'),
  require('./modify-react-ErrorBoundary-typings'),
  require('./modify-total-typescript-ts-reset'),
  require('./modify-Vitest-toEqual-typings'),
  require('./modify-Vitest-toStrictEqual-typings'),
  require('./modify-Vitest-toBe-typings'),
  require('./modify-Vitest-toMatchObject-typings'),
  require('./modify-Vitest-spy-fn-typings'),
  require('./modify-Vitest-toBeNull-typings'),
  /* eslint-enable global-require */
].forEach(f => {
  let result;
  try {
    result = f(isCheckMode);
  } catch(e) {
    result = null;
  }

  if(result === 'update-needed') {
    console.error('Modifying node_modules needed. Try to run `npm run prune && npm ci`.');
    process.exit(1);
  }
});
