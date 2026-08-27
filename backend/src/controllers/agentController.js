const { isNonEmptyString } = require('../utils/validators');

// In-memory application storage
const applicationsStore = new Map();

/**
 * Generates unique application ID.
 */
function generateApplicationId() {
  return `APP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * POST /api/v1/agent/submit
 */
function submitApplication(req, res, next) {
  try {
    const { agentId, userId, schemeId, applicationData = {} } = req.body || {};

    if (!isNonEmptyString(agentId)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: agentId is required and must be a non-empty string.'
      });
    }

    if (!isNonEmptyString(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: userId is required and must be a non-empty string.'
      });
    }

    if (!isNonEmptyString(schemeId)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: schemeId is required and must be a non-empty string.'
      });
    }

    const applicationId = generateApplicationId();
    const newApplication = {
      applicationId,
      agentId: String(agentId).trim(),
      userId: String(userId).trim(),
      schemeId: String(schemeId).trim(),
      applicationData: typeof applicationData === 'object' ? applicationData : {},
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    applicationsStore.set(applicationId, newApplication);

    return res.status(201).json({
      success: true,
      applicationId,
      message: 'Application submitted successfully'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/agent/users/:agentId
 */
function getAgentUsers(req, res, next) {
  try {
    const { agentId } = req.params;

    if (!agentId || agentId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: agentId parameter is required.'
      });
    }

    const normalizedAgentId = String(agentId).trim();
    const userMap = new Map();

    for (const app of applicationsStore.values()) {
      if (app.agentId.toLowerCase() === normalizedAgentId.toLowerCase()) {
        if (!userMap.has(app.userId)) {
          userMap.set(app.userId, {
            userId: app.userId,
            agentId: app.agentId,
            applications: []
          });
        }
        userMap.get(app.userId).applications.push({
          applicationId: app.applicationId,
          schemeId: app.schemeId,
          status: app.status,
          createdAt: app.createdAt
        });
      }
    }

    const users = Array.from(userMap.values());

    return res.status(200).json({
      agentId: normalizedAgentId,
      users
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Helper to retrieve application by ID (used by document generation/tests)
 */
function getApplicationById(applicationId) {
  return applicationsStore.get(applicationId) || null;
}

module.exports = {
  submitApplication,
  getAgentUsers,
  getApplicationById
};
