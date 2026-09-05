/**
 * aadhaarMasker.js — Client-Side Privacy & Aadhaar Redaction Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Redacts 12-digit Aadhaar numbers in text or user inputs to format:
 *   XXXX-XXXX-1234
 * Enforces DPDP Act 2023 privacy guidelines prior to storage or upload.
 */
'use strict';

/**
 * Mask any 12-digit Aadhaar pattern found in text.
 * e.g. "My Aadhaar is 9876 5432 1098" -> "My Aadhaar is XXXX-XXXX-1098"
 */
export function maskAadhaarNumber(input = '') {
  if (!input || typeof input !== 'string') return '';

  // Match 12 digits with optional spaces or hyphens
  const aadhaarRegex = /\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g;

  return input.replace(aadhaarRegex, (_, g1, g2, g3) => {
    return `XXXX-XXXX-${g3}`;
  });
}

/**
 * Check if a string contains a valid 12-digit Aadhaar format.
 */
export function isAadhaarFormat(input = '') {
  if (!input || typeof input !== 'string') return false;
  const digitsOnly = input.replace(/\D/g, '');
  return digitsOnly.length === 12;
}

/**
 * Sanitize user input by removing/masking sensitive strings like credit card numbers or Aadhaar.
 */
export function sanitizeSensitiveData(input = '') {
  let clean = maskAadhaarNumber(input);
  // Redact 16-digit credit card numbers
  clean = clean.replace(/\b(?:\d[ -]*?){13,16}\b/g, 'XXXX-XXXX-XXXX-XXXX');
  return clean;
}
