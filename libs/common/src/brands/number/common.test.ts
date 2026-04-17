import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { isInteger, isNonNegative, isNonNegativeInteger, isPositive, isPositiveInteger } from './common';

describe('isNonNegative', () => {
  it('accepts 0', () => {
    expect(isNonNegative(0)).toBe(true);
  });

  it('accepts positive numbers', () => {
    expect(isNonNegative(10)).toBe(true);
    expect(isNonNegative(2.2)).toBe(true);
  });

  it('rejects negative numbers', () => {
    expect(isNonNegative(-1)).toBe(false);
    expect(isNonNegative(-10.33)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isNonNegative('1')).toBe(false);
    expect(isNonNegative(null)).toBe(false);
    expect(isNonNegative(undefined)).toBe(false);
    expect(isNonNegative({})).toBe(false);
  });
});

describe('isPositive', () => {
  it('accepts positive numbers', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(100)).toBe(true);
    expect(isPositive(9.6)).toBe(true);
  });

  it('rejects 0', () => {
    expect(isPositive(0)).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(isPositive(-1)).toBe(false);
    expect(isPositive(-100.5)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isPositive('1')).toBe(false);
    expect(isPositive('asd')).toBe(false);
    expect(isPositive('1e3')).toBe(false);
  });
});

describe('isInteger', () => {
  it('accepts integers', () => {
    expect(isInteger(100)).toBe(true);
    expect(isInteger(1)).toBe(true);
    expect(isInteger(0)).toBe(true);
    expect(isInteger(-10)).toBe(true);
  });

  it('rejects floats', () => {
    expect(isInteger(1.1)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isInteger('1')).toBe(false);
    expect(isInteger('asd')).toBe(false);
    expect(isInteger('1e3')).toBe(false);
  });
});

describe('isNonNegativeInteger', () => {
  it('accepts valid values', () => {
    expect(isNonNegativeInteger(0)).toBe(true);
    expect(isNonNegativeInteger(1)).toBe(true);
    expect(isNonNegativeInteger(10)).toBe(true);
  });

  it('rejects negatives', () => {
    expect(isNonNegativeInteger(-1)).toBe(false);
    expect(isNonNegativeInteger(-10)).toBe(false);
  });

  it('rejects floats', () => {
    expect(isNonNegativeInteger(1.5)).toBe(false);
    expect(isNonNegativeInteger(5.6)).toBe(false);
  });
});

describe('isPositiveInteger', () => {
  it('accepts valid values', () => {
    expect(isPositiveInteger(1)).toBe(true);
    expect(isPositiveInteger(10)).toBe(true);
  });

  it('rejects 0', () => {
    expect(isPositiveInteger(0)).toBe(false);
  });

  it('rejects negatives', () => {
    expect(isPositiveInteger(-1)).toBe(false);
  });

  it('rejects floats', () => {
    expect(isPositiveInteger(1.5)).toBe(false);
  });
});

describe('consistency', () => {
  it('positive implies non-negative', () => {
    const value = 5;

    expect(isPositive(value)).toBe(true);
    expect(isNonNegative(value)).toBe(true);
  });

  it('positive integer implies all others', () => {
    const value = 5;

    expect(isPositiveInteger(value)).toBe(true);
    expect(isPositive(value)).toBe(true);
    expect(isInteger(value)).toBe(true);
    expect(isNonNegativeInteger(value)).toBe(true);
  });
});

describe('property-based', () => {
  it('non-negative always >= 0', () => {
    fc.assert(
      fc.property(fc.float(), e => {
        if(isNonNegative(e)) {
          expect(e).toBeGreaterThanOrEqual(0);
        }
      }),
    );
  });

  it('integer has no decimals', () => {
    fc.assert(
      fc.property(fc.float(), e => {
        if(isInteger(e)) {
          expect(Number.isInteger(e)).toBe(true);
        }
      }),
    );
  });
});
