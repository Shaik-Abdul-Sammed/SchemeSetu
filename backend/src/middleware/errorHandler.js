/**
 * Centralized Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || (res.statusCode >= 400 ? res.statusCode : 500);

  const errorMessage = err.message || 'Internal Server Error';

  // Log error details for server diagnostics
  console.error(`[Error] [${req.method}] ${req.originalUrl} - Status: ${statusCode} - ${errorMessage}`);
  if (statusCode === 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage
  });
}

module.exports = errorHandler;
