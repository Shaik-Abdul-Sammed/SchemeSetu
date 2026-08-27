/**
 * 404 Not Found Middleware
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = notFound;
