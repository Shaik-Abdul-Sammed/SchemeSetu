import { describe, it, expect } from 'vitest';
import { calculateStandardEmi } from '../financialCalculators';

describe('financialCalculators - calculateStandardEmi', () => {
  // 1. Standard EMI (100000, 8%, 36, 6) expects 3688.83
  it('1. Standard EMI (100000, 8%, 36, 6) expects 3688.83', () => {
    const res = calculateStandardEmi({ principal: 100000, rate: 8, tenureMonths: 36, moratoriumMonths: 6 });
    expect(res.emi).toBe(3688.83);
  });

  // 2. Zero interest (100000, 0%, 12) expects 8333.33
  it('2. Zero interest (100000, 0%, 12) expects 8333.33', () => {
    const res = calculateStandardEmi({ principal: 100000, rate: 0, tenureMonths: 12, moratoriumMonths: 0 });
    expect(res.emi).toBe(8333.33);
  });

  // 3. Zero tenure returns null or throws
  it('3. Zero tenure returns null or throws', () => {
    expect(() => calculateStandardEmi({ principal: 100000, rate: 8, tenureMonths: 0 })).toThrow();
  });

  // 4. Negative principal throws
  it('4. Negative principal throws', () => {
    expect(() => calculateStandardEmi({ principal: -50000, rate: 8, tenureMonths: 12 })).toThrow();
  });

  // 5. Moratorium 3 differs from moratorium 12
  it('5. Moratorium 3 differs from moratorium 12', () => {
    const res3 = calculateStandardEmi({ principal: 200000, rate: 7.5, tenureMonths: 60, moratoriumMonths: 3 });
    const res12 = calculateStandardEmi({ principal: 200000, rate: 7.5, tenureMonths: 60, moratoriumMonths: 12 });
    expect(res3.emi).not.toBe(res12.emi);
    expect(res3.totalInterest).not.toBe(res12.totalInterest);
  });

  // 6. Micro Finance boundary (140000, 6.5%, 60, 3)
  it('6. Micro Finance boundary (140000, 6.5%, 60, 3)', () => {
    const res = calculateStandardEmi({ principal: 140000, rate: 6.5, tenureMonths: 60, moratoriumMonths: 3 });
    expect(res.emi).toBeGreaterThan(0);
    expect(res.principal).toBe(140000);
    expect(res.rate).toBe(6.5);
  });

  // 7. Term Loan boundary (5000000, 7.5%, 120, 6)
  it('7. Term Loan boundary (5000000, 7.5%, 120, 6)', () => {
    const res = calculateStandardEmi({ principal: 5000000, rate: 7.5, tenureMonths: 120, moratoriumMonths: 6 });
    expect(res.emi).toBeGreaterThan(0);
    expect(res.principal).toBe(5000000);
    expect(res.rate).toBe(7.5);
  });

  // 8. Educational Loan (2000000, 4.0%, 84, 12)
  it('8. Educational Loan (2000000, 4.0%, 84, 12)', () => {
    const res = calculateStandardEmi({ principal: 2000000, rate: 4.0, tenureMonths: 84, moratoriumMonths: 12 });
    expect(res.emi).toBeGreaterThan(0);
    expect(res.principal).toBe(2000000);
    expect(res.rate).toBe(4.0);
  });

  // 9. Sub-paise rounding (1, 8%, 12) rounds to 2 decimals
  it('9. Sub-paise rounding (1, 8%, 12) rounds to 2 decimals', () => {
    const res = calculateStandardEmi({ principal: 1, rate: 8, tenureMonths: 12, moratoriumMonths: 0 });
    expect(typeof res.emi).toBe('number');
    const decimalPlaces = (res.emi.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  // 10. Rate 5% throws (below 6.5% floor)
  it('10. Rate 5% throws (below 6.5% floor)', () => {
    expect(() => calculateStandardEmi({ principal: 100000, rate: 5.0, tenureMonths: 36, validateFloor: true })).toThrow(/below 6.5% floor/i);
  });
});
