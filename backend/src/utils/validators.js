/**
 * SchemeSetu Lightweight Input Validation Utility
 */

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value) {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && num > 0;
}

function isNonNegativeNumber(value) {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && num >= 0;
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
