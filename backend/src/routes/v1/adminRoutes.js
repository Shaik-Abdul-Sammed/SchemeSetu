const express = require('express');
const router = express.Router();

let dynamicSchemes = [
  { id: 'scheme-001', name: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore', category: 'Micro Enterprise', maxLoan: 500000 },
  { id: 'scheme-002', name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', category: 'Agriculture', maxLoan: 300000 }
];

router.get('/schemes', (req, res) => {
  res.json({ success: true, schemes: dynamicSchemes });
});

router.post('/schemes', (req, res) => {
  const { name, category, maxLoan } = req.body;
  const newScheme = {
    id: `scheme-${Date.now()}`,
    name,
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

module.exports = router;
