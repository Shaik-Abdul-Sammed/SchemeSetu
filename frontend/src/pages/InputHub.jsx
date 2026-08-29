import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Type, FileText, Send, Sparkles, User, ToggleLeft, ToggleRight, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { safeGetLocation } from '../utils/capacitor';
import { useLanguage } from '../context/LanguageContext';
import AgentReportModal from '../components/agent/AgentReportModal';

export default function InputHub() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const chatEndRef = useRef(null);

  // Mode Toggle: 'user' (Chat) vs 'agent' (Fast-Fill Form)
  const [mode, setMode] = useState('user');

  // Conversational Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: t('botWelcome', 'Namaste! I am SchemeSakhi. What kind of help do you need today? (e.g., business loan, agriculture, education)')
    }
  ]);

  const [inputMode, setInputMode] = useState('voice');
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentReportOpen, setAgentReportOpen] = useState(false);

  // User Profile Input Criteria Collected
  const [criteria, setCriteria] = useState({
    projectType: '',
    cost: '',
    income: '',
    education: '',
    occupation: ''
  });

  // Agent Mode Fast-Fill State
  const [agentForm, setAgentForm] = useState({
    name: 'Ramesh Kumar',
    age: 32,
    income: 240000,
    projectType: 'manufacturing',
    cost: 350000,
    education: '10th pass',
    occupation: 'Farmer',
    location: 'Chennai, Tamil Nadu'
  });

  // Web Speech API Voice Recognition
  const recognitionRef = useRef(null);

  const getLanguageLocale = () => {
    switch (lang) {
      case 'HI': return 'hi-IN';
      case 'TE': return 'te-IN';
      case 'TA': return 'ta-IN';
      case 'KN': return 'kn-IN';
      case 'ML': return 'ml-IN';
      case 'BN': return 'bn-IN';
      case 'MR': return 'mr-IN';
      case 'EN':
      default: return 'en-IN';
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = getLanguageLocale();

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleUserMessage(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startVoiceRecognition = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      try {
        recognitionRef.current.lang = getLanguageLocale();
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    } else {
      alert(t('voiceUnsupported', 'Voice recognition is not supported in this browser. Please use text input.'));
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  const handleUserMessage = async (text) => {
    if (!text.trim()) return;

    const updatedMessages = [...messages, { sender: 'user', text }];
    setMessages(updatedMessages);
    setTextInput('');

    const lower = text.toLowerCase();
    let updatedCriteria = { ...criteria };

    if (!updatedCriteria.projectType) {
      updatedCriteria.projectType = lower.includes('farm') || lower.includes('agri') ? 'agriculture' : (lower.includes('edu') ? 'education' : 'business');
      setCriteria(updatedCriteria);
      setMessages([...updatedMessages, { sender: 'bot', text: `Got it! You are looking for ${updatedCriteria.projectType} assistance. What is your estimated project cost or required loan amount (in ₹)?` }]);
      return;
    }

    if (!updatedCriteria.cost) {
      const costNum = parseInt(text.replace(/[^0-9]/g, '')) || 250000;
      updatedCriteria.cost = costNum;
      setCriteria(updatedCriteria);
      setMessages([...updatedMessages, { sender: 'bot', text: `Understood: Required loan amount is ₹${costNum.toLocaleString('en-IN')}. What is your annual household income (in ₹)?` }]);
      return;
    }

    if (!updatedCriteria.income) {
      const incomeNum = parseInt(text.replace(/[^0-9]/g, '')) || 180000;
      updatedCriteria.income = incomeNum;
      setCriteria(updatedCriteria);
      setMessages([...updatedMessages, { sender: 'bot', text: `Great! What is your highest education level (e.g., 10th pass, 12th pass, graduate)?` }]);
      return;
    }

    if (!updatedCriteria.education) {
      updatedCriteria.education = text;
      setCriteria(updatedCriteria);
      setMessages([...updatedMessages, { sender: 'bot', text: t('calculating', 'Thank you! Evaluating eligible schemes for you now...') }]);
      await submitRecommendation(updatedCriteria);
    }
  };

  const submitRecommendation = async (finalCriteria) => {
    setIsLoading(true);
    try {
      const res = await api.post('/schemes/recommend', {
        income: finalCriteria.income || 200000,
        cost: finalCriteria.cost || 300000,
        education: finalCriteria.education || '10th pass',
        projectType: finalCriteria.projectType || 'business',
        occupation: finalCriteria.occupation || 'Farmer'
      });

      const schemes = res.schemes || res.data || [];
      navigate('/results', { state: { schemes, criteria: finalCriteria } });
    } catch (err) {
      navigate('/results', { state: { criteria: finalCriteria } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/agent/submit', { ...agentForm, agentId: 'agent-101' });
      setIsLoading(false);
      setAgentReportOpen(true);
    } catch (err) {
      setIsLoading(false);
      setAgentReportOpen(true);
    }
  };

  const handleGpsDetect = async () => {
    const loc = await safeGetLocation();
    setAgentForm({ ...agentForm, location: `Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}` });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', minHeight: '85vh', display: 'flex', flexDirection: 'column' }} className="container py-4">
      {/* Header Bar with Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#0B192C', color: '#FFFFFF', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Go Back">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF', margin: 0 }}>{t('tellUsNeed', 'Tell Us About Your Need')}</h2>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{mode === 'user' ? t('convAssistant', 'Conversational AI Assistant') : t('fastFillAgent', 'Fast-Fill Agent Portal')}</span>
          </div>
        </div>

        {/* Mode Switcher */}
        <button
          onClick={() => setMode(mode === 'user' ? 'agent' : 'user')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.85rem', borderRadius: '20px', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          {mode === 'user' ? <ToggleLeft size={22} style={{ color: '#F59E0B' }} /> : <ToggleRight size={22} style={{ color: '#059669' }} />}
          <span>{mode === 'user' ? t('userMode', 'User Mode') : t('agentMode', 'Agent Mode')}</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 25, 44, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, color: '#FFFFFF' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: '#F59E0B', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF' }}>{t('findingBestScheme', 'Finding the best scheme for you...')}</h3>
          <p style={{ color: '#CBD5E1', fontSize: '0.95rem' }}>{t('analyzingThresholds', 'Analyzing income thresholds, loan margins, and eligibility criteria')}</p>
        </div>
      )}

      {/* USER MODE: Conversational Chat UI */}
      {mode === 'user' && (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ flexGrow: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px', maxHeight: '500px' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justify: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.65rem'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0B192C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
                    <Sparkles size={20} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '75%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: msg.sender === 'user' ? '#1E3E62' : '#F1F5F9',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}
                >
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                    <User size={20} />
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Voice Active Indicator */}
          {isListening && (
            <div style={{ padding: '0.85rem', background: '#FEF3C7', borderTop: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#92400E' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <span className="animate-pulse" style={{ width: '12px', height: '12px', background: '#DC2626', borderRadius: '50%' }}></span>
                {t('listeningSpeakNow', 'Listening to your voice... Speak now!')}
              </div>
              <button onClick={stopVoiceRecognition} className="btn btn-sm btn-outline">{t('cancel', 'Cancel')}</button>
            </div>
          )}

          {/* Input Bar */}
          <div style={{ padding: '1rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <button
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                className="btn btn-primary"
                style={{
                  borderRadius: '50%',
                  width: '64px',
                  height: '64px',
                  padding: 0,
                  boxShadow: isListening ? '0 0 0 10px rgba(217, 119, 6, 0.3)' : '0 4px 16px rgba(217, 119, 6, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                title={t('voiceSearch', 'Speak using Voice Input')}
                aria-label={t('voiceSearch', 'Speak using Voice Input')}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>

              <button
                onClick={() => setInputMode('text')}
                className={`btn btn-sm ${inputMode === 'text' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Type size={16} /> {t('typeMode', 'Type')}
              </button>

              <button
                onClick={() => setInputMode('scan')}
                className={`btn btn-sm ${inputMode === 'scan' ? 'btn-primary' : 'btn-outline'}`}
              >
                <FileText size={16} /> {t('scanDocMode', 'Scan Doc')}
              </button>
            </div>

            {inputMode === 'text' && (
              <form onSubmit={(e) => { e.preventDefault(); handleUserMessage(textInput); }} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('typeReplyPlaceholder', 'Type your reply...')}
                  className="form-control"
                  style={{ borderRadius: '24px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0 1.25rem' }}>
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AGENT MODE: Fast-Fill Intake Form */}
      {mode === 'agent' && (
        <div className="card" style={{ flexGrow: 1 }}>
          <form onSubmit={handleAgentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '0.5rem' }}>
              CSC / VLE Agent Beneficiary Intake Form
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('fullName', 'Beneficiary Full Name')}</label>
                <input
                  type="text"
                  value={agentForm.name}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('ageInYears', 'Age')}</label>
                <input
                  type="number"
                  value={agentForm.age}
                  onChange={(e) => setAgentForm({ ...agentForm, age: Number(e.target.value) })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('annualIncomeLabel', 'Annual Household Income (₹)')}</label>
                <input
                  type="number"
                  value={agentForm.income}
                  onChange={(e) => setAgentForm({ ...agentForm, income: Number(e.target.value) })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('projectCostLabel', 'Project / Loan Cost (₹)')}</label>
                <input
                  type="number"
                  value={agentForm.cost}
                  onChange={(e) => setAgentForm({ ...agentForm, cost: Number(e.target.value) })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('primaryOccupation', 'Primary Occupation')}</label>
                <select
                  value={agentForm.occupation}
                  onChange={(e) => setAgentForm({ ...agentForm, occupation: e.target.value })}
                  className="form-select"
                >
                  <option value="Farmer">Farmer / Agriculture</option>
                  <option value="Artisan">Traditional Artisan</option>
                  <option value="Vendor">Street Vendor</option>
                  <option value="Business">Small Business</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">GPS Location</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={agentForm.location}
                    readOnly
                    className="form-control"
                  />
                  <button type="button" onClick={handleGpsDetect} className="btn btn-secondary btn-sm" title="Detect GPS">
                    <MapPin size={16} />
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-green btn-lg" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              <CheckCircle size={20} /> Generate Official Beneficiary Recommendation Dossier
            </button>
          </form>
        </div>
      )}

      {/* Agent Report Modal */}
      <AgentReportModal
        isOpen={agentReportOpen}
        onClose={() => setAgentReportOpen(false)}
        formData={agentForm}
      />
    </div>
  );
}
