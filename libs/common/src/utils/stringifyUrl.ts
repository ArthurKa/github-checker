import queryString from 'query-string';

export const stringifyUrl = (url: string, query?: Parameters<typeof queryString.stringifyUrl>[0]['query']) => (
  queryString.stringifyUrl({ url, query }, {
    sort: () => 0,
  })
);
