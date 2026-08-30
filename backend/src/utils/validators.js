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

module.exports = {
  isNonEmptyString,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidEmail,
  isValidRating
};
