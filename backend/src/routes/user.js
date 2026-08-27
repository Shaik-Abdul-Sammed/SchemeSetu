const express = require('express');
const router = express.Router();
const schemesData = require('../data/schemesData');
const { authenticateToken } = require('../middleware/auth');

// In-memory User Isolation Stores
const savedSchemesMap = {};
const userApplicationsMap = {};

const userNotifications = [
  {
    id: "notif_1",
    title: "PM-KISAN 17th Installment Release",
    message: "The 17th installment of PM-KISAN has been processed into eligible bank accounts.",
    date: "2026-08-25",
    read: false
  },
  {
    id: "notif_2",
    title: "Application Status Update",
    message: "Your application for PM-KISAN has moved to Document Verification stage.",
    date: "2026-08-20",
    read: true
  }
];

// Helper to get authenticated user ID
function getUserId(req) {
  return req.user ? req.user.id : (req.headers['x-user-id'] || 'guest');
}

// GET /api/v1/user/saved-schemes - Protected
router.get('/saved-schemes', authenticateToken, (req, res) => {
  const userId = getUserId(req);
  const savedIds = savedSchemesMap[userId] || [];
  const saved = schemesData.filter(s => savedIds.includes(s.id));
  return res.status(200).json({ success: true, count: saved.length, data: saved });
});

// POST /api/v1/user/saved-schemes - Toggle Bookmark Protected
router.post('/saved-schemes', authenticateToken, (req, res) => {
  const userId = getUserId(req);
  const { schemeId } = req.body;

  if (!schemeId) {
    return res.status(400).json({ success: false, error: "Scheme ID is required." });
  }

  if (!savedSchemesMap[userId]) {
    savedSchemesMap[userId] = [];
  }

  const list = savedSchemesMap[userId];
  const index = list.indexOf(schemeId);
  let isSaved = false;

  if (index > -1) {
    list.splice(index, 1);
    isSaved = false;
  } else {
    list.push(schemeId);
    isSaved = true;
  }

  return res.status(200).json({
    success: true,
    isSaved,
    message: isSaved ? "Scheme saved to bookmarks." : "Scheme removed from bookmarks."
  });
});

// GET /api/v1/user/applications - Protected
router.get('/applications', authenticateToken, (req, res) => {
  const userId = getUserId(req);
  const apps = userApplicationsMap[userId] || [];
  return res.status(200).json({ success: true, count: apps.length, data: apps });
});

// POST /api/v1/user/applications - Submit Application Protected
router.post('/applications', authenticateToken, (req, res) => {
  const userId = getUserId(req);
  const { schemeId, notes } = req.body;

  const scheme = schemesData.find(s => s.id === schemeId);
  if (!scheme) {
    return res.status(404).json({ success: false, error: "Scheme not found." });
  }

  if (!userApplicationsMap[userId]) {
    userApplicationsMap[userId] = [];
  }

  const newApp = {
    id: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    schemeId,
    schemeName: scheme.name,
    appliedDate: new Date().toISOString().split('T')[0],
    status: "Under Review",
    step: "Initial Verification",
    remarks: notes || "Application recorded in SchemeSetu portal."
  };

  userApplicationsMap[userId].unshift(newApp);

  return res.status(201).json({
    success: true,
    message: "Application recorded successfully.",
    data: newApp
  });
});

// GET /api/v1/user/notifications - Protected
router.get('/notifications', authenticateToken, (req, res) => {
  return res.status(200).json({ success: true, data: userNotifications });
});

module.exports = router;
