/**
 * envValidator.js — Startup Environment Variable Validation & Security Configuration
 * SchemeSetu SIH26092 | Production-Grade Environment Sanitizer
 */
'use strict';

const DEV_FALLBACK_SECRET = 'schemesetu-development-secret-change-in-production';

function validateEnvironment() {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // 1. JWT Secret Validation
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === DEV_FALLBACK_SECRET) {
    if (isProd) {
      errors.push('CRITICAL: JWT_SECRET must be explicitly defined in production and cannot match default development fallback.');
    } else {
      warnings.push('[SECURITY WARNING] Using default development JWT_SECRET. Override with process.env.JWT_SECRET before production deployment.');
    }
  } else if (jwtSecret.length < 16) {
    if (isProd) {
      errors.push('CRITICAL: JWT_SECRET is too short for production. Minimum length is 16 characters.');
    } else {
      warnings.push('[SECURITY WARNING] JWT_SECRET should be at least 16 characters.');
    }
  }

  // 2. Port Validation
  const port = process.env.PORT;
  if (port && isNaN(Number(port))) {
    errors.push(`INVALID: PORT environment variable (${port}) must be a valid number.`);
  }

  // Log Warnings
  warnings.forEach(w => console.warn(w));

  // Halt on Fatal Production Configuration Errors
  if (errors.length > 0) {
    console.error('\n======================================================');
    console.error('❌ FATAL STARTUP CONFIGURATION ERRORS:');
    errors.forEach(e => console.error(`   • ${e}`));
    console.error('======================================================\n');
    process.exit(1);
  }

  return {
    jwtSecret: jwtSecret || DEV_FALLBACK_SECRET,
    isProd,
    port: Number(process.env.PORT || 5000),
    host: process.env.HOST || '0.0.0.0'
  };
}

const envConfig = validateEnvironment();

module.exports = {
  validateEnvironment,
  JWT_SECRET: envConfig.jwtSecret,
  isProduction: envConfig.isProd,
  PORT: envConfig.port,
  HOST: envConfig.host
};
