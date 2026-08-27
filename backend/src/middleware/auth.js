const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'schemesetu-development-secret-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication token required.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired authentication token.'
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
