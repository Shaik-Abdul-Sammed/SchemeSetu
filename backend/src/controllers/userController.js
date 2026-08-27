const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isNonEmptyString, isValidEmail } = require('../utils/validators');

// In-memory user database
const usersStore = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'schemesetu-development-secret-change-in-production';

/**
 * POST /api/v1/users/register
 */
async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!isNonEmptyString(name)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: name is required.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: a valid email address is required.'
      });
    }

    if (!isNonEmptyString(password) || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate email
    for (const user of usersStore.values()) {
      if (user.email === normalizedEmail) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists.'
        });
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userId = `user-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userRecord = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    usersStore.set(userId, userRecord);

    const token = jwt.sign(
      { id: userId, email: userRecord.email, name: userRecord.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      user: {
        id: userId,
        name: userRecord.name,
        email: userRecord.email
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/users/login
 */
async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: a valid email address is required.'
      });
    }

    if (!isNonEmptyString(password)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: password is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let matchedUser = null;
    for (const user of usersStore.values()) {
      if (user.email === normalizedEmail) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, matchedUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: matchedUser.id, email: matchedUser.email, name: matchedUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerUser,
  loginUser
};
