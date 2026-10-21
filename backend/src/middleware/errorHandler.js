/**
 * Centralized Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  let errorMessage = err.message || 'Internal Server Error';
  if (isProd && statusCode === 500) {
    errorMessage = 'Internal server error';
  }

  // Log error details for server diagnostics
  console.error(`[Error] [${req.method}] ${req.originalUrl} - Status: ${statusCode} - ${err.message || 'Unknown error'}`);
  if (statusCode === 500 && err.stack && !isProd) {
    console.error(err.stack);
  }

  const responseBody = {
    success: false,
    error: errorMessage,
    requestId
  };

  if (!isProd && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;

