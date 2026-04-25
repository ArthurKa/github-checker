import { expect, it } from 'vitest';
import { ReleaseTag, StringURL } from '@repo/common/src/brands';
import { shouldNotifyReleaseUpdate } from './shouldNotifyReleaseUpdate';
import { DbRepo } from '../services/db/repoService';

const makeReleaseTag = (tag: ReleaseTag): DbRepo['latestTag'] => ({
  tag,
  url: StringURL('https://example.com'),
});

it('repo is null', () => {
  expect(shouldNotifyReleaseUpdate(null, null)).toBe(false);
  expect(shouldNotifyReleaseUpdate(null, makeReleaseTag(ReleaseTag('asd/qwe')))).toBe(false);
});

it('repo is not null', () => {
  expect(shouldNotifyReleaseUpdate({ latestTag: null }, null)).toBe(false);
  expect(shouldNotifyReleaseUpdate({ latestTag: null }, makeReleaseTag(ReleaseTag('asd/qwe')))).toBe(true);
  expect(shouldNotifyReleaseUpdate({ latestTag: makeReleaseTag(ReleaseTag('asd/qwe')) }, null)).toBe(true);
  expect(shouldNotifyReleaseUpdate({ latestTag: makeReleaseTag(ReleaseTag('asd/qwe')) }, makeReleaseTag(ReleaseTag('asd/qwe')))).toBe(false);
  expect(shouldNotifyReleaseUpdate({ latestTag: makeReleaseTag(ReleaseTag('asd/qwe')) }, makeReleaseTag(ReleaseTag('other/value')))).toBe(true);
});
