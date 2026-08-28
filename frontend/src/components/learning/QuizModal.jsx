import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award } from 'lucide-react';

export default function QuizModal({ isOpen, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      question: 'What is a moratorium period in a government loan scheme?',
      options: ['Extra penalty period', 'Grace period before monthly repayment starts', 'Fixed processing fee', 'Interest waiver for life'],
      correct: 1
    },
    {
      question: 'Is collateral or property required for PMMY Kishore Mudra loans up to ₹5 Lakhs?',
      options: ['Yes, house property mandatory', 'No, collateral-free credit guarantee', 'Yes, gold deposit mandatory', 'Only 50% collateral required'],
      correct: 1
    }
  ];

  if (!isOpen) return null;

  const handleOptionClick = (index) => {
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,25,44,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div className="card glass-card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#0B192C', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle style={{ color: '#0284C7' }} size={22} /> Financial Literacy Quiz
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-outline">✕</button>
        </div>

        {!showResult ? (
          <div>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
              Q{currentQuestion + 1}: {questions[currentQuestion].question}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {questions[currentQuestion].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className="btn btn-outline"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.75rem', fontSize: '0.88rem' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <Award size={48} style={{ color: '#F59E0B', margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '1.3rem', color: '#0B192C', marginBottom: '0.25rem' }}>Quiz Completed!</h4>
            <p style={{ color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>Score: {score} / {questions.length}</p>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.25rem' }}>You earned the 'EMI Genius' Badge!</p>
            <button onClick={onClose} className="btn btn-primary">Claim Badge & Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
