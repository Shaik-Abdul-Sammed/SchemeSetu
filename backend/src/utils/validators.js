/**
 * SchemeSetu Lightweight Input Validation Utility
 */

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value) {
  if (value === null || value === undefined || value === '') return false;
  const str = String(value).trim();
  if (str.replace('-', '').length > 12) return false;
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) && num > 0 && num <= 1000000000;
}

function isNonNegativeNumber(value) {
  if (value === null || value === undefined || value === '') return false;
  const str = String(value).trim();
  if (str.replace('-', '').length > 12) return false;
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) && num >= 0 && num <= 1000000000;
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidRating(rating) {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}

// Verhoeff algorithm multiplication table
const d = [
  [0,1,2,3,4,5,6,7,8,9], [1,2,3,4,0,6,7,8,9,5], [2,3,4,0,1,7,8,9,5,6], [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8], [5,9,8,7,6,0,4,3,2,1], [6,5,9,8,7,1,0,4,3,2], [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4], [9,8,7,6,5,4,3,2,1,0]
];

// Verhoeff algorithm permutation table
const p = [
  [0,1,2,3,4,5,6,7,8,9], [1,5,7,6,2,8,3,4,9,0], [2,6,8,0,5,4,7,9,1,3], [3,7,9,1,8,0,6,2,5,4],
  [4,8,0,2,3,9,1,5,7,6], [5,0,3,9,7,1,8,6,4,2], [6,1,4,5,9,2,0,8,3,7], [7,2,5,8,4,3,9,1,0,6]
];

function isValidAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== 'string') return false;
  const clean = aadhaar.replace(/\s+/g, '');
  if (!/^\d{12}$/.test(clean)) return false;

  let c = 0;
  const invertedArray = clean.split('').map(Number).reverse();
  for (let i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }
  return c === 0;
}

function isValidPAN(pan) {
  if (!pan || typeof pan !== 'string') return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

module.exports = {
  isNonEmptyString,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidEmail,
  isValidRating,
  isValidAadhaar,
  isValidPAN
};
