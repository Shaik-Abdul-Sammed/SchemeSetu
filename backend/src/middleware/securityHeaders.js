/**
 * securityHeaders.js — Production Security Headers Middleware (Helmet Equivalent)
 * SchemeSetu SIH26092 | Strict Gov-Grade Security Hardening
 */
'use strict';

function securityHeaders() {
  const isProd = process.env.NODE_ENV === 'production';

  return function (req, res, next) {
    // 1. Content Security Policy (CSP)
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: http:; object-src 'none'; frame-ancestors 'none';"
    );

    // 2. Clickjacking Protection
    res.setHeader('X-Frame-Options', 'DENY');

    // 3. MIME-Sniffing Protection
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 4. Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 5. Cross-Site Scripting Protection (legacy browser fallback)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // 6. Disable Powered-By header
    res.removeHeader('X-Powered-By');

    // 7. Strict-Transport-Security (HSTS) in production only
    if (isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
  };
}

module.exports = securityHeaders;
