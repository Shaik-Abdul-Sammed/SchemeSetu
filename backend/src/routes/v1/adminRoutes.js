const express = require('express');
const router = express.Router();
const { getRecentAuditEvents } = require('../../services/auditLogger');
const schemesData = require('../../data/schemesData');

let dynamicSchemes = [
  { id: 'scheme-001', name: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore', category: 'Micro Enterprise', maxLoan: 500000 },
  { id: 'scheme-002', name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', category: 'Agriculture', maxLoan: 300000 }
];

router.get('/schemes', (req, res) => {
  res.json({ success: true, count: schemesData.length, schemes: schemesData });
});

router.post('/schemes', (req, res) => {
  const { name, category, maxLoan } = req.body;
  const newScheme = {
    id: `scheme-${Date.now()}`,
    name: name || 'Demo Added Scheme',
    category: category || 'General Welfare',
    maxLoan: Number(maxLoan) || 200000
  };
  dynamicSchemes.push(newScheme);
  res.json({ success: true, scheme: newScheme });
});

router.delete('/schemes/:id', (req, res) => {
  dynamicSchemes = dynamicSchemes.filter(s => s.id !== req.params.id);
  res.json({ success: true, message: 'Scheme deleted' });
});

// GET /api/v1/admin/audit-logs - Retrieve masked security and operational audit logs
router.get('/audit-logs', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  const type = req.query.type || null;
  const events = getRecentAuditEvents(limit, type);
  return res.status(200).json({
    success: true,
    count: events.length,
    events
  });
});

// GET /api/v1/admin/stats - System health & dataset statistics
router.get('/stats', (req, res) => {
  return res.status(200).json({
    success: true,
    totalSchemes: schemesData.length,
    verifiedSchemes: schemesData.filter(s => s.dataStatus === 'VERIFIED').length,
    centralSchemes: schemesData.filter(s => s.level === 'Central').length,
    stateSchemes: schemesData.filter(s => s.level === 'State').length,
    supportedLanguages: 10,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
