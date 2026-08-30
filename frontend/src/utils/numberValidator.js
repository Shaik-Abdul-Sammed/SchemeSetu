/**
 * Safe Numerical Input Validator & Centralized Currency Formatter for SchemeSetu
 * Prevents JavaScript Number Overflow, Infinity, NaN, scientific notation (e.g. 1e50),
 * negative numbers, and values beyond configured scheme thresholds.
 */

export const NUMERIC_LIMITS = {
  income: {
    min: 0,
    max: 10000000, // ₹1 Crore
    label: 'Annual Income',
    maxDigits: 8,
    errorMsg: 'Enter an annual family income between ₹0 and ₹1,00,00,000.'
  },
  cost: {
    min: 1000,
    max: 50000000, // ₹5 Crore
    label: 'Project Cost',
    maxDigits: 8,
    errorMsg: 'Enter a valid project cost between ₹1,000 and ₹5,00,00,000.'
  },
  loanRequirement: {
    min: 1000,
    max: 50000000, // ₹5 Crore
    label: 'Loan Requirement',
    maxDigits: 8,
    errorMsg: 'Enter a loan amount between ₹1,000 and ₹5,00,00,000.'
  },
  age: {
    min: 18,
    max: 100,
    label: 'Age',
    maxDigits: 3,
    errorMsg: 'Enter an age between 18 and 100 years.'
  },
  tenure: {
    min: 6,
    max: 360,
    label: 'Loan Tenure (Months)',
    maxDigits: 3,
    errorMsg: 'Enter a tenure between 6 and 360 months.'
  },
  experience: {
    min: 0,
    max: 70,
    label: 'Business Experience (Years)',
    maxDigits: 2,
    errorMsg: 'Enter experience between 0 and 70 years.'
  },
  phone: {
    pattern: /^[6-9]\d{9}$/,
    maxDigits: 10,
    label: 'Mobile Number',
    errorMsg: 'Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).'
  }
};

/**
 * Safely sanitizes raw input string to digits only and truncates beyond max allowed length.
 * @param {string|number} rawValue
 * @param {number} maxDigits
 * @returns {string} clean digits string
 */
export function sanitizeNumericInput(rawValue, maxDigits = 10) {
  if (rawValue === null || rawValue === undefined) return '';
  const str = String(rawValue).replace(/[^\d]/g, '');
  return str.slice(0, maxDigits);
}

/**
 * Safely parses integer with bounds checking.
 * Returns isValid: false if value exceeds limits, is NaN, is negative, or has scientific notation.
 * @param {string|number} value
 * @param {string} fieldKey ('income' | 'cost' | 'age' | 'loanRequirement' | etc.)
 * @returns {{ value: number, isValid: boolean, error: string|null }}
 */
export function validateAndParseNumber(value, fieldKey) {
  const config = NUMERIC_LIMITS[fieldKey];
  if (!config) {
    const num = Number(value);
    const isValid = !isNaN(num) && isFinite(num) && num >= 0 && String(value).length <= 10;
    return {
      value: isValid ? num : 0,
      isValid,
      error: isValid ? null : 'Invalid numerical value.'
    };
  }

  if (value === '' || value === null || value === undefined) {
    return { value: 0, isValid: false, error: `${config.label} is required.` };
  }

  const strVal = String(value).trim();
  
  // Reject scientific notation, letters, decimals, or negative signs
  if (!/^\d+$/.test(strVal)) {
    return { value: 0, isValid: false, error: config.errorMsg };
  }

  // Reject excessively large strings (overflow protection)
  if (strVal.length > config.maxDigits) {
    return { value: 0, isValid: false, error: config.errorMsg };
  }

  const num = parseInt(strVal, 10);

  if (isNaN(num) || !isFinite(num)) {
    return { value: 0, isValid: false, error: config.errorMsg };
  }

  if (num < config.min || num > config.max) {
    return { value: num, isValid: false, error: config.errorMsg };
  }

  return { value: num, isValid: true, error: null };
}

/**
 * Safe, centralized Indian currency formatter.
 * Guarantees no corruption, no scientific notation expansion, and no endless commas.
 * @param {number|string} amount
 * @returns {string} e.g. "₹2,50,000"
 */
export function formatIndianCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return '₹0';
  if (typeof amount === 'string' && amount.startsWith('₹') && !amount.includes('e+')) {
    return amount;
  }
  
  if (typeof amount === 'string') {
    const rawDigits = amount.replace(/[^\d]/g, '');
    if (rawDigits.length > 12) {
      return 'Outside Supported Limit';
    }
  }

  const cleanStr = typeof amount === 'string' ? amount.replace(/[^\d.]/g, '') : String(amount);
  if (!cleanStr) return '₹0';

  const num = Number(cleanStr);
  if (isNaN(num) || !isFinite(num) || num < 0) {
    return '₹0';
  }

  if (num > 1000000000) {
    return 'Outside Supported Limit';
  }

  try {
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  } catch (e) {
    return `₹${Math.round(num)}`;
  }
}
