/**
 * rateLimiter.js — In-Memory Token Bucket / Sliding Window Rate Limiter
 * SchemeSetu SIH26092 | Brute-force & Anti-Spam Protection
 */
'use strict';

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many requests, please try again later.' }) {
  const store = new Map();

  // Periodic cleanup of stale IPs every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of store.entries()) {
      if (now > data.resetTime) {
        store.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupInterval.unref) cleanupInterval.unref();

  return function (req, res, next) {
    // In test environment, skip rate limiting to avoid breaking test suites
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    let record = store.get(ip);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: retryAfterSeconds,
        statusCode: 429
      });
    }

    next();
  };
}

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Account creation rate limit reached. Maximum 5 registrations per hour allowed.'
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  registerLimiter
};
