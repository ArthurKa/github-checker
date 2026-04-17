import { describe, expect, it } from 'vitest';
import { isStringObjectId } from './StringObjectId';

describe('isStringObjectId', () => {
  it('accepts valid BSON ObjectId strings', () => {
    expect(isStringObjectId('507f1f77bcf86cd799439011')).toBe(true);
    expect(isStringObjectId('000000000000000000000000')).toBe(true);
  });

  it('rejects invalid ObjectId strings', () => {
    expect(isStringObjectId('invalid')).toBe(false);
    expect(isStringObjectId('507f1f77bcf86cd79943901')).toBe(false);
    expect(isStringObjectId('507f1f77bcf86cd79943901111')).toBe(false);
  });

  it('rejects strings with invalid hex characters', () => {
    expect(isStringObjectId('507f1f77bcf86cd79943901z')).toBe(false);
    expect(isStringObjectId('gggggggggggggggggggggggg')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isStringObjectId('')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isStringObjectId(123)).toBe(false);
    expect(isStringObjectId(null)).toBe(false);
    expect(isStringObjectId(undefined)).toBe(false);
    expect(isStringObjectId({})).toBe(false);
  });
});

describe('consistency', () => {
  it('valid ObjectId implies NonEmptyString', () => {
    const value = '507f1f77bcf86cd799439011';

    expect(isStringObjectId(value)).toBe(true);
  });

  it('invalid ObjectId is always rejected even if non-empty', () => {
    const value = 'not-empty-but-invalid';

    expect(value.length).toBeGreaterThan(0);
    expect(isStringObjectId(value)).toBe(false);
  });
});
