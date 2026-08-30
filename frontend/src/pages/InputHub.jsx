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
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import AgentReportModal from '../components/agent/AgentReportModal';
import { parseUserInput, generateAssistantResponse, getMissingFields, FIELD_LABELS } from '../utils/voiceAssistantEngine';
import { validateAgentProfile, evaluateAgentSchemes } from '../utils/agentValidationEngine';
import { formatIndianCurrency } from '../utils/numberValidator';

export default function InputHub() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { location, locationStatus, errorMessage: locationError, detectCurrentGPSLocation } = useLocation();
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

  // Agent Mode State & Evaluation Results
  const [validationErrors, setValidationErrors] = useState([]);
  const [validatedProfile, setValidatedProfile] = useState(null);
  const [topSchemes, setTopSchemes] = useState([]);
  const [rejectedSchemes, setRejectedSchemes] = useState([]);

  // User Profile Input Criteria Collected
  const [criteria, setCriteria] = useState({
    projectType: '',
    cost: '',
    income: '',
    age: '',
    state: '',
    occupation: '',
    education: ''
  });

  // Agent Mode Fast-Fill State
  const [agentForm, setAgentForm] = useState({
    name: 'Ramesh Kumar',
    age: 32,
    casteCategory: 'SC',
    income: 240000,
    projectType: 'Manufacturing',
    cost: 350000,
    loanRequirement: 250000,
    education: '10th pass',
    occupation: 'Small Business',
    location: 'Hyderabad, Telangana',
    state: 'Telangana'
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

  const hasSpokenGreetingRef = useRef(false);

  const getGreetingText = (currentLang) => {
    switch (currentLang) {
      case 'HI':
        return 'नमस्ते! मैं SchemeSetu हूँ। मैं सरकारी योजनाएं खोजने में आपकी मदद कर सकता हूँ। बताएं आपको क्या चाहिए।';
      case 'TE':
        return 'నమస్కారం! నేను SchemeSetu. మీకు సరైన ప్రభుత్వ పథకాలను కనుగొనడంలో నేను సహాయపడగలను. మీకు ఏమి కావాలో చెప్పండి.';
      case 'TA':
        return 'வணக்கம்! நான் SchemeSetu. அரசு திட்டங்களை கண்டறிய உங்களுக்கு உதவ முடியும். உங்களுக்கு என்ன தேவை என்று சொல்லுங்கள்.';
      case 'KN':
        return 'ನಮಸ್ಕಾರ! ನಾನು SchemeSetu. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ತಿಳಿಸಿ.';
      case 'ML':
        return 'നമസ്കാരം! ഞാൻ SchemeSetu. സർക്കാർ പദ്ധതികൾ കണ്ടെത്താൻ എന്നെക്കൊണ്ട് സഹായിക്കാനാകും. നിങ്ങൾക്ക് എന്താണ് ആവശ്യമെന്ന് പറയുക.';
      case 'BN':
        return 'নমস্কার! আমি SchemeSetu। সরকারি স্কিমগুলি খুঁজে পেতে আমি আপনাকে সাহায্য করতে পারি। আপনার কী প্রয়োজন তা বলুন।';
      case 'MR':
        return 'नमस्कार! मी SchemeSetu आहे. मी सरकारी योजना शोधण्यात मदत करू शकतो. आपल्याला काय हवे आहे ते सांगा.';
      case 'EN':
      default:
        return 'Namaste! I am SchemeSetu. I can help you find government schemes. Tell me what you need (e.g. business loan, farming subsidy, education scholarship).';
    }
  };

  // Set initial welcome greeting in selected language
  useEffect(() => {
    const greetingText = getGreetingText(lang);
    setMessages([
      {
        sender: 'bot',
        text: greetingText,
        isGreeting: true
      }
    ]);

    // Speak aloud once if allowed
    if (!hasSpokenGreetingRef.current && !isMuted) {
      hasSpokenGreetingRef.current = true;
      try {
        speakResponse(greetingText);
      } catch (e) {}
    }
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

  // Conversational Flow Logic with Intelligent Entity & Missing-Information Extraction
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

    // 1. Extract entities and merge with existing criteria
    const updatedCriteria = parseUserInput(trimmed, criteria);
    setCriteria(updatedCriteria);

    // 2. Generate contextual missing-information response in user's selected language
    const botResult = generateAssistantResponse(updatedCriteria, lang);

    setTimeout(() => {
      setMessages([...updatedMessages, { sender: 'bot', text: botResult.text }]);
      speakResponse(botResult.text);

      // If all required information is gathered, transition to scheme recommendations
      if (botResult.isComplete) {
        setTimeout(() => {
          submitRecommendation(updatedCriteria);
        }, 1200);
      }
    }, 450);
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

    const validation = validateAgentProfile(agentForm);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    setValidationErrors([]);
    const evalRes = evaluateAgentSchemes(validation.data);
    setValidatedProfile(validation.data);
    setTopSchemes(evalRes.topSchemes);
    setRejectedSchemes(evalRes.rejectedSchemes);

    try {
      await api.post('/agent/submit', { ...validation.data, agentId: 'agent-101' });
    } catch (err) {
      // Local prototype fallback
    } finally {
      setIsLoading(false);
      setAgentReportOpen(true);
    }
  };

  useEffect(() => {
    if (location && (location.district || location.state)) {
      const locStr = location.district ? `${location.district}, ${location.state}` : location.state;
      setAgentForm(prev => ({
        ...prev,
        location: locStr,
        state: location.state || prev.state
      }));
    }
  }, [location]);

  const handleGpsDetect = () => {
    detectCurrentGPSLocation();
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
          
          {/* Live Extracted Entities Bar */}
          {(criteria.projectType || criteria.income || criteria.age || criteria.state || criteria.occupation || criteria.education) && (
            <div style={{ padding: '0.65rem 1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 700, color: '#475569', marginRight: '0.25rem' }}>Captured Profile:</span>
              {criteria.projectType && <span className="badge badge-cat">🎯 {criteria.projectType}</span>}
              {criteria.income && <span className="badge badge-eligible">💰 ₹{Number(criteria.income).toLocaleString('en-IN')}</span>}
              {criteria.age && <span className="badge badge-central">🎂 {criteria.age} yrs</span>}
              {criteria.state && <span className="badge badge-state">📍 {criteria.state}</span>}
              {criteria.occupation && <span className="badge badge-cat">💼 {criteria.occupation}</span>}
              {criteria.education && <span className="badge badge-central">🎓 {criteria.education}</span>}
            </div>
          )}

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
                    wordBreak: 'break-word',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div>{msg.text}</div>
                  {msg.sender === 'bot' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                      <button
                        onClick={() => speakResponse(msg.text)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284C7',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px'
                        }}
                        title="Listen to this message aloud"
                      >
                        <Volume2 size={13} /> Speak
                      </button>
                    </div>
                  )}
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

              <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', fontWeight: 700, color: voiceState === 'listening' ? '#DC2626' : '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                {voiceState === 'listening' ? (
                  <span>Recording voice input... (Tap when done)</span>
                ) : voiceState === 'processing' ? (
                  <span>Evaluating answer...</span>
                ) : voiceState === 'responding' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Assistant speaking...</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setVoiceState('ready');
                      }}
                      className="btn btn-secondary btn-xs"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: '#DC2626', color: '#DC2626' }}
                    >
                      <VolumeX size={12} /> Stop
                    </button>
                  </div>
                ) : (
                  <span>Tap Microphone to Speak</span>
                )}

                {/* ⚡ 1-CLICK SIH DEMO VOICE FLOW BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    handleUserMessage('I want a loan for my small business in Andhra Pradesh with annual income three lakh rupees.');
                  }}
                  className="btn btn-secondary btn-xs"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    borderColor: '#F59E0B',
                    color: '#D97706',
                    marginTop: '0.4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    borderRadius: '20px',
                    padding: '0.25rem 0.75rem'
                  }}
                >
                  <Sparkles size={12} /> ⚡ 1-Click SIH Voice Demo Flow
                </button>
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
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#0B192C', margin: 0 }}>
                CSC / VLE Agent Beneficiary Intake Form
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                All inputs are strictly validated prior to running recommendation algorithms or generating reports.
              </p>
            </div>

            {/* Validation Errors Box */}
            {validationErrors.length > 0 && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '1rem 1.25rem', borderRadius: '10px', color: '#991B1B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <AlertCircle size={18} />
                  <span>Agent Analysis Blocked ({validationErrors.length} issues need correction):</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('fullName', 'Beneficiary Full Name')} *</label>
                <input
                  type="text"
                  value={agentForm.name}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('ageInYears', 'Age')} (18-100) *</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={agentForm.age}
                  onChange={(e) => setAgentForm({ ...agentForm, age: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Social Category / Caste *</label>
                <select
                  value={agentForm.casteCategory}
                  onChange={(e) => setAgentForm({ ...agentForm, casteCategory: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                  <option value="General">General Category</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('annualIncomeLabel', 'Annual Household Income (₹)')} *</label>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  value={agentForm.income}
                  onChange={(e) => setAgentForm({ ...agentForm, income: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 240000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('projectCostLabel', 'Total Project / Enterprise Cost (₹)')} *</label>
                <input
                  type="number"
                  min="1000"
                  max="50000000"
                  value={agentForm.cost}
                  onChange={(e) => setAgentForm({ ...agentForm, cost: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 350000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Loan Requirement (₹) *</label>
                <input
                  type="number"
                  min="1000"
                  max="50000000"
                  value={agentForm.loanRequirement}
                  onChange={(e) => setAgentForm({ ...agentForm, loanRequirement: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 250000"
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
                  <option value="Small Business">Small Business / Enterprise</option>
                  <option value="Farmer">Farmer / Agriculture</option>
                  <option value="Artisan">Traditional Artisan</option>
                  <option value="Vendor">Street Vendor</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Location / State *</label>
                  {locationStatus === 'detecting' && (
                    <span style={{ fontSize: '0.74rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Loader2 size={12} className="animate-spin" /> Detecting GPS...
                    </span>
                  )}
                  {locationStatus === 'detected' && location.isGPS && (
                    <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                      ✓ GPS Detected
                    </span>
                  )}
                  {locationStatus === 'denied' && (
                    <span style={{ fontSize: '0.74rem', color: '#DC2626' }}>
                      GPS Permission Denied
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={agentForm.location}
                    onChange={(e) => setAgentForm({ ...agentForm, location: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Hyderabad, Telangana"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={handleGpsDetect} 
                    className="btn btn-secondary btn-sm" 
                    title="Detect Current GPS Location"
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <MapPin size={15} style={{ color: location.isGPS ? '#059669' : '#D97706' }} />
                    <span style={{ fontSize: '0.8rem' }}>GPS</span>
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
        validatedProfile={validatedProfile}
        topSchemes={topSchemes}
        rejectedSchemes={rejectedSchemes}
      />
    </div>
  );
}
