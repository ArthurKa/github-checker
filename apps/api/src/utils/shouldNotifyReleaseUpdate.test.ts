import { expect, it } from 'vitest';
import { ReleaseTag } from '@repo/common/src/brands';
import { shouldNotifyReleaseUpdate } from './shouldNotifyReleaseUpdate';

it('repo is null', () => {
  expect(shouldNotifyReleaseUpdate(null, null)).toBe(false);
  expect(shouldNotifyReleaseUpdate(null, ReleaseTag('asd/qwe'))).toBe(false);
});

it('repo is not null', () => {
  expect(shouldNotifyReleaseUpdate({ latestTag: null }, null)).toBe(false);
  expect(shouldNotifyReleaseUpdate({ latestTag: null }, ReleaseTag('asd/qwe'))).toBe(true);
  expect(shouldNotifyReleaseUpdate({ latestTag: ReleaseTag('asd/qwe') }, null)).toBe(true);
  expect(shouldNotifyReleaseUpdate({ latestTag: ReleaseTag('asd/qwe') }, ReleaseTag('asd/qwe'))).toBe(false);
  expect(shouldNotifyReleaseUpdate({ latestTag: ReleaseTag('asd/qwe') }, ReleaseTag('other/value'))).toBe(true);
});
