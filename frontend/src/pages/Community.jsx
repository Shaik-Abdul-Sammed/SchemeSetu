import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, PlusCircle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Community() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/community/questions');
      setQuestions(res.questions || []);
    } catch (e) {
      setQuestions([
        { id: 'q-1', author: 'Ramesh K.', question: 'How long does Mudra loan document verification take at Lead Banks?', upvotes: 14, answers: [{ text: 'Usually 3 to 5 business days.' }] }
      ]);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      await api.post('/community/questions', { question: newQuestion });
      setNewQuestion('');
      fetchQuestions();
    } catch (e) {
      setQuestions([{ id: Date.now(), author: 'You', question: newQuestion, upvotes: 1, answers: [] }, ...questions]);
      setNewQuestion('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="container py-8">
      <h1 style={{ fontSize: '1.75rem', color: '#0B192C', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <MessageSquare style={{ color: '#0284C7' }} size={28} /> Community Q&A & Peer Support
      </h1>
      <p style={{ color: '#64748B', marginBottom: '2rem' }}>
        Ask questions, share loan application experiences, and get advice from VLE agents and fellow citizens.
      </p>

      {/* Post Question Form */}
      <form onSubmit={handlePost} className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '0.75rem' }}>Ask the SchemeSetu Community</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question about scheme eligibility or bank visits..."
            className="form-control"
            required
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            <Send size={16} /> Post
          </button>
        </div>
      </form>

      {/* Questions Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.map((q) => (
          <div key={q.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284C7' }}>
                {q.author} • {q.location || 'India'}
              </div>
              <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                <ThumbsUp size={14} /> {q.upvotes || 1}
              </button>
            </div>

            <h4 style={{ fontSize: '1.05rem', color: '#0B192C', marginBottom: '0.75rem' }}>{q.question}</h4>

            {q.answers && q.answers.length > 0 && (
              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #059669', fontSize: '0.88rem', color: '#334155' }}>
                <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={14} /> {q.answers[0].author || 'Verified Answer'}
                </div>
                {q.answers[0].text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
