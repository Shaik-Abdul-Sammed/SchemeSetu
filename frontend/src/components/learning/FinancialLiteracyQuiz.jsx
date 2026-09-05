import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RefreshCw, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Under PMMY MUDRA, is collateral (property/gold) required for loans up to ₹10 Lakhs?',
    options: ['Yes, always mandatory', 'No, MUDRA loans are 100% collateral-free', 'Only for business loans above ₹1 Lakh'],
    correct: 1,
    explanation: 'Correct! Government of India guarantees MUDRA loans under CGFMU, making them completely collateral-free.',
  },
  {
    id: 2,
    question: 'What is the annual financial benefit provided to landholding farmers under PM-KISAN?',
    options: ['₹6,000 in 3 installments of ₹2,000', '₹10,000 one-time yearly grant', '₹2,000 monthly pension'],
    correct: 0,
    explanation: 'Correct! PM-KISAN grants ₹6,000 per year paid in three equal installments of ₹2,000 directly via DBT.',
  },
  {
    id: 3,
    question: 'How much health insurance cover per family per year does Ayushman Bharat (PM-JAY) provide?',
    options: ['₹1 Lakh', '₹5 Lakh', '₹10 Lakh'],
    correct: 1,
    explanation: 'Correct! Ayushman Bharat provides ₹5 Lakh cashless health cover per family per year across empanelled hospitals.',
  },
  {
    id: 4,
    question: 'Which scheme offers 5% concessional loans + ₹15,000 toolkit vouchers to traditional artisans?',
    options: ['PM SVANidhi', 'PM Vishwakarma Scheme', 'Stand-Up India'],
    correct: 1,
    explanation: 'Correct! PM Vishwakarma supports traditional artisans with skill training, ₹15,000 toolkit vouchers, and 5% interest loans.',
  },
  {
    id: 5,
    question: 'What interest subsidy rate is credited on timely repayment of PM SVANidhi street vendor loans?',
    options: ['3%', '5%', '7%'],
    correct: 2,
    explanation: 'Correct! PM SVANidhi grants a 7% interest subsidy directly into the vendor bank account on timely repayment.',
  }
];

export default function FinancialLiteracyQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedOpt(idx);
    setAnswered(true);
    if (idx === q.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setAnswered(false);
    setShowResult(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-4 text-slate-200 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">Financial Literacy & Scheme Quiz</h3>
        </div>
        <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
          Question {currentIdx + 1} / {QUIZ_QUESTIONS.length}
        </span>
      </div>

      {!showResult ? (
        <div>
          <p className="text-sm font-medium text-slate-100 mb-4">{q.question}</p>

          <div className="space-y-2 mb-4">
            {q.options.map((opt, i) => {
              let btnStyle = 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200';
              if (answered) {
                if (i === q.correct) btnStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold';
                else if (i === selectedOpt) btnStyle = 'bg-rose-500/20 border-rose-500/40 text-rose-300';
                else btnStyle = 'opacity-50 bg-slate-800/40 border-slate-800 text-slate-400';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {answered && i === q.correct && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {answered && i === selectedOpt && i !== q.correct && <XCircle className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 mb-4 animate-fade-in">
              <p>{q.explanation}</p>
            </div>
          )}

          {answered && (
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all"
            >
              {currentIdx + 1 < QUIZ_QUESTIONS.length ? 'Next Question →' : 'See Final Results 🏆'}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-lg font-bold text-slate-100">Quiz Completed!</h4>
          <p className="text-sm text-slate-300 my-2">
            You scored <strong className="text-emerald-400 text-base">{score} / {QUIZ_QUESTIONS.length}</strong>
          </p>
          <p className="text-xs text-slate-400 mb-4">
            {score === 5 ? '🌟 Outstanding! You earned the SchemeSetu Master Badge.' : 'Good effort! Review scheme guides to boost your score.'}
          </p>
          <button
            onClick={handleRestart}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Quiz Again
          </button>
        </div>
      )}
    </div>
  );
}
