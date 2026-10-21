const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isNonEmptyString, isValidEmail } = require('../utils/validators');
const { JWT_SECRET } = require('../config/envValidator');

// In-memory user database
const usersStore = new Map();

// Pre-seed 4 SIH26092 Demo Evaluation Accounts
const DEMO_SEED_USERS = [
  {
    id: 'user-demo-ramesh',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@schemesetu.in',
    password: 'Demo@123',
    role: 'beneficiary',
    category: 'SC',
    annualIncome: 350000,
    district: 'YSR Kadapa',
    state: 'Andhra Pradesh'
  },
  {
    id: 'user-demo-lakshmi',
    name: 'Lakshmi Devi',
    email: 'lakshmi.devi@schemesetu.in',
    password: 'Demo@123',
    role: 'beneficiary',
    category: 'SC',
    annualIncome: 450000,
    district: 'Kadapa',
    state: 'Andhra Pradesh'
  },
  {
    id: 'user-demo-kavitha',
    name: 'Kavitha VLE',
    email: 'kavitha.vle@schemesetu.in',
    password: 'Agent@123',
    role: 'agent',
    agentId: 'CSC-AP-KADAPA-01'
  },
  {
    id: 'user-demo-admin',
    name: 'SchemeSetu Nodal Officer',
    email: 'admin@schemesetu.in',
    password: 'Admin@123',
    role: 'admin'
  }
];

// Seed sync on load
DEMO_SEED_USERS.forEach(user => {
  const passwordHash = bcrypt.hashSync(user.password, 10);
  usersStore.set(user.id, {
    id: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    passwordHash,
    role: user.role,
    category: user.category,
    annualIncome: user.annualIncome,
    district: user.district,
    state: user.state,
    agentId: user.agentId,
    createdAt: new Date().toISOString()
  });
});

/**
 * GET /api/v1/demo-accounts
 */
function getDemoAccounts(req, res) {
  return res.status(200).json({
    success: true,
    message: 'SIH26092 Verified Demo Evaluation Accounts',
    accounts: [
      {
        email: 'ramesh.kumar@schemesetu.in',
        password: 'Demo@123',
        name: 'Ramesh Kumar',
        role: 'Beneficiary (SC Entrepreneur, Income ₹3.50L, YSR Kadapa)',
        category: 'SC'
      },
      {
        email: 'lakshmi.devi@schemesetu.in',
        password: 'Demo@123',
        name: 'Lakshmi Devi',
        role: 'Beneficiary (SC Woman Artisan, Income ₹4.50L, Kadapa)',
        category: 'SC'
      },
      {
        email: 'kavitha.vle@schemesetu.in',
        password: 'Agent@123',
        name: 'Kavitha VLE',
        role: 'Certified Agent / CSC Operator'
      },
      {
        email: 'admin@schemesetu.in',
        password: 'Admin@123',
        name: 'SchemeSetu Nodal Officer',
        role: 'State Nodal Administrator (MoSJE)'
      }
    ]
  });
}

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
          error: 'An account with this email address already exists.'
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

/**
 * GET /api/v1/users/me
 */
function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  const user = usersStore.get(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User profile not found.' });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getDemoAccounts
};

