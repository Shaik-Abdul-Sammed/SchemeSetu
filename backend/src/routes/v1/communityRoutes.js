const express = require('express');
const router = express.Router();

const mockQuestions = [
  {
    id: 'q-101',
    author: 'Ramesh K.',
    location: 'Warangal',
    question: 'How long does Mudra loan document verification take at Lead Banks?',
    upvotes: 14,
    answers: [
      { author: 'VLE Agent Agent-101', text: 'Usually 3 to 5 business days after document submission.' }
    ]
  },
  {
    id: 'q-102',
    author: 'Priya S.',
    location: 'Chennai',
    question: 'Are there special margin money subsidies for SC women entrepreneurs?',
    upvotes: 22,
    answers: [
      { author: 'SchemeSetu Advisor', text: 'Yes! Stand-Up India provides up to 25% margin money subsidy support.' }
    ]
  }
];

router.get('/questions', (req, res) => {
  res.json({ success: true, questions: mockQuestions });
});

router.post('/questions', (req, res) => {
  const { question, author, location } = req.body;
  const newQ = {
    id: `q-${Date.now()}`,
    author: author || 'Anonymous Citizen',
    location: location || 'India',
    question,
    upvotes: 1,
    answers: []
  };
  mockQuestions.unshift(newQ);
  res.json({ success: true, question: newQ });
});

module.exports = router;
