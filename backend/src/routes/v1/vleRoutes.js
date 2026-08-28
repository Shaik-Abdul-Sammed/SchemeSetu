const express = require('express');
const router = express.Router();

const mockVleData = {
  vleId: 'VLE-TEL-8091',
  name: 'Kavitha Reddy',
  centerName: 'CSC Warangal Digital Seva Kendra',
  totalApplications: 38,
  approvedApplications: 29,
  commissionEarned: 14500, // ₹500 per approved application
  recentRegistrations: [
    { name: 'Ramesh K.', scheme: 'PMMY Kishore', status: 'Approved', commission: 500 },
    { name: 'Srinivas M.', scheme: 'PM-KISAN', status: 'Under Review', commission: 0 }
  ]
};

router.get('/dashboard', (req, res) => {
  res.json({ success: true, vle: mockVleData });
});

module.exports = router;
