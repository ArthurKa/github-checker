import { describe, expect, it } from 'vitest';
import { isUUID } from './UUID';

describe('isUUID', () => {
  it('accepts valid UUID v4 strings', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('rejects UUID without "-"', () => {
    expect(isUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('rejects invalid UUID strings', () => {
    expect(isUUID('not-a-uuid')).toBe(false);
    expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false);
    expect(isUUID('550e8400-e29b-41d4-a716-zzzzzzzzzzzz')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isUUID('')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isUUID(123)).toBe(false);
    expect(isUUID(null)).toBe(false);
    expect(isUUID(undefined)).toBe(false);
    expect(isUUID({})).toBe(false);
  });
});

describe('consistency', () => {
  it('UUID implies NonEmptyString behavior', () => {
    const value = '550e8400-e29b-41d4-a716-446655440000';

    expect(value.length).toBeGreaterThan(0);
    expect(isUUID(value)).toBe(true);
  });

  it('invalid UUID is rejected even if non-empty string', () => {
    const value = 'not-a-uuid';

    expect(value.length).toBeGreaterThan(0);
    expect(isUUID(value)).toBe(false);
  });
});
