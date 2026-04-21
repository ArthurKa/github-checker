import { describe, expect, it } from 'vitest';
import { isBasicNoTrailingSlashStringURL, isBasicStringURL, isNonEmptyString, isStringURL } from './common';

describe('isNonEmptyString', () => {
  it('accepts non-empty strings', () => {
    expect(isNonEmptyString('a')).toBe(true);
    expect(isNonEmptyString('hello')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
  });
});

describe('isStringURL', () => {
  it('accepts valid URLs', () => {
    expect(isStringURL('https://example.com')).toBe(true);
    expect(isStringURL('https://example.com/path')).toBe(true);
    expect(isStringURL('http://localhost:3000')).toBe(true);
  });

  it('accepts trailing slash URLs', () => {
    expect(isStringURL('https://example.com/')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isStringURL('not-a-url')).toBe(false);
    expect(isStringURL('example.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isStringURL('')).toBe(false);
  });
});

describe('isBasicStringURL', () => {
  it('accepts basic URLs', () => {
    expect(isBasicStringURL('https://example.com')).toBe(true);
    expect(isBasicStringURL('https://example.com/')).toBe(true);
    expect(isBasicStringURL('https://example.com/path')).toBe(true);
    expect(isBasicStringURL('https://example.com/path/')).toBe(true);
  });

  it('rejects URLs with query params', () => {
    expect(isBasicStringURL('https://example.com?x=1')).toBe(false);
    expect(isBasicStringURL('https://example.com/path?x=1&y=2')).toBe(false);
  });

  it('rejects URLs with hash', () => {
    expect(isBasicStringURL('https://example.com#')).toBe(false);
    expect(isBasicStringURL('https://example.com#hash')).toBe(false);
  });

  it('still respects URL validity', () => {
    expect(isBasicStringURL('not-a-url')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isBasicStringURL('')).toBe(false);
  });
});

describe('isBasicNoTrailingSlashStringURL', () => {
  it('accepts basic URLs without trailing slash', () => {
    expect(isBasicNoTrailingSlashStringURL('https://example.com')).toBe(true);
    expect(isBasicNoTrailingSlashStringURL('https://example.com/path')).toBe(true);
  });

  it('rejects URLs with query params', () => {
    expect(isBasicNoTrailingSlashStringURL('https://example.com?')).toBe(false);
    expect(isBasicNoTrailingSlashStringURL('https://example.com?x=1')).toBe(false);
  });

  it('rejects URLs with query hash', () => {
    expect(isBasicNoTrailingSlashStringURL('https://example.com#')).toBe(false);
    expect(isBasicNoTrailingSlashStringURL('https://example.com#hash')).toBe(false);
  });

  it('rejects URLs with trailing slash', () => {
    expect(isBasicNoTrailingSlashStringURL('https://example.com/')).toBe(false);
    expect(isBasicNoTrailingSlashStringURL('https://example.com/path/')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(isBasicNoTrailingSlashStringURL('not-a-url')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isBasicNoTrailingSlashStringURL('')).toBe(false);
  });
});
