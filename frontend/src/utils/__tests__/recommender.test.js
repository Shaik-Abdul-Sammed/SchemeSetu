import { describe, it, expect } from 'vitest';
import { recommendScheme } from '../recommender';

describe('recommender - recommendScheme (SIH26092)', () => {
  // 1. 4L income, 1L project, business returns Micro Finance
  it('1. 4L income, 1L project, business returns Micro Finance', () => {
    const res = recommendScheme({ income: 400000, cost: 100000, projectType: 'business' });
    expect(res.eligible).toBe(true);
    expect(res.schemeName).toBe('Micro Finance');
  });

  // 2. 4L income, 20L project, business returns Term Loan
  it('2. 4L income, 20L project, business returns Term Loan', () => {
    const res = recommendScheme({ income: 400000, cost: 2000000, projectType: 'business' });
    expect(res.eligible).toBe(true);
    expect(res.schemeName).toBe('Term Loan');
  });

  // 3. 4L income, education=true returns Educational Loan
  it('3. 4L income, education=true returns Educational Loan', () => {
    const res = recommendScheme({ income: 400000, cost: 1500000, education: true });
    expect(res.eligible).toBe(true);
    expect(res.schemeName).toBe('Educational Loan');
  });

  // 4. 5.01L income returns ineligible
  it('4. 5.01L income returns ineligible', () => {
    const res = recommendScheme({ income: 501000, cost: 100000 });
    expect(res.eligible).toBe(false);
    expect(res.reason).toMatch(/exceeds concessional limit/i);
  });

  // 5. 4.99L income returns eligible
  it('5. 4.99L income returns eligible', () => {
    const res = recommendScheme({ income: 499000, cost: 100000 });
    expect(res.eligible).toBe(true);
  });

  // 6. 50.01L project returns Term Loan or ineligible
  it('6. 50.01L project returns Term Loan or ineligible', () => {
    const res = recommendScheme({ income: 400000, cost: 5001000 });
    // Over ₹50L exceeds NSFDC term loan ceiling
    expect(res.eligible).toBe(false);
  });
});
