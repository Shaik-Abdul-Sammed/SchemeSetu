import React, { useState } from 'react';
import { MessageSquare, Star, CheckCircle, X } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-200 shadow-2xl relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xs"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Citizen Service Feedback</h3>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-2">Rate your experience:</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      star <= rating ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-slate-600 bg-slate-800 border-slate-700'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Feedback / Suggestions:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us how we can improve SchemeSetu..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Submit Feedback
            </button>
          </form>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <h4 className="text-base font-bold text-slate-100">Thank You!</h4>
            <p className="text-xs text-slate-400 mt-1">Your feedback helps us continuously improve SchemeSetu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
