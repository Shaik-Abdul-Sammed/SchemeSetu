import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Type, 
  FileText, 
  Send, 
  Sparkles, 
  User, 
  ToggleLeft, 
  ToggleRight, 
  MapPin, 
  CheckCircle, 
  Loader2, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { safeGetLocation } from '../utils/capacitor';
import { useLanguage } from '../context/LanguageContext';
import AgentReportModal from '../components/agent/AgentReportModal';

export default function InputHub() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const chatEndRef = useRef(null);

  // Mode Toggle: 'user' (Voice/Chat) vs 'agent' (Fast-Fill Form)
  const [mode, setMode] = useState('user');

  // Conversational Chat State
  const [messages, setMessages] = useState([]);

  const [inputMode, setInputMode] = useState('voice');
  const [textInput, setTextInput] = useState('');
  
  // Voice Assistant Strict State Machine: 'ready' | 'listening' | 'processing' | 'responding' | 'error'
  const [voiceState, setVoiceState] = useState('ready');
  const [voiceError, setVoiceError] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentReportOpen, setAgentReportOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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
    location: 'Hyderabad, Telangana'
  });

  // Web Speech API Refs
  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Map language to speech recognition and synthesis locale
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

  // Set initial welcome greeting in selected language
  useEffect(() => {
    const welcomeText = t('botWelcome', 'Namaste! I am SchemeSetu AI Assistant. What kind of government assistance do you need today? (e.g. business loan, agriculture subsidy, education)');
    setMessages([
      {
        sender: 'bot',
        text: welcomeText
      }
    ]);
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceState]);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech function
  const speakResponse = (text) => {
    if (isMuted || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageLocale();
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      setVoiceState('responding');

      utterance.onend = () => {
        setVoiceState('ready');
      };

      utterance.onerror = () => {
        setVoiceState('ready');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setVoiceState('ready');
    }
  };

  // Single-Turn Voice Input Starter
  const startSingleVoiceTurn = () => {
    if (voiceState === 'listening') {
      stopVoiceRecognition();
      return;
    }

    if (voiceState === 'processing' || voiceState === 'responding') {
      return; // Do not interrupt active processing
    }

    setVoiceError(null);
    setCurrentTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(t('voiceUnsupported', 'Voice recognition is not supported in this browser. Please type your query.'));
      setVoiceState('error');
      return;
    }

    try {
      // Cancel any ongoing speaking
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false; // Accept ONLY ONE single input
      recognition.interimResults = true; // Show live feedback
      recognition.lang = getLanguageLocale();

      recognition.onstart = () => {
        setVoiceState('listening');
        isProcessingRef.current = false;
      };

      recognition.onresult = (event) => {
        const results = event.results;
        const transcript = results[0][0].transcript;
        setCurrentTranscript(transcript);

        // If final result reached, process exactly once
        if (results[0].isFinal && !isProcessingRef.current) {
          isProcessingRef.current = true;
          try {
            recognition.stop();
          } catch (e) {}
          setVoiceState('processing');
          handleUserMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        isProcessingRef.current = false;
        setVoiceState('error');
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceError(t('voicePermissionDenied', 'Microphone permission was denied. Please allow microphone access in your browser settings.'));
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech was detected. Please tap the microphone and speak again.');
        } else {
          setVoiceError(`Speech recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (voiceState === 'listening' && !isProcessingRef.current) {
          if (currentTranscript.trim()) {
            isProcessingRef.current = true;
            setVoiceState('processing');
            handleUserMessage(currentTranscript);
          } else {
            setVoiceState('ready');
          }
        }
      };

      recognition.start();
    } catch (err) {
      setVoiceState('error');
      setVoiceError('Unable to start voice recording. Please use text mode.');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceState('ready');
  };

  // Conversational Flow Logic
  const handleUserMessage = async (text) => {
    if (!text || !text.trim()) {
      setVoiceState('ready');
      return;
    }

    const trimmed = text.trim();
    const updatedMessages = [...messages, { sender: 'user', text: trimmed }];
    setMessages(updatedMessages);
    setTextInput('');
    setCurrentTranscript('');
    setVoiceState('processing');

    const lower = trimmed.toLowerCase();
    let updatedCriteria = { ...criteria };

    // Step 1: Detect Project Type
    if (!updatedCriteria.projectType) {
      if (lower.includes('farm') || lower.includes('agri') || lower.includes('kisan') || lower.includes('crop')) {
        updatedCriteria.projectType = 'agriculture';
      } else if (lower.includes('edu') || lower.includes('scholarship') || lower.includes('study') || lower.includes('college')) {
        updatedCriteria.projectType = 'education';
      } else if (lower.includes('health') || lower.includes('hospital') || lower.includes('medical') || lower.includes('ayushman')) {
        updatedCriteria.projectType = 'healthcare';
      } else {
        updatedCriteria.projectType = 'business';
      }
      setCriteria(updatedCriteria);

      const botReply = `Got it! You are looking for ${updatedCriteria.projectType} assistance. What is your estimated project cost or required loan amount (in ₹)?`;
      setTimeout(() => {
        setMessages([...updatedMessages, { sender: 'bot', text: botReply }]);
        speakResponse(botReply);
      }, 400);
      return;
    }

    // Step 2: Detect Project Cost
    if (!updatedCriteria.cost) {
      const costNum = parseInt(trimmed.replace(/[^0-9]/g, '')) || 300000;
      updatedCriteria.cost = costNum;
      setCriteria(updatedCriteria);

      const botReply = `Understood: Required loan/assistance amount is ₹${costNum.toLocaleString('en-IN')}. What is your annual household family income (in ₹)?`;
      setTimeout(() => {
        setMessages([...updatedMessages, { sender: 'bot', text: botReply }]);
        speakResponse(botReply);
      }, 400);
      return;
    }

    // Step 3: Detect Household Income
    if (!updatedCriteria.income) {
      const incomeNum = parseInt(trimmed.replace(/[^0-9]/g, '')) || 180000;
      updatedCriteria.income = incomeNum;
      setCriteria(updatedCriteria);

      const botReply = `Great! What is your highest education level (e.g., 10th pass, 12th pass, graduate, or diploma)?`;
      setTimeout(() => {
        setMessages([...updatedMessages, { sender: 'bot', text: botReply }]);
        speakResponse(botReply);
      }, 400);
      return;
    }

    // Step 4: Detect Education and Submit Recommendation
    if (!updatedCriteria.education) {
      updatedCriteria.education = trimmed;
      setCriteria(updatedCriteria);

      const botReply = t('calculating', 'Thank you! SchemeSetu is evaluating verified government schemes for you now...');
      setMessages([...updatedMessages, { sender: 'bot', text: botReply }]);
      speakResponse(botReply);

      setTimeout(() => {
        submitRecommendation(updatedCriteria);
      }, 800);
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
    <div style={{ maxWidth: '840px', margin: '0 auto', minHeight: '85vh', display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }} className="container py-4">
      
      {/* Header Bar with Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.15rem', background: '#0B192C', color: '#FFFFFF', borderRadius: '14px', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Go Back">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: 0 }}>{t('tellUsNeed', 'Tell Us About Your Need')}</h2>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{mode === 'user' ? t('convAssistant', 'SchemeSetu Voice Assistant') : t('fastFillAgent', 'CSC / VLE Fast-Fill Portal')}</span>
          </div>
        </div>

        {/* Audio Mute Toggle & Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => {
              if (!isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
              setIsMuted(!isMuted);
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.65rem' }}
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={() => setMode(mode === 'user' ? 'agent' : 'user')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.85rem', borderRadius: '20px', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {mode === 'user' ? <ToggleLeft size={20} style={{ color: '#F59E0B' }} /> : <ToggleRight size={20} style={{ color: '#059669' }} />}
            <span>{mode === 'user' ? t('userMode', 'Citizen Mode') : t('agentMode', 'Agent Mode')}</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 25, 44, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, color: '#FFFFFF', padding: '1rem', textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: '#F59E0B', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>{t('findingBestScheme', 'Finding the best scheme for you...')}</h3>
          <p style={{ color: '#CBD5E1', fontSize: '0.95rem', maxWidth: '450px' }}>{t('analyzingThresholds', 'Analyzing income thresholds, loan margins, and central/state eligibility criteria')}</p>
        </div>
      )}

      {/* USER MODE: Conversational Voice & Chat UI */}
      {mode === 'user' && (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          
          {/* Chat Message Scrollable Container */}
          <div style={{ flexGrow: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px', maxHeight: '480px' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.65rem',
                  width: '100%'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0B192C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
                    <Sparkles size={20} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: msg.sender === 'user' ? '#1E3E62' : '#F1F5F9',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    wordBreak: 'break-word'
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

            {/* Live Recognized Speech Preview Bubble */}
            {voiceState === 'listening' && currentTranscript && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', width: '100%' }}>
                <div style={{ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '18px 18px 4px 18px', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.9rem', fontStyle: 'italic', border: '1px dashed #FCD34D' }}>
                  💬 "{currentTranscript}"
                </div>
              </div>
            )}

            {/* Processing State Indicator */}
            {voiceState === 'processing' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem', paddingLeft: '2.75rem' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: '#0284C7' }} />
                <span>Processing your response...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Voice State Status Indicator Bar */}
          {voiceState === 'listening' && (
            <div style={{ padding: '0.85rem 1.25rem', background: '#FEF3C7', borderTop: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#92400E' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                <span className="animate-pulse" style={{ width: '12px', height: '12px', background: '#DC2626', borderRadius: '50%' }}></span>
                <span>{t('listeningSpeakNow', 'Listening to single input... Speak clearly!')}</span>
              </div>
              <button onClick={stopVoiceRecognition} className="btn btn-sm btn-outline" style={{ color: '#92400E', borderColor: '#FCD34D' }}>
                {t('cancel', 'Done Speaking')}
              </button>
            </div>
          )}

          {voiceError && (
            <div style={{ padding: '0.75rem 1.25rem', background: '#FEF2F2', borderTop: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991B1B', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{voiceError}</span>
              </div>
              <button onClick={() => setVoiceError(null)} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
          )}

          {/* Assistant Action & Input Bar */}
          <div style={{ padding: '1.25rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            
            {/* Prominent Microphone Interaction Button (Single-Turn) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={startSingleVoiceTurn}
                disabled={voiceState === 'processing'}
                className="btn btn-primary"
                style={{
                  borderRadius: '50%',
                  width: '72px',
                  height: '72px',
                  padding: 0,
                  boxShadow: voiceState === 'listening' ? '0 0 0 12px rgba(220, 38, 38, 0.25)' : '0 6px 20px rgba(217, 119, 6, 0.4)',
                  backgroundColor: voiceState === 'listening' ? '#DC2626' : undefined,
                  transition: 'all 0.25s ease',
                  cursor: voiceState === 'processing' ? 'not-allowed' : 'pointer'
                }}
                title={voiceState === 'listening' ? "Tap to finish speaking" : "Tap to Speak (Single Input)"}
                aria-label="Microphone Interaction"
              >
                {voiceState === 'listening' ? <MicOff size={34} /> : <Mic size={34} />}
              </button>

              <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', fontWeight: 700, color: voiceState === 'listening' ? '#DC2626' : '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {voiceState === 'listening' ? (
                  <span>Recording voice input... (Tap when done)</span>
                ) : voiceState === 'processing' ? (
                  <span>Evaluating answer...</span>
                ) : voiceState === 'responding' ? (
                  <span>Assistant speaking...</span>
                ) : (
                  <span>Tap Microphone to Speak</span>
                )}
              </div>
            </div>

            {/* Input Mode Controls & Fallback Text Form */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                onClick={() => setInputMode('voice')}
                className={`btn btn-sm ${inputMode === 'voice' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Mic size={15} /> Voice Mode
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`btn btn-sm ${inputMode === 'text' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Type size={15} /> {t('typeMode', 'Text Mode')}
              </button>
              <button
                onClick={() => setInputMode('scan')}
                className={`btn btn-sm ${inputMode === 'scan' ? 'btn-primary' : 'btn-outline'}`}
              >
                <FileText size={15} /> {t('scanDocMode', 'Scan Doc')}
              </button>
            </div>

            {inputMode === 'text' && (
              <form onSubmit={(e) => { e.preventDefault(); handleUserMessage(textInput); }} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('typeReplyPlaceholder', 'Type your reply (e.g. 300000 for loan)...')}
                  className="form-control"
                  style={{ borderRadius: '24px', flexGrow: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0 1.25rem', flexShrink: 0 }}>
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
