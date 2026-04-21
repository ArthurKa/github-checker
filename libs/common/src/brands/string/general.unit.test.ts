import { describe, expect, it } from 'vitest';
import { isEmail, isRepoName } from './general';

describe('isRepoName', () => {
  it('accepts valid repo names in format owner/repo', () => {
    expect(isRepoName('facebook/react')).toBe(true);
    expect(isRepoName('my-org/my-repo')).toBe(true);
    expect(isRepoName('user123/project_1')).toBe(true);
  });

  it('rejects missing slash', () => {
    expect(isRepoName('react')).toBe(false);
    expect(isRepoName('invalidrepo')).toBe(false);
  });

  it('rejects multiple slashes', () => {
    expect(isRepoName('a/b/c')).toBe(false);
  });

  it('rejects empty parts', () => {
    expect(isRepoName('/repo')).toBe(false);
    expect(isRepoName('owner/')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isRepoName(123)).toBe(false);
    expect(isRepoName(null)).toBe(false);
    expect(isRepoName(undefined)).toBe(false);
    expect(isRepoName({})).toBe(false);
  });
});

describe('isEmail', () => {
  it('accepts valid emails', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('user.name+tag@gmail.com')).toBe(true);
    expect(isEmail('a@b.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isEmail('plainaddress')).toBe(false);
    expect(isEmail('missing@domain')).toBe(false);
    expect(isEmail('@missinguser.com')).toBe(false);
    expect(isEmail('test@.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isEmail('')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isEmail(123)).toBe(false);
    expect(isEmail(null)).toBe(false);
  });
});

describe('consistency', () => {
  it('repo name implies non-empty string', () => {
    const value = 'owner/repo';

    expect(isRepoName(value)).toBe(true);
  });

  it('email implies non-empty string', () => {
    const value = 'test@example.com';

    expect(isEmail(value)).toBe(true);
  });

  it('repo and email are disjoint (sanity check)', () => {
    const value = 'a@b.com';

    expect(isEmail(value)).toBe(true);
    expect(isRepoName(value)).toBe(false);
  });
});

describe('repo name strictness', () => {
  it('rejects special edge cases', () => {
    expect(isRepoName('owner/repo/extra')).toBe(false);
    expect(isRepoName('owner')).toBe(false);
  });
});
