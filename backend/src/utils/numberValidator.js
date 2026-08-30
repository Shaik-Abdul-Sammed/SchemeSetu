/**
 * Safe Numerical Input Validator & Sanitizer for SchemeSetu Backend
 */

const NUMERIC_LIMITS = {
  income: { min: 0, max: 10000000, label: 'Annual Income', maxDigits: 8 },
  cost: { min: 0, max: 50000000, label: 'Project Cost', maxDigits: 8 },
  loanAmount: { min: 0, max: 50000000, label: 'Loan Requirement', maxDigits: 8 },
  principal: { min: 0, max: 50000000, label: 'Principal Amount', maxDigits: 8 },
  age: { min: 18, max: 100, label: 'Age', maxDigits: 3 },
  tenureMonths: { min: 1, max: 360, label: 'Tenure Months', maxDigits: 3 },
  moratoriumMonths: { min: 0, max: 60, label: 'Moratorium Months', maxDigits: 2 }
};

function sanitizeAndValidateNumber(value, fieldKey, required = true) {
  if (value === null || value === undefined || value === '') {
    if (!required) return { value: null, isValid: true, error: null };
    return { value: 0, isValid: false, error: `${fieldKey} is required.` };
  }

  const strVal = String(value).trim();
  if (!/^-?\d+$/.test(strVal)) {
    return { value: 0, isValid: false, error: `${fieldKey} must be a valid integer.` };
  }

  const config = NUMERIC_LIMITS[fieldKey];
  if (config && strVal.replace('-', '').length > config.maxDigits) {
    return { value: 0, isValid: false, error: `${fieldKey} exceeds maximum allowed digits.` };
  }

  const num = parseInt(strVal, 10);
  if (isNaN(num) || !isFinite(num)) {
    return { value: 0, isValid: false, error: `${fieldKey} must be a finite number.` };
  }

  if (config) {
    if (num < config.min || num > config.max) {
      return { 
        value: num, 
        isValid: false, 
        error: `${config.label} must be between ${config.min} and ${config.max}.` 
      };
    }
  }

  return { value: num, isValid: true, error: null };
}

function formatIndianCurrency(amount) {
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

module.exports = {
  NUMERIC_LIMITS,
  sanitizeAndValidateNumber,
  formatIndianCurrency
};
