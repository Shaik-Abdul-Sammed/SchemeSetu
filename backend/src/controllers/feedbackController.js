const { isValidRating, isNonEmptyString } = require('../utils/validators');

// In-memory feedback storage
const feedbackStore = [];

/**
 * POST /api/v1/feedback
 */
function submitFeedback(req, res, next) {
  try {
    const { userId, schemeId, rating, comment = '' } = req.body || {};

    if (!isValidRating(rating)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: rating is required and must be an integer between 1 and 5.'
      });
    }

    if (!isNonEmptyString(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: userId is required.'
      });
    }

    if (!isNonEmptyString(schemeId)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: schemeId is required.'
      });
    }

    const feedbackId = `FB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFeedback = {
      feedbackId,
      userId: String(userId).trim(),
      schemeId: String(schemeId).trim(),
      rating: Number(rating),
      comment: String(comment || '').trim(),
      createdAt: new Date().toISOString()
    };

    feedbackStore.push(newFeedback);

    return res.status(201).json({
      success: true,
      feedbackId,
      message: 'Feedback submitted successfully'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/feedback (Helper to view feedback if needed)
 */
function getFeedbacks(req, res, next) {
  try {
    const { schemeId } = req.query;
    let list = feedbackStore;
    if (schemeId) {
      list = list.filter(f => f.schemeId === String(schemeId).trim());
    }
    return res.status(200).json({
      feedbacks: list,
      total: list.length
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitFeedback,
  getFeedbacks
};
